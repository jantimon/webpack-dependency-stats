'use strict';

function requireAll (requireContext) {
  return requireContext.keys().map(requireContext);
}

requireAll(require.context('./earth/', false, /^\.\/.*\.js$/));
