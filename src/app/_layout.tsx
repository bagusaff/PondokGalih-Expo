import { DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { checkConnection, persistor, store, useAppDispatch } from '@/state';

SplashScreen.preventAutoHideAsync();

// Mirrors legacy App.js + Root.stack.js: Redux Provider + PersistGate wrap a
// headerless stack (splash -> prefetch -> login -> tabs / finish-order),
// status bar hidden (fullscreen POS), connection watcher started once, toast
// host mounted last. Light theme only, as the legacy app.

function AppShell() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkConnection());
  }, [dispatch]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AppShell />
      </PersistGate>
    </Provider>
  );
}
