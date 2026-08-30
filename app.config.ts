import type { ConfigContext, ExpoConfig } from 'expo/config';

// Two build variants from one codebase (see MIGRATION_PLAN.md §8):
// - branded (default): "POS Pondok Galih", real logo, hides the History tab
// - generic:           "Error", default icon, shows everything
// Select with APP_VARIANT=generic|branded; eas.json profiles set it per build.
// Feature flags (EXPO_PUBLIC_API_URL, EXPO_PUBLIC_HIDE_HISTORY) travel via env
// so JS code can read them directly with process.env.

const variant = process.env.APP_VARIANT === 'generic' ? 'generic' : 'branded';

const variants = {
  branded: {
    name: 'POS Pondok Galih',
    androidPackage: 'com.pondokgalih.pos',
  },
  generic: {
    name: 'Error',
    androidPackage: 'com.posapp.generic',
  },
} as const;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variants[variant].name,
  slug: config.slug ?? 'PondokGalihPOS',
  android: {
    ...config.android,
    package: variants[variant].androidPackage,
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-build-properties',
      {
        android: {
          // Both variants talk to a plain-http API server.
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
});
