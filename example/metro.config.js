const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    blockList: [
      // Ignore build folders to prevent file locking issues on Windows
      /.*\/android\/app\/build\/.*/,
      /.*\/android\/build\/.*/,
      /.*\/\.gradle\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
