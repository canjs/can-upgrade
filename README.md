# can-upgrade

## Install

```shell
npm install can-upgrade
```

## Usage

To upgrade your templates to the latest template engine (mustache -> stache) with the latest [binding syntax](http://canjs.com/docs/can.view.bindings.html), just run this command:

```shell
./node_modules/.bin/can-upgrade ./ --new-binding-syntax
```

This script does most of the tedious work for you and minimizes the upgrade effort!

However, it does not make changes to templates written inline in your JavaScript. A list of files that should be checked manually is also provided.

If you rather perform these upgrades in smaller separate steps, that's fine, too:

```shell
./node_modules/.bin/can-upgrade ./ # upgrade *.mustache -> *.stache
# diff changes, run tests, commit, continue
./node_modules/.bin/can-upgrade ./ --new-binding-syntax
# diff changes, run tests, commit, take victory lap
```
