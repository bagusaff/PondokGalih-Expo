import { ScrollView, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppDivider,
  AppIcon,
  AppInput,
  AppLayout,
  AppSpinner,
  AppText,
} from '@/components/ui';
import { statusColors, type Status } from '@/theme';

// Phase 1 visual test screen: every UI-kit primitive in its variants, for
// side-by-side comparison against the legacy UI Kitten rendering.

const statuses: Status[] = ['primary', 'success', 'info', 'warning', 'danger', 'basic'];

export default function UiKitPreviewScreen() {
  return (
    <AppLayout level="3" style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 16 }}>
        <AppText category="h4">UI Kit Preview</AppText>

        <AppCard style={{ padding: 16, gap: 8 }}>
          <AppText category="h6">Text categories</AppText>
          <AppText category="h1">h1 Heading</AppText>
          <AppText category="h5">h5 Heading</AppText>
          <AppText category="s1">s1 Subtitle</AppText>
          <AppText category="p1">p1 Paragraph</AppText>
          <AppText category="c1" appearance="hint">
            c1 hint caption
          </AppText>
          <AppText category="label">label</AppText>
          <AppText status="danger">danger status text</AppText>
        </AppCard>

        <AppCard style={{ padding: 16, gap: 12 }}>
          <AppText category="h6">Buttons</AppText>
          {(['filled', 'outline', 'ghost'] as const).map((appearance) => (
            <View key={appearance} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {statuses.map((status) => (
                <AppButton key={status} appearance={appearance} status={status}>
                  {status}
                </AppButton>
              ))}
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <AppButton disabled>disabled</AppButton>
            <AppButton
              appearance="ghost"
              accessoryLeft={<AppIcon name="arrow-back" size={32} fill="#000" />}
            />
            <AppButton
              status="info"
              appearance="outline"
              accessoryLeft={<AppIcon name="printer" size={20} fill={statusColors.info} />}>
              Print
            </AppButton>
          </View>
        </AppCard>

        <AppCard style={{ padding: 16, gap: 12 }}>
          <AppText category="h6">Inputs</AppText>
          <AppInput
            placeholder="Cari menu disini"
            accessoryLeft={<AppIcon name="search-outline" size={24} fill="#8F9BB3" />}
          />
          <AppInput placeholder="Disabled" disabled />
        </AppCard>

        <AppCard style={{ padding: 16, gap: 12 }}>
          <AppText category="h6">Icons</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {(
              [
                'alert-triangle',
                'arrow-back',
                'arrow-ios-forward-outline',
                'calendar',
                'lock',
                'menu',
                'minus',
                'person',
                'plus-outline',
                'printer',
                'search-outline',
                'shopping-cart',
                'sync',
                'trash-2',
              ] as const
            ).map((name) => (
              <AppIcon key={name} name={name} size={28} fill="#222B45" />
            ))}
          </View>
        </AppCard>

        <AppCard style={{ padding: 16, gap: 12 }}>
          <AppText category="h6">Spinner / Divider / Layout levels</AppText>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <AppSpinner size="tiny" />
            <AppSpinner size="medium" status="info" />
            <AppSpinner size="giant" status="danger" />
          </View>
          <AppDivider />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['1', '2', '3', '4'] as const).map((level) => (
              <AppLayout
                key={level}
                level={level}
                style={{ width: 56, height: 56, borderWidth: 1, borderColor: '#C5CEE0' }}>
                <AppText category="c1">{level}</AppText>
              </AppLayout>
            ))}
          </View>
        </AppCard>
      </ScrollView>
    </AppLayout>
  );
}
