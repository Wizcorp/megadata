/**
 * Interface representing the output of require.context
 */
declare interface IContextualRequire extends NodeRequire {
  keys(): string[]
}

/**
 * Augmentation of the NodeRequire interface (representing `require`)
 */
// tslint:disable:interface-name
interface NodeRequire {
  context: (path: string, recursive?: boolean, regexp?: RegExp) => IContextualRequire
}

declare var require: NodeRequire

declare const __webpack_require__: any

// Code ported from https://github.com/wilsonlewis/require-context/blob/master/index.js

/* istanbul ignore next */
if (typeof __webpack_require__ === 'undefined') {
  const { constructor } = module as any
  const { wrap } = constructor
  constructor.wrap = function (script: string) {
    return wrap(`require.context = function (directory, recursive = false, regExp = /^\.\/) {
        const path = require('path');
        const fs = require('fs');

        let basepath = directory;

        if (directory[0] === '.') {
          basepath = path.join(__dirname, directory);
        } else if (!path.isAbsolute(directory)) {
          basepath = require.resolve(directory);
        }

        const keys = fs.readdirSync(basepath)
          .filter((file) => file.match(regExp));

        var context = (key) => require(context.resolve(key));
        context.resolve = (key) => path.join(basepath, key);
        context.keys = () => keys;

        return context;
      }
    `.split('\n').join('') + ';' + script)
  }
}
