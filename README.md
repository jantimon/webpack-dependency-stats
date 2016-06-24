Webpack Depndency Stats
========================================
[![npm version](https://badge.fury.io/js/webpack-dependency-stats.svg)](http://badge.fury.io/js/webpack-dependency-stats) [![Dependency Status](https://david-dm.org/jantimon/webpack-dependency-stats.svg)](https://david-dm.org/jantimon/webpack-dependency-stats) [![Build status](https://travis-ci.org/jantimon/webpack-dependency-stats.svg)](https://travis-ci.org/jantimon/webpack-dependency-stats) [![Build status](https://ci.appveyor.com/api/projects/status/u0798wdxt4qho7xq/branch/master?svg=true)](https://ci.appveyor.com/project/jantimon/webpack-dependency-stats/branch/master)
 [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

A helper to get a flat list of all dependencies and dependents of a given module

Installation
------------

Install the plugin with npm:
```shell
$ npm install --save-dev webpack-dependency-stats
```

Basic Usage
-----------

You have to pass the stats from the webpack compilation:
https://webpack.github.io/docs/node.js-api.html#stats

```javascript
var webpackDependencyStats = new WebpackDependencyStats(stats, {
  srcFolder: path.resolve(__dirname, 'src')
});
console.log(webpackDependencyStats.getDependencies('./entry.js'));
console.log(webpackDependencyStats.getDependents('./entry.js'));
```

Include external dependencies
-----------

```javascript
var webpackDependencyStats = new WebpackDependencyStats(stats, {
  srcFolder: path.resolve(__dirname, 'src'),
  onlyLocal: false
});
console.log(webpackDependencyStats.getDependencies('./entry.js'));
console.log(webpackDependencyStats.getDependents('./entry.js'));
```

# Changelog

Take a look at the  [CHANGELOG.md](https://github.com/jantimon/webpack-dependency-stats/tree/master/CHANGELOG.md).


# Contribution

You're free to contribute to this project by submitting [issues](https://github.com/jantimon/webpack-dependency-stats/issues) and/or [pull requests](https://github.com/jantimon/webpack-dependency-stats/pulls). This project is test-driven, so keep in mind that every change and new feature should be covered by tests.
This project uses the [semistandard code style](https://github.com/Flet/semistandard).

# License

This project is licensed under [MIT](https://github.com/jantimon/webpack-dependency-stats/blob/master/LICENSE).
