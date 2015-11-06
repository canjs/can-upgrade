var fs = require('fs');

var readFile = function(fullpath) {
  var jsFileHasTemplateProp = [];
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

  } else if(fullpath.search(/\.mustache$/i) !== -1) {
    contents = fs.readFileSync(fullpath, "utf8");

    //do on all tags with attributes
    contents = contents.replace(/<([a-z-]+)([\s\r\n]+)([\w\W]*?)>/g, function(s, tag, spacing, allAttrs) {
      allAttrs = allAttrs.replace(/([^=\s\r\n]*)([\s\r\n]*)=([\s\r\n]*)(["']?)((\\\4|[^\4])*?)\4/g,
        function(s, attr, sp1, sp2, quoteType, value) {
          if(tag.indexOf("-") !== -1) {
            //component tag, do {} replacement for most attributes
            if(attr !== "id" && attr !== "class") {
              value = "{"+value+"}";
            }
          } else {
            //check each attr and see if it starts with "can-" before doing the {} replacement
            if(attr.indexOf("can-") === 0) {
              value = "{"+value+"}";
            }
          }
          return attr+sp1+"="+sp2+quoteType+ value +quoteType;
        }
      );

      return "<" + tag + spacing + allAttrs + ">";
    });
    fs.writeFileSync(fullpath, contents, "utf8");

    //TODO: check that the .stache file doesn't already exist
    fs.renameSync(fullpath, fullpath.replace(/\.mustache$/, ".stache"));
  }

  return jsFileHasTemplateProp;
};

module.exports = readFile;
