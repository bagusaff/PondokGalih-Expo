import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { NoConnection } from '@/components/no-connection';
import { AppLayout } from '@/components/ui';
import { OrderMenu } from '@/features/order/order-menu';

// 1:1 port of layout/HomeLayout.js — the 65/35 landscape split.
// Perf charter: unlike legacy, this layout does NOT subscribe to orderItems
// (legacy re-rendered the whole screen, menu grid included, on every cart
// change); OrderMenu subscribes internally.

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NoConnection />
      <AppLayout level="3" style={styles.Layout}>
        <AppLayout level="2" style={styles.LeftWrapper}>
          {children}
        </AppLayout>
        <AppLayout level="1" style={styles.RightWrapper}>
          <OrderMenu />
        </AppLayout>
      </AppLayout>
    </>
  );
}

const styles = StyleSheet.create({
  Layout: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  LeftWrapper: {
    flex: 6.5,
  },
  RightWrapper: {
    flex: 3.5,
    borderLeftWidth: 2,
    borderLeftColor: '#F7F9FC',
  },
});
