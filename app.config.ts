import type { ConfigContext, ExpoConfig } from 'expo/config';

// Two build variants from one codebase (see MIGRATION_PLAN.md §8):
// - branded (default): "POS Pondok Galih", real logo + green splash,
//   hides the History tab
// - generic:           "Error", default Expo icon/splash, shows everything
// Select with APP_VARIANT=generic|branded; eas.json profiles set it per build.
// app.json carries the BRANDED assets; the generic variant swaps them back
// to the template defaults below. Feature flags (EXPO_PUBLIC_API_URL,
// EXPO_PUBLIC_HIDE_HISTORY) travel via env so JS reads them directly.

const variant = process.env.APP_VARIANT === 'generic' ? 'generic' : 'branded';

const names = {
  branded: { name: 'POS Pondok Galih', androidPackage: 'com.pondokgalih.pos' },
  generic: { name: 'Error', androidPackage: 'com.posapp.generic' },
} as const;

const genericSplashPlugin = [
  'expo-splash-screen',
  {
    backgroundColor: '#208AEF',
    image: './assets/images/splash-icon.png',
    imageWidth: 76,
  },
] as const;

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  if (variant === 'generic') {
    // Swap the branded splash plugin config for the template default.
    const splashIndex = plugins.findIndex(
      (p) => Array.isArray(p) && p[0] === 'expo-splash-screen',
    );
    if (splashIndex !== -1) {
      plugins[splashIndex] = genericSplashPlugin as any;
    }
  }

  return {
    ...config,
    name: names[variant].name,
    slug: config.slug ?? 'PondokGalihPOS',
    ...(variant === 'generic' && { icon: './assets/images/icon.png' }),
    android: {
      ...config.android,
      package: names[variant].androidPackage,
      ...(variant === 'generic' && {
        adaptiveIcon: {
          backgroundColor: '#E6F4FE',
          foregroundImage: './assets/images/android-icon-foreground.png',
          backgroundImage: './assets/images/android-icon-background.png',
          monochromeImage: './assets/images/android-icon-monochrome.png',
        },
      }),
    },
    plugins: [
      ...plugins,
      [
        'expo-build-properties',
        {
          android: {
            // The legacy API and thermal net printers use plain http.
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
  };
};
