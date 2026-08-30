import { StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components/ui';
import { scale } from '@/theme';

// 1:1 port of components/cards/EmptyBill.js

export function EmptyBill() {
  return (
    <View style={styles.Wrapper}>
      <View style={styles.Icon}>
        <AppIcon name="alert-triangle" size={scale(50)} fill="#8F9BB3" />
      </View>
      <AppText category="h6" appearance="hint">
        Tidak ada tagihan untuk ditampilkan
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    height: scale(150),
    justifyContent: 'center',
    alignItems: 'center',
  },
  Icon: {
    marginBottom: scale(10),
  },
});
