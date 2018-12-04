#!/usr/bin/env node
var upgrade = require("../lib/upgrade");
var version = process.argv[2] || "latest";

upgrade(version).catch(function(err) {
  var noVersion = err.message === "No version found";
  if(noVersion) {
    console.error("No version found for", version);
    return;
  }
  console.error(err);
});
