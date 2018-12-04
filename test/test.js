var assert = require("assert");
var mockery = require("mockery");
var path = require("path");
var fs = require("fs");
var rimraf = require("rimraf");
var utils = require("../lib/utils");

describe("can-upgrade", function() {
  var upgrade;
  var spawnCalls;
  var writeCalls;
  var folder = 'test-project';
  var cmdUpgradePath = '../lib/upgrade';
  var pkgJsonPath = path.join(__dirname, "..", folder, "package.json");

  beforeEach(function() {
    spawnCalls = [];
    writeCalls = [];
    cwd = process.cwd();

    deleteFolder();

    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });

    mockery.registerAllowable(cmdUpgradePath);

    mockery.registerMock('./utils', {
      mkdirp: utils.mkdirp,
      versionRange: function() { return 'latest'; },
      projectRoot: function(){
        return Promise.resolve(__dirname + '/../' + folder);
      },
      spawn: function() {
        spawnCalls.push({
          binary: arguments[0],
          args: arguments[1],
          options: arguments[2]
        });
        return Promise.resolve(true);
      }
    });

    mockery.registerMock(pkgJsonPath, {
      dependencies: {
        foo: "1.0.0",
        "can-stache": "1.0.0"
      },
      devDependencies: {
        bar: "1.0.0"
      }
    });

    mockery.registerMock('fs', {
      writeFileSync: function(path, data, enc){
        writeCalls.push({ path, data, enc });
      }
    });

    mockery.registerMock('cross-spawn-async', function(){
      var reqPkg = arguments[1][2];
      spawnCalls.push({
        binary: arguments[0],
        args: arguments[1],
        options: arguments[2]
      });
      var makeOn = function() {
        var fn = function(ev, cb) {
          fn.cb = cb;
        };
        return fn;
      };
      var onData = makeOn();
      var onExit = makeOn();
      var mock = {stdout: { on: onData }, on: onExit};

      var pkg;
      if(reqPkg === "can@12.0.0") {
        setTimeout(function(){
          onData.cb("");
          setTimeout(function() { onExit.cb(0); }, 20);
        }, 20);
        return mock;
      } else if(/can/.test(reqPkg)) {
        pkg = {dependencies:{"can-stache":"2.0.0"}};
      } else {
        throw new Error(reqPkg + ' not supported');
      }

      setTimeout(function(){
        onData.cb(JSON.stringify(pkg));
        setTimeout(function() { onExit.cb(0); }, 20);
      }, 20);

      return mock;
    });

    upgrade = require(cmdUpgradePath);
  });

  afterEach(function() {
    //deleteFolder();
    mockery.disable();
    mockery.deregisterAll();
  });

  it("Upgrades packages to the correct version", function(done) {
    upgrade("5.0.0")
    .then(function(){
      assert.equal(writeCalls.length, 1);
      assert.equal(writeCalls[0].path, pkgJsonPath);

      var json = JSON.parse(writeCalls[0].data);
      assert.equal(json.dependencies["can-stache"], "2.0.0", "Upgraded can-stache");
    })
    .then(done)
    .catch(done);
  });

  it("Rejects when there is no matching version", function(done) {
    upgrade("12.0.0")
    .then(function(){
      assert.ok(false, "Should have rejected");
    }, function(error) {
      assert.equal(error.message, "No version found", "Got the correct error message");
      done();
    })
    .catch(done);
  });

  function deleteFolder() {
    if (fs.existsSync(folder)) {
      rimraf.sync(folder);
    }
  }
});
