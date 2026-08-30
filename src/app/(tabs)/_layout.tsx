import type {
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
// SDK 56+: expo-router vendors material-top-tabs; importing the original
// @react-navigation package at runtime is rejected by the router.
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
} from 'expo-router/js-top-tabs';

import { AppTopTabBar } from '@/components/ui/app-top-tab-bar';

// Port of navigation/TopTab.js: material top tabs, swipe disabled.
// The branded build hides the Order History tab (EXPO_PUBLIC_HIDE_HISTORY);
// hidden means absent from the tab bar — the route stays registered.

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const hideHistory = process.env.EXPO_PUBLIC_HIDE_HISTORY === 'true';

const labels: Record<string, string> = {
  home: 'Home',
  billing: 'Billing',
  ...(hideHistory ? {} : { history: 'Order History' }),
  setting: 'Setting',
};

export default function TabsLayout() {
  return (
    <MaterialTopTabs
      initialRouteName="home"
      tabBar={(props: any) => <AppTopTabBar {...props} labels={labels} />}
      screenOptions={{ swipeEnabled: false }}>
      <MaterialTopTabs.Screen name="home" />
      <MaterialTopTabs.Screen name="billing" />
      <MaterialTopTabs.Screen name="history" />
      <MaterialTopTabs.Screen name="setting" />
    </MaterialTopTabs>
  );
}
