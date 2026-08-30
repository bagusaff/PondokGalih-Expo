module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        // Perf charter (MIGRATION_PLAN.md §4.3): the legacy app logs in hot
        // paths (reducers, print flows); keep logs in dev, strip in release.
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    },
  };
};
