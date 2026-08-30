import { router, type Href } from 'expo-router';

// Bridge for legacy RootNavigation.navigate/replace calls inside thunks.
// Route map (legacy screen -> expo-router path), finalized in Phase 3:
//   Splash          -> /            (index: splash + prefetch redirect)
//   AuthNavigation  -> /login
//   TopTab          -> /home        ((tabs) group)
//   HomeScreen      -> /home
//   FinishOrder     -> /finish-order
// Paths are cast because some targets are created later in Phase 3;
// typedRoutes will validate them once every route file exists.

export const navigate = (path: string, params?: Record<string, any>) => {
  router.navigate({ pathname: path, params } as Href);
};

export const replace = (path: string, params?: Record<string, any>) => {
  router.replace({ pathname: path, params } as Href);
};
