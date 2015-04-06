#!/usr/bin/env node


Object.defineProperty(String.prototype, "bold", {
    get: function() { return "\x1B[1m" + this + "\x1B[22m"; }
});
Object.defineProperty(String.prototype, "red", {
    get: function() { return "\x1B[31m" + this + "\x1B[39m"; }
});
Object.defineProperty(String.prototype, "lightred", {
    get: function() { return "\x1B[91m" + this + "\x1B[39m"; }
});

if(!( process && process.argv && process.argv.length > 2 )) {
	console.log( process.argv.join(" ") + " [root directory]" );
	process.exit(1);
}

var fs = require('fs');
var path = require('path');
var dir = path.join(process.cwd(), process.argv[2]);
var jsFileHasTemplateProp = [];

function readFile(fullpath) {
	if(fullpath.search(/\.js$/i) !== -1) {
		var contents = fs.readFileSync(fullpath, "utf8");

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
		var contents = fs.readFileSync(fullpath, "utf8");

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
}

function readDir(dir) {
	dir = dir.replace(/([^\/\\])$/, "$1/");
	var files = fs.readdirSync( dir );
	var stats = null;

	files.forEach(function(file) {
		stats = fs.lstatSync(dir+file);
		if(stats.isSymbolicLink()) {
			return;
		} else if(stats.isDirectory()) {
			if(file !== "canjs" && file !== "can") {
				readDir(dir+file);
			}
		} else if(stats.isFile()) {
			readFile(dir+file);
		}
	});
}

readDir( dir );

if(jsFileHasTemplateProp.length) {
	console.log("These files potentially have an inline template that must be converted manually:".lightred);
	console.log(jsFileHasTemplateProp.join("\n"));
}