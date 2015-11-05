var fs = require('fs');
var readFile = require('./read-file');

var readDir = function(dir) {
  dir = dir.replace(/([^\/\\])$/, "$1/");
  var jsFileHasTemplateProp = [];
  var files = fs.readdirSync( dir );
  var stats = null;

  files.forEach(function(file) {
    var potentiallyInline;

    stats = fs.lstatSync(dir+file);

    if(stats.isSymbolicLink()) {
      return;
    } else if(stats.isDirectory() && /^can$/) {
      if(file !== "canjs" && file !== "can") {
        potentiallyInline = readDir(dir+file);
      }
    } else if(stats.isFile()) {
      potentiallyInline = readFile(dir+file);
    }

    jsFileHasTemplateProp = jsFileHasTemplateProp.concat(potentiallyInline);
  });

  return jsFileHasTemplateProp;
};

module.exports = readDir;
