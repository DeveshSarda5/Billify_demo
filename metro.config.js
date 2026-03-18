const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper resolution for TypeScript and JSX
config.resolver.assetExts.push(
  'cjs',
);

config.resolver.sourceExts.push(
  'mjs',
);

module.exports = config;
