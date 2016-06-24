'use strict';
var _ = require('lodash');
var assert = require('assert');

function WebpackDependencyStats (webpackStats, options) {
  assert(typeof options === 'object' && options.srcFolder, 'Source root folder is required');
  options = _.extend({
    onlyLocal: true
  }, options);
  this.modules = WebpackDependencyStats.extractModuleData(webpackStats, options);
  this.contextHelpers = WebpackDependencyStats.getContextHelperNames(this.modules);
  this.cache = {
    dependencies: {},
    dependents: {}
  };
}

WebpackDependencyStats.prototype.getAllDependencies = function () {
  if (Object.keys(this.cache.dependencies).length) {
    return this.cache.dependencies;
  }
  var moduleIds = Object.keys(this.modules.byId).map((id) => this.modules.byId[id].id);
  moduleIds.forEach((id) => { this.cache.dependencies[id] = []; });

  moduleIds
    .map((id) => ({ id: id, depenedents: this.getDependentIdsById(id) }))
    .forEach((dependentsMap) => dependentsMap.depenedents
      .forEach((id) => this.cache.dependencies[id].push(dependentsMap.id)));

  moduleIds.forEach((id) => {
    this.cache.dependencies[id].sort();
    this.cache.dependencies[id] = _.sortedUniq(_.differenceWith(this.cache.dependencies[id], this.contextHelpers.ids));
  });

  return this.cache.dependencies;
};

WebpackDependencyStats.prototype.getModuleNames = function () {
  return Object.keys(this.modules.byName);
};

WebpackDependencyStats.prototype.getDependencies = function (moduleName) {
  return this.getDependencyIds(moduleName)
    .map((id) => WebpackDependencyStats.stripLoaders(this.modules.byId[id].name));
};

WebpackDependencyStats.prototype.getDependents = function (moduleName) {
  return this.getDependentIds(moduleName)
    .map((id) => WebpackDependencyStats.stripLoaders(this.modules.byId[id].name));
};

WebpackDependencyStats.prototype.getDependencyIds = function (moduleName) {
  var module = this.modules.byName[moduleName];
  if (!module) {
    throw new Error('Module "' + moduleName + '" was not found in webpack stats');
  }
  return this.getDependencyIdsById(module.id);
};

WebpackDependencyStats.prototype.getDependentIds = function (moduleName) {
  var module = this.modules.byName[moduleName];
  if (!module) {
    throw new Error('Module "' + moduleName + '" was not found in webpack stats');
  }
  return this.getDependentIdsById(module.id);
};

WebpackDependencyStats.prototype.getDependencyIdsById = function (id) {
  return this.getAllDependencies()[id];
};

WebpackDependencyStats.prototype.getDependentIdsById = function (id) {
  var module = this.modules.byId[id];
  if (!module) {
    throw new Error('Module "' + id + '" was not found in webpack stats');
  }
  if (this.cache.dependents[id]) {
    return this.cache.dependents[id];
  }

  var dependents = [];
  this.cache.dependents[id] = dependents;

  /**
   * Add dependent id but keep the array sorted
   */
  function addDependent (id) {
    dependents.splice(_.sortedIndex(dependents, id), 0, id);
  }

  module.reasons.forEach((reason) => {
    addDependent(reason.moduleId);
    if (this.modules.byId[reason.moduleId]) {
      this.getDependentIdsById(reason.moduleId).forEach(addDependent);
    }
  });

  return _.differenceWith(_.sortedUniq(dependents), this.contextHelpers.ids);
};

/**
 * Extracts the real modules from webpackStats
 */
WebpackDependencyStats.extractModuleData = function (webpackStats, options) {
  options = _.extend({
    onlyLocal: true
  }, options);

  var stats = webpackStats.toJson({
    context: options.srcFolder,
    source: false,
    timings: false,
    version: false,
    errorDetails: false,
    chunks: false,
    chunkModules: false
  });

  var modules = { byId: {}, byName: {} };

  stats.modules
    // Remove internal modules
    .filter((module) => module.name.indexOf('(webpack)') === -1)
    // Remove files outside the src folder
    .filter((module) => !options.onlyLocal || WebpackDependencyStats.stripLoaders(module.name).indexOf('./') === 0)
    .forEach((module) => {
      modules.byName[WebpackDependencyStats.stripLoaders(module.name)] = module;
      modules.byId[module.id] = module;
    });

  return modules;
};

WebpackDependencyStats.getContextHelperNames = function (modules) {
  var names = Object.keys(modules.byName)
    .filter((moduleName) => modules.byName[moduleName].reasons.some((reason) => reason.type === 'require.context'));
  var ids = names.map((name) => modules.byName[name].id);
  return { names: names, ids: ids };
};

WebpackDependencyStats.stripLoaders = function (moduleName) {
  return moduleName
    .replace(/^.+[!]/, '')
    .replace(/^.+[~]/, '~');
};

module.exports = WebpackDependencyStats;
