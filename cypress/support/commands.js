// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//Copied from https://gist.github.com/greg-hoarau/5e6b705ccd24b06a85ba45f226f20558
Cypress.Commands.add('switchToFrame', { prevSubject: 'element' }, ($iframe, callback = () => {}) => {
  Cypress.log({
    name: 'switchToFrame',
    message: '',
  });

  const waitForFrameLoading = () => {
    return new Cypress.Promise((resolve, reject) => {
      onIframeReady($iframe[0], resolve, reject);
    });
  };

  cy.wrap(null, { log: false }).then(() => {
    // return a promise to cy.then() that
    // is awaited until it resolves
    return waitForFrameLoading().then((iframeDoc) => {
      expect(iframeDoc).to.exist;
      cy.wrap(iframeDoc, { log: false }).within({ log: false }, callback);
    });
  });
});

/**
 * Callback when the iframe is ready
 * @callback onIframeReadySuccessCallback
 * @param {HTMLDocument} contents - The contentDocument of the iframe
 */
/**
 * Callback if the iframe can't be accessed
 * @callback onIframeReadyErrorCallback
 */
/**
 * Calls the callback if the specified iframe is ready for DOM access
 * @param  {HTMLIFrameElement} ifr - The iframe DOM element
 * @param  {onIframeReadySuccessCallback} successFn - Success
 * callback
 * @param {onIframeReadyErrorCallback} errorFn - Error callback
 * @see {@link http://stackoverflow.com/a/36155560/3894981} for
 * background information
 */
const onIframeReady = (ifr, successFn, errorFn) => {
  try {
    if (isIframeReadyStateComplete(ifr)) {
      if (isIframeBlank(ifr)) {
        observeIframeLoad(ifr, successFn, errorFn);
      } else {
        getIframeContents(ifr, successFn, errorFn);
      }
    } else {
      observeIframeLoad(ifr, successFn, errorFn);
    }
  } catch (e) {
    // accessing document failed
    errorFn();
  }
};

/**
 * Checks if an iframe readyState is complete
 * @param {HTMLIFrameElement} ifr - The iframe DOM element
 * @return {boolean}
 */
const isIframeReadyStateComplete = (ifr) => {
  try {
    return ifr.contentWindow.document.readyState === 'complete';
  } catch (err) {
    return false;
  }
};

/**
 * Checks if an iframe is empty (if about:blank is the shown page)
 * @param {HTMLIFrameElement} ifr - The iframe DOM element
 * @return {boolean}
 */
const isIframeBlank = (ifr) => {
  const bl = 'about:blank',
    src = ifr.getAttribute('src').trim(),
    href = ifr.contentWindow.location.href;
  return href === bl && src !== bl && !!src;
};

/**
 * @callback observeIframeLoadErrorCallback
 */
/**
 * Observes the onload event of an iframe and calls the success callback or
 * the error callback if the iframe is inaccessible. If the event isn't
 * fired within the specified Cypress.config('defaultCommandTimeout'),
 * then it'll call the error callback too
 * @param {HTMLIFrameElement} ifr - The iframe DOM element
 * @param {getIframeContentsSuccessCallback} successFn
 * @param {observeIframeLoadErrorCallback} errorFn
 */
const observeIframeLoad = (ifr, successFn, errorFn) => {
  let called = false,
    tout = null;
  const listener = () => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(tout);
    try {
      if (!isIframeBlank(ifr)) {
        ifr.removeEventListener('load', listener);
        getIframeContents(ifr, successFn, errorFn);
      }
    } catch (e) {
      // isIframeBlank maybe throws throws an error
      errorFn();
    }
  };
  ifr.addEventListener('load', listener);
  tout = setTimeout(listener, Cypress.config('defaultCommandTimeout'));
};

/**
 * @callback getIframeContentsSuccessCallback
 * @param {HTMLDocument} contents - The contentDocument of the iframe
 */
/**
 * @callback getIframeContentsErrorCallback
 */
/**
 * Calls the success callback function with the iframe document. If it can't
 * be accessed it calls the error callback function
 * @param {HTMLIFrameElement} ifr - The iframe DOM element
 * @param {getIframeContentsSuccessCallback} successFn
 * @param {getIframeContentsErrorCallback} [errorFn]
 * @access protected
 */
const getIframeContents = (ifr, successFn, errorFn = () => {}) => {
  let doc;
  try {
    const ifrWin = ifr.contentWindow;
    doc = ifrWin.document;
    if (!ifrWin || !doc) {
      // no permission = null. Undefined in Phantom
      throw new Error('iframe inaccessible');
    }
  } catch (e) {
    errorFn();
  }
  if (doc) {
    successFn(doc);
  }
};