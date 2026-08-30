import type { MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { Pressable, Text, View } from 'react-native';

import { colors, statusColors } from '@/theme';

// Port of the legacy TopTabBar (UI Kitten TabBar): 50px white bar, every
// label 20px/800 in hint color (legacy overrode selected color away), 4px
// primary indicator (radius 2) under the active tab — Eva TabBar metrics.

export type AppTopTabBarProps = MaterialTopTabBarProps & {
  labels: Record<string, string>;
};

export function AppTopTabBar({ state, navigation, labels }: AppTopTabBarProps) {
  const routes = state.routes.filter(
    (route: { name: string }) => labels[route.name] != null,
  );

  return (
    <View
      style={{
        height: 50,
        flexDirection: 'row',
        backgroundColor: colors.backgroundLevel1,
        paddingVertical: 4,
      }}>
      {routes.map((route: { key: string; name: string }) => {
        const selected = state.routes[state.index].name === route.name;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: colors.textHint,
                marginVertical: 2,
              }}>
              {labels[route.name]}
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 8,
                right: 8,
                height: 4,
                borderRadius: 2,
                backgroundColor: selected ? statusColors.primary : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
