var utils = require("./utils");
var spawn = require('cross-spawn-async');
var path = require("path");

module.exports = function(version) {
  var requestedVersion = version || "latest";

  var packageJsonPromise = rootPackageJson();
  var canPackageJsonPromise = getCanPackageForRange(requestedVersion);

  return Promise.all([
    canPackageJsonPromise,
    packageJsonPromise
  ])
  .then(function(results){
    var canPkg = results[0];
    var handle = results[1];

    var projectRoot = handle.root;
    var pkg = handle.get();

    function addIfExists(obj, dep, vers) {
      if(obj[dep]) {
        obj[dep] = vers;
      }
    }

    Object.keys(canPkg.dependencies).forEach(function(dep) {
      var vers = canPkg.dependencies[dep];
      if(pkg.dependencies) {
        addIfExists(pkg.dependencies, dep, vers);
      }

      if(pkg.devDependencies) {
        addIfExists(pkg.devDependencies, dep, vers);
      }
    });

    handle.write(pkg);

    // Run npm install to get the newest versions
    return utils.spawn("npm", ["install"]).then(function(){
      return projectRoot;
    });
  });
};

function rootPackageJson() {
  return utils.projectRoot().then(function(root){
    var packagePath = path.join(root, "package.json");
    return {
      root: root,
      get: function(){
        return require(packagePath);
      },
      write: function(newPackage){
        var json = JSON.stringify(newPackage, null, " ");
        require("fs").writeFileSync(packagePath, json, "utf8");
      }
    };
  });
}

function getCanPackageForRange(versionRange) {
  return getPackage("can@" + versionRange);
}

function getPackage(packageNameAndVersion) {
  return new Promise(function(resolve, reject){
    var child = spawn("npm", ["info", "--json", packageNameAndVersion]);
    var json = "";
    child.stdout.on("data", function(data){
      json += data.toString();
    });
    child.on("exit", function(status){
      if(status === 1) {
        reject();
      } else {
        try {
          if(!json.length) {
            var error = new Error("No version found");
            return reject(error);
          }

          var data = JSON.parse(json);
          resolve(data[data.length - 1] || data);
        } catch(err) {
          reject(err);
        }
      }
    });
  });
}

/*
function installCanMigrate() {
  return utils.spawn("npm", ["install", "--no-save", "can-migrate"]);
}

function runCanMigrate(projectRoot, requestedDonejsVersion) {
  var donejsMajor = getMajorVersion(requestedDonejsVersion) ||
    getMajorVersion(donejsVersion);
  var canjsVersion = canjsVersionMap[donejsMajor];
  if(canjsVersion) {
    var canMigratePath = path.join(projectRoot, 'node_modules', '.bin', "can-migrate");
    var args = [canMigratePath, "**\/*.*", "--apply", "--can-version",
      canjsVersion.toString(), "--force"];
    return utils.spawn("node", args);
  }
  return Promise.resolve();
}
*/

/*
function getMajorVersion(versionRange) {
  var index = 0, len = versionRange.length;
  var numExp = /[1-9]/;
  var vers = "";
  while(index < len) {
    var char = versionRange[index];
    if(numExp.test(char)) {
      vers += char;
    }
    // Break the first time we get a non-number after having gotten at least one
    else if(vers.length) {
      break;
    }
    index++;
  }
  return vers;
}
*/
