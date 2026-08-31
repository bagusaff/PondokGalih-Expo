import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { AppButton, AppLayout, AppText } from '@/components/ui';
import {
  resetOrderItem,
  resetSelectedBill,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale, verticalScale } from '@/theme';

import { BillModal } from './bill-modal';
import { DetailTotalOrder } from './detail-total-order';
import { OrderMenuCard } from './order-menu-card';
import { OrderModal } from './order-modal';

// 1:1 port of components/sidebar/OrderMenu.js. Blur listener -> focus-effect
// cleanup; totalPrice derived via useMemo (same value, one render fewer);
// modals mount lazily per perf charter.

export function OrderMenu() {
  const dispatch = useAppDispatch();

  const orderItems = useAppSelector((state) => state.order.orderItems);
  const taxItems = useAppSelector((state) => state.tax.taxItems);
  const salesItems = useAppSelector((state) => state.salestype.salesItems);
  const selectedSalesType = useAppSelector(
    (state) => state.salestype.selectedSalesType,
  );
  const selectedBill = useAppSelector((state) => state.bill.selectedBill);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBillModalVisible, setIsBillModalVisible] = useState(false);

  const selectedUpdateType = useMemo(() => {
    if (Object.keys(selectedBill).length == 0) return 'default order';
    if (selectedBill?.methodType == 'updateBill') {
      return 'update bill';
    } else if (selectedBill?.methodType == 'updateHistory') {
      return 'update history';
    }
  }, [selectedBill]);

  const resetOrders = () => {
    dispatch(resetOrderItem());
    dispatch(resetSelectedBill());
  };

  const handleResetOrders = () => {
    Alert.alert(
      'Menghapus Pesanan',
      'Apakah anda yakin ingin menghapus semua pesanan ?',
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya', onPress: resetOrders },
      ],
      { cancelable: true },
    );
  };

  const handleAddToBills = () => {
    setIsBillModalVisible(true);
  };

  const totalPrice = useMemo(
    () => orderItems?.reduce((a: number, b: any) => a + b.totalPrice, 0),
    [orderItems],
  );

  const setAppliedTax = useMemo(() => {
    if (salesItems[selectedSalesType - 1]?.tax == 1) {
      return taxItems[0]?.percent;
    }
    return 0;
    // Legacy deps: only selectedSalesType.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSalesType]);

  // Legacy closed the pay modal when the tab lost focus (blur listener).
  useFocusEffect(
    useCallback(() => {
      return () => setIsModalVisible(false);
    }, []),
  );

  return (
    // Owner feedback (2026-08-31): flex column instead of the legacy fixed
    // (height/2.25) list + flexGrow bottom block — the item list now absorbs
    // all free space on any tablet resolution, and totals sit directly above
    // the action buttons with no dead gap.
    <AppLayout style={styles.layout}>
      <View style={styles.header}>
        <AppText category="h5" style={{ fontSize: scale(10) }}>
          {' '}
          Order List
        </AppText>

        {selectedUpdateType == 'update bill' && (
          <AppText category="p1" appearance="hint">
            {'Tagihan : '}
            {selectedBill?.name}
          </AppText>
        )}

        <AppButton
          appearance="outline"
          status="danger"
          size="small"
          style={{ borderRadius: 10 }}
          onPress={handleResetOrders}
          disabled={!(orderItems.length > 0)}>
          Clear All
        </AppButton>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={orderItems}
          renderItem={({ item }) => <OrderMenuCard data={item} />}
          keyExtractor={(item, index) => String(index)}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews
        />
        <LinearGradient
          style={styles.gradient}
          colors={gradientColor}
          pointerEvents="none"
        />
      </View>
      <DetailTotalOrder totalPrice={totalPrice} tax={setAppliedTax} />
      {selectedUpdateType == 'update history' ? (
        <View style={styles.buttonRow}>
          <AppButton
            disabled={orderItems.length == 0}
            onPress={() => setIsModalVisible(true)}
            size="giant"
            style={styles.actionButton}
            status="primary">
            Update History
          </AppButton>
          <View style={{ width: 15 }} />
          <AppButton
            disabled={orderItems.length == 0}
            onPress={handleResetOrders}
            size="giant"
            status="danger"
            appearance="outline"
            style={styles.actionButton}>
            Batalkan
          </AppButton>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <AppButton
            disabled={orderItems.length == 0}
            onPress={() => setIsModalVisible(true)}
            size="giant"
            style={styles.actionButton}
            status="primary">
            Bayar
          </AppButton>
          <View style={{ width: 15 }} />
          <AppButton
            disabled={orderItems.length == 0}
            onPress={handleAddToBills}
            size="giant"
            status="info"
            style={styles.actionButton}>
            Simpan
          </AppButton>
        </View>
      )}
      {isModalVisible && (
        <OrderModal
          isOpen={isModalVisible}
          hideModal={() => setIsModalVisible(false)}
          totalPrice={totalPrice}
          selectedTax={setAppliedTax}
        />
      )}
      {isBillModalVisible && (
        <BillModal
          isOpen={isBillModalVisible}
          hideModal={() => setIsBillModalVisible(false)}
        />
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  layout: { padding: scale(5), flex: 1 },
  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginBottom: scale(7.5),
    paddingVertical: scale(7.5),
    flex: 1,
  },
});

const gradientColor = [
  'rgba(255, 255, 255, 0.2)',
  'rgba(255, 255, 255, 0.5)',
  'rgba(255, 255, 255, 1)',
] as const;
