const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .claude holds agent skills with their own node_modules — one contains a
// pathologically deep directory tree that hangs Metro's file crawler.
// Metro must never walk into .claude.
const existing = config.resolver.blockList;
const existingList = Array.isArray(existing)
  ? existing
  : existing
    ? [existing]
    : [];
config.resolver.blockList = [...existingList, /[\\/]\.claude[\\/]/];

module.exports = config;
