var spawn = require('cross-spawn-async');
var fs = require('fs');
var path = require("path");

exports.projectRoot = function() {
  var root = process.cwd();
  var current = root;

  while(current && !fs.existsSync(path.join(current, 'node_modules')) ) {
    if(current === path.dirname(current)) {
      return Promise.resolve(root);
    }

    current = path.dirname(current);
  }

  return Promise.resolve(current || root);
};

// Run a command and pipe the output.
// The returned promise will reject if there is a non-zero exist status
exports.spawn = function(cmd, args, options = {}) {
  options.stdio = 'inherit';

  if (!options.cwd) {
    options.cwd = process.cwd();
  }

  var child = spawn(cmd, args, options);
  var promise = new Promise(function(resolve, reject) {
    child.on('exit', function(status) {
      if(status) {
        reject(new Error('Command `' + cmd +
          '` did not complete successfully'));
      } else {
        resolve(child);
      }
    });
  });

  return promise;
};

var preExp = /-pre|-alpha/;

// Takes an exact version like 0.5.7 and turns into a range like ^0.5.0
exports.versionRange = function(exactVersion) {
  var lastDotPos = exactVersion.lastIndexOf(".");
  var prefix = exactVersion.substr(0, lastDotPos);

  if(preExp.test(prefix)) {
    return "^" + prefix + ".0";
  } else {
    return prefix + ".x";
  }
};
