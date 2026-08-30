import { Stack } from 'expo-router/stack';

// Port of stacks/Setting.stack.js: headerless stack with Setting index,
// Configuration and Printer screens.

export default function SettingStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
