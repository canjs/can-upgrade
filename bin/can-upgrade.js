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

var argv = require('yargs')
  .usage('Usage: $0 [path] --new-binding-syntax')
  .demand(1)
  .argv;
var path = require('path');
var dir = path.join(process.cwd(), process.argv[2]);
var readDir = require('../lib/read-dir');
var jsFileHasTemplateProp = readDir( dir, argv );

if(jsFileHasTemplateProp.length) {
  console.log("These files potentially have an inline template that must be converted manually:".lightred);
  console.log(jsFileHasTemplateProp.join("\n"));
}
