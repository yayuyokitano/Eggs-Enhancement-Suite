/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const path = require("path");
const extensionLoader = require("cypress-browser-extension-plugin/loader");
const dist = path.resolve(__dirname, "..", "..", "dist");

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("before:browser:launch", async (browser, launchOptions) => {
    const loader = extensionLoader.load({
      source: dist,
      skipHooks: true,
    });

    const args = await loader(browser, []);

    launchOptions.args.push(...args);

    return launchOptions;
  });
}
