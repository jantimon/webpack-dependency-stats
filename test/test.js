import test from 'ava';
import WebpackDependencyStats from '..';
import denodeify from 'denodeify';
import path from 'path';
import _ from 'lodash';
const webpack = denodeify(require('webpack'));

function getErrorMessage(cb) {
  try {
    cb();
  } catch(e) {
    return e.message;
  }
}

let stats;

test.before(async t => {
  stats = await webpack(require('./fixtures/demo/webpack.config.js'));
});

test('extracts modules from stats', t => {
  var {byId, byName} = WebpackDependencyStats.extractModuleData(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var moduleNames = Object.keys(byName);
  t.deepEqual(moduleNames, [
    './entry.js',
    './space/earth/ocean/intro.html',
    './space/index.js',
    './space/earth nonrecursive ^\\.\\/.*\\.js$',
    './space/earth/index.js',
    './space/earth/ocean/island.js',
    './space/earth/ocean/text.html',
    './space/earth/europe/index.js'
  ]);
  var expectedIds = _.values(byName).map((module) => `${module.id}`);
  var moduleIds = Object.keys(byId);
  t.deepEqual(expectedIds, moduleIds);
});

test('extracts modules names from stats', t => {
  var {byId, byName} = WebpackDependencyStats.extractModuleData(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var moduleNames = Object.keys(byName);
  t.deepEqual(moduleNames, webpackDependencyStats.getModuleNames());
});

test('throws on unknown module', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var err = getErrorMessage(() => webpackDependencyStats.getDependentIdsById(999));
  t.is(err, `Module "999" was not found in webpack stats`);
});

test('throws on unknown module', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var err = getErrorMessage(() => webpackDependencyStats.getDependencyIds('fancy'));
  t.is(err, `Module "fancy" was not found in webpack stats`);
});

test('throws on unknown module', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var err = getErrorMessage(() => webpackDependencyStats.getDependents('fancy'));
  t.is(err, `Module "fancy" was not found in webpack stats`);
});

test('extracts dependents of module', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var dependents = webpackDependencyStats.getDependents('./space/earth/ocean/text.html');
  t.deepEqual(dependents, [
    './entry.js',
    './space/index.js',
    './space/earth/index.js',
    './space/earth/ocean/island.js',
    './space/earth/europe/index.js'
  ]);
});

test('extracts dependencies of module', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var dependencies = webpackDependencyStats.getDependencies('./entry.js');
  t.deepEqual(dependencies, [
    './space/earth/ocean/intro.html',
    './space/index.js',
    './space/earth/index.js',
    './space/earth/ocean/island.js',
    './space/earth/ocean/text.html',
    './space/earth/europe/index.js'
  ]);
});


test('extracts dependencies of module from cache', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/')
  });
  var dependencies = webpackDependencyStats.getDependencies('./entry.js');
  t.deepEqual(dependencies, webpackDependencyStats.getDependencies('./entry.js'));
});


test('extracts dependencies of module including node modules', t => {
  var webpackDependencyStats = new WebpackDependencyStats(stats, {
    srcFolder: path.resolve(__dirname, 'fixtures/demo/'),
    onlyLocal: false
  });
  var dependencies = webpackDependencyStats.getDependencies('./entry.js');
  t.deepEqual(dependencies, [
    './space/earth/ocean/intro.html',
    './space/index.js',
    './space/earth/index.js',
    './space/earth/ocean/island.js',
    './space/earth/ocean/text.html',
    './space/earth/europe/index.js',
    '~/lodash/lodash.js'
  ]);
});




