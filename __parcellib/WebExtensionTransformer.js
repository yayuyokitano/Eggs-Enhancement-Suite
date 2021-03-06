"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _plugin() {
  const data = require("@parcel/plugin");

  _plugin = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _jsonSourcemap() {
  const data = require("@mischnic/json-sourcemap");

  _jsonSourcemap = function () {
    return data;
  };

  return data;
}

function _contentSecurityPolicyParser() {
  const data = _interopRequireDefault(require("content-security-policy-parser"));

  _contentSecurityPolicyParser = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("@parcel/utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _diagnostic() {
  const data = _interopRequireWildcard(require("@parcel/diagnostic"));

  _diagnostic = function () {
    return data;
  };

  return data;
}

var _schema = require("./schema");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEP_LOCS = [['icons'], ['browser_action', 'default_icon'], ['browser_action', 'default_popup'], ['page_action', 'default_icon'], ['page_action', 'default_popup'], ['action', 'default_icon'], ['action', 'default_popup'], ['background', 'scripts'], ['chrome_url_overrides'], ['devtools_page'], ['options_ui', 'page'], ['sidebar_action', 'default_icon'], ['sidebar_action', 'default_panel'], ['storage', 'managed_schema'], ['theme', 'images', 'theme_frame'], ['theme', 'images', 'additional_backgrounds'], ['user_scripts', 'api_script']];

async function collectDependencies(asset, program, ptrs, hot) {
  var _program$browserActio;

  const fs = asset.fs;
  const filePath = asset.filePath;

  const assetDir = _path().default.dirname(filePath);

  const isMV2 = program.manifest_version == 2;
  delete program.$schema;

  if (program.default_locale) {
    const locales = _path().default.join(assetDir, '_locales');

    let err = !(await fs.exists(locales)) ? 'key' : !(await fs.exists(_path().default.join(locales, program.default_locale, 'messages.json'))) ? 'value' : null;

    if (err) {
      throw new (_diagnostic().default)({
        diagnostic: [{
          message: 'Invalid Web Extension manifest',
          origin: '@parcel/transformer-webextension',
          codeFrames: [{
            filePath,
            codeHighlights: [{ ...(0, _diagnostic().getJSONSourceLocation)(ptrs['/default_locale'], err),
              message: (0, _diagnostic().md)`Localization ${err == 'value' ? 'file for ' + program.default_locale : 'directory'} does not exist: ${_path().default.relative(assetDir, _path().default.join(locales, program.default_locale))}`
            }]
          }]
        }]
      });
    }

    for (const locale of await fs.readdir(locales)) {
      if (await fs.exists(_path().default.join(locales, locale, 'messages.json'))) {
        asset.addURLDependency(`_locales/${locale}/messages.json`, {
          needsStableName: true,
          pipeline: 'raw'
        });
      }
    }
  }

  let needRuntimeBG = false;

  if (program.content_scripts) {
    for (let i = 0; i < program.content_scripts.length; ++i) {
      const sc = program.content_scripts[i];

      for (const k of ['css', 'js']) {
        const assets = sc[k] || [];

        for (let j = 0; j < assets.length; ++j) {
          assets[j] = asset.addURLDependency(assets[j], {
            bundleBehavior: 'isolated',
            loc: {
              filePath,
              ...(0, _diagnostic().getJSONSourceLocation)(ptrs[`/content_scripts/${i}/${k}/${j}`], 'value')
            }
          });
        }
      }

      if (hot && sc.js && sc.js.length) {
        needRuntimeBG = true;
        sc.js.push(asset.addURLDependency('./runtime/autoreload.js', {
          resolveFrom: __filename
        }));
      }
    }
  }

  if (program.declarative_net_request) {
    for (let i = 0; i < program.declarative_net_request.rule_resources.length; ++i) {
      const rule = program.declarative_net_request.rule_resources[i];
      const sourceLoc = (0, _diagnostic().getJSONSourceLocation)(ptrs[`/declarative_net_request/rule_resources/${i}/path`], 'value');
      const loc = {
        filePath,
        ...sourceLoc
      };
      const ruleFile = rule.path;

      if (_path().default.extname(ruleFile) != '.json') {
        throw new (_diagnostic().default)({
          diagnostic: [{
            message: 'Invalid Web Extension manifest',
            origin: '@parcel/transformer-webextension',
            codeFrames: [{
              filePath,
              codeHighlights: [{ ...sourceLoc,
                message: 'Declarative net request rules must be .json files'
              }]
            }]
          }]
        });
      }

      program.declarative_net_request.rule_resources[i].path = asset.addURLDependency(ruleFile, {
        bundleBehavior: "isolated",
        loc,
        pipeline: "raw"
      });
    }
  }

  if (program.dictionaries) {
    for (const dict in program.dictionaries) {
      const sourceLoc = (0, _diagnostic().getJSONSourceLocation)(ptrs[`/dictionaries/${dict}`], 'value');
      const loc = {
        filePath,
        ...sourceLoc
      };
      const dictFile = program.dictionaries[dict];

      if (_path().default.extname(dictFile) != '.dic') {
        throw new (_diagnostic().default)({
          diagnostic: [{
            message: 'Invalid Web Extension manifest',
            origin: '@parcel/transformer-webextension',
            codeFrames: [{
              filePath,
              codeHighlights: [{ ...sourceLoc,
                message: 'Dictionaries must be .dic files'
              }]
            }]
          }]
        });
      }

      program.dictionaries[dict] = asset.addURLDependency(dictFile, {
        needsStableName: true,
        loc
      });
      asset.addURLDependency(dictFile.slice(0, -4) + '.aff', {
        needsStableName: true,
        loc
      });
    }
  }

  const browserActionName = isMV2 ? 'browser_action' : 'action';

  if ((_program$browserActio = program[browserActionName]) !== null && _program$browserActio !== void 0 && _program$browserActio.theme_icons) {
    for (let i = 0; i < program[browserActionName].theme_icons.length; ++i) {
      const themeIcon = program[browserActionName].theme_icons[i];

      for (const k of ['light', 'dark']) {
        const loc = (0, _diagnostic().getJSONSourceLocation)(ptrs[`/${browserActionName}/theme_icons/${i}/${k}`], 'value');
        themeIcon[k] = asset.addURLDependency(themeIcon[k], {
          loc: { ...loc,
            filePath
          }
        });
      }
    }
  }

  if (program.web_accessible_resources) {
    let war = [];

    for (let i = 0; i < program.web_accessible_resources.length; ++i) {
      // TODO: this doesn't support Parcel resolution
      const currentEntry = program.web_accessible_resources[i];
      const files = isMV2 ? [currentEntry] : currentEntry.resources;
      let currentFiles = [];

      for (let j = 0; j < files.length; ++j) {
        const globFiles = (await (0, _utils().glob)(_path().default.join(assetDir, files[j]), fs, {})).map(fp => asset.addURLDependency(_path().default.relative(assetDir, fp), {
          bundleBehavior: 'isolated',
          needsStableName: true,
          loc: {
            filePath,
            ...(0, _diagnostic().getJSONSourceLocation)(ptrs[`/web_accessible_resources/${i}${isMV2 ? '' : `/resources/${j}`}`])
          }
        }));
        currentFiles = currentFiles.concat(globFiles);
      }

      if (isMV2) {
        war = war.concat(currentFiles);
      } else {
        currentEntry.resources = currentFiles;
        war.push(currentEntry);
      }
    }

    program.web_accessible_resources = war;
  }

  for (const loc of DEP_LOCS) {
    const location = '/' + loc.join('/');
    if (!ptrs[location]) continue;
    let parent = program;

    for (let i = 0; i < loc.length - 1; ++i) {
      parent = parent[loc[i]];
    }

    const lastLoc = loc[loc.length - 1];
    const obj = parent[lastLoc];
    if (typeof obj == 'string') parent[lastLoc] = asset.addURLDependency(obj, {
      bundleBehavior: 'isolated',
      loc: {
        filePath,
        ...(0, _diagnostic().getJSONSourceLocation)(ptrs[location], 'value')
      },
      pipeline: _path().default.extname(obj) == '.json' ? 'raw' : undefined
    });else {
      for (const k of Object.keys(obj)) {
        obj[k] = asset.addURLDependency(obj[k], {
          bundleBehavior: 'isolated',
          loc: {
            filePath,
            ...(0, _diagnostic().getJSONSourceLocation)(ptrs[location + '/' + k], 'value')
          },
          pipeline: _path().default.extname(obj[k]) == '.json' ? 'raw' : undefined
        });
      }
    }
  }

  if (isMV2) {
    var _program$background;

    if ((_program$background = program.background) !== null && _program$background !== void 0 && _program$background.page) {
      program.background.page = asset.addURLDependency(program.background.page, {
        bundleBehavior: 'isolated',
        loc: {
          filePath,
          ...(0, _diagnostic().getJSONSourceLocation)(ptrs['/background/page'], 'value')
        }
      });

      if (needRuntimeBG) {
        asset.meta.webextBGInsert = program.background.page;
      }
    }

    if (hot) {
      var _program$background2;

      // To enable HMR, we must override the CSP to allow 'unsafe-eval'
      program.content_security_policy = cspPatchHMR(program.content_security_policy);

      if (needRuntimeBG && !((_program$background2 = program.background) !== null && _program$background2 !== void 0 && _program$background2.page)) {
        if (!program.background) {
          program.background = {};
        }

        if (!program.background.scripts) {
          program.background.scripts = [];
        }

        if (program.background.scripts.length == 0) {
          program.background.scripts.push(asset.addURLDependency('./runtime/default-bg.js', {
            resolveFrom: __filename
          }));
        }

        asset.meta.webextBGInsert = program.background.scripts[0];
      }
    }
  } else {
    var _program$background3;

    if ((_program$background3 = program.background) !== null && _program$background3 !== void 0 && _program$background3.service_worker) {
      program.background.service_worker = asset.addURLDependency(program.background.service_worker, {
        bundleBehavior: 'isolated',
        loc: {
          filePath,
          ...(0, _diagnostic().getJSONSourceLocation)(ptrs['/background/service_worker'], 'value')
        },
        env: {
          context: 'service-worker',
          sourceType: program.background.type == 'module' ? 'module' : 'script'
        }
      });
    }

    if (needRuntimeBG) {
      if (!program.background) {
        program.background = {};
      }

      if (!program.background.service_worker) {
        program.background.service_worker = asset.addURLDependency('./runtime/default-bg.js', {
          resolveFrom: __filename,
          env: {
            context: 'service-worker'
          }
        });
      }

      asset.meta.webextBGInsert = program.background.service_worker;
    }
  }
}

function cspPatchHMR(policy) {
  if (policy) {
    const csp = (0, _contentSecurityPolicyParser().default)(policy);
    policy = '';

    if (!csp['script-src']) {
      csp['script-src'] = ["'self' 'unsafe-eval' blob: filesystem:"];
    }

    if (!csp['script-src'].includes("'unsafe-eval'")) {
      csp['script-src'].push("'unsafe-eval'");
    }

    for (const k in csp) {
      policy += `${k} ${csp[k].join(' ')};`;
    }

    return policy;
  } else {
    return "script-src 'self' 'unsafe-eval' blob: filesystem:;" + "object-src 'self' blob: filesystem:;";
  }
}

var _default = new (_plugin().Transformer)({
  async transform({
    asset,
    options
  }) {
    // Set environment to browser, since web extensions are always used in
    // browsers, and because it avoids delegating extra config to the user
    asset.setEnvironment({
      context: 'browser',
      engines: {
        browsers: asset.env.engines.browsers
      },
      sourceMap: asset.env.sourceMap && { ...asset.env.sourceMap,
        inline: true,
        inlineSources: true
      },
      includeNodeModules: asset.env.includeNodeModules,
      outputFormat: asset.env.outputFormat,
      sourceType: asset.env.sourceType,
      isLibrary: asset.env.isLibrary,
      shouldOptimize: asset.env.shouldOptimize,
      shouldScopeHoist: asset.env.shouldScopeHoist
    });
    const code = await asset.getCode();
    const parsed = (0, _jsonSourcemap().parse)(code);
    const data = parsed.data; // Not using a unified schema dramatically improves error messages

    let schema = _schema.VersionSchema;

    if (data.manifest_version === 3) {
      schema = _schema.MV3Schema;
    } else if (data.manifest_version === 2) {
      schema = _schema.MV2Schema;
    }

    _utils().validateSchema.diagnostic(schema, {
      data: data,
      source: code,
      filePath: asset.filePath
    }, '@parcel/transformer-webextension', 'Invalid Web Extension manifest');

    await collectDependencies(asset, data, parsed.pointers, Boolean(options.hmrOptions));
    asset.setCode(JSON.stringify(data, null, 2));
    asset.meta.webextEntry = true;
    return [asset];
  }

});

exports.default = _default;