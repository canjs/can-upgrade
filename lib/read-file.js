var fs = require('fs');
var updateBinding = require('./update-binding');

var readFile = function(fullpath, options) {
  var jsFileHasTemplateProp = [];
  var isMustache = /\.mustache$/i.test(fullpath);
  var contents;

  if(fullpath.search(/\.js$/i) !== -1) {
    contents = fs.readFileSync(fullpath, "utf8");

    //fast check if template string might be in file
    if(contents.indexOf("template") !== -1) {
      //has the word template but is it potentially an object property?
      if(contents.search(/("|')?template\1[\s\r\n]*:/g) !== -1) {
        //TODO: also check ^ that there is a single or double quote before the next , or }
        jsFileHasTemplateProp.push(fullpath);
      }
    }

    fs.writeFileSync(fullpath, contents.replace(/\.mustache/g, ".stache"), "utf8");

  } else if(/\.(?:mu)?stache$/i.test(fullpath)) {
    contents = fs.readFileSync(fullpath, "utf8");

    contents = updateBinding(contents, { isStache: !isMustache, newBindingSyntax: options.newBindingSyntax });

    fs.writeFileSync(fullpath, contents, "utf8");

    if(isMustache) {
      //TODO: check that the .stache file doesn't already exist
      fs.renameSync(fullpath, fullpath.replace(/\.mustache$/, ".stache"));
    }
  }

  return jsFileHasTemplateProp;
};

module.exports = readFile;
