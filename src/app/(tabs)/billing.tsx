import { useIsFocused } from 'expo-router';
import moment from 'moment';
import 'moment/locale/id';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';

import { NoConnection } from '@/components/no-connection';
import {
  AppButton,
  AppIcon,
  AppLayout,
  AppSpinner,
  AppText,
} from '@/components/ui';
import { BillingCard } from '@/features/billing/billing-card';
import { EmptyBill } from '@/features/billing/empty-bill';
import { pondokGalihBase64 } from '@/features/printing/logo';
import { addSpaceToLeftSide, generateDivider } from '@/lib/adjust-price-text';
import { api, authHeader } from '@/lib/api';
import { useAppSelector } from '@/state';
import { moderateScale, scale, statusColors } from '@/theme';

moment.locale('id');

// 1:1 port of screens/billing/Billing.screen.js — open bills list with
// reprint. PRINT LOGIC IS FROZEN (verbatim).

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

export default function BillingRoute() {
  const isFocused = useIsFocused();

  const { lastUpdated, lastOperation } = useAppSelector((state) => state.bill);
  const token = useAppSelector((state) => state.user.token);
  const { selectedSalesIndex, salesItems } = useAppSelector(
    (state) => state.salestype,
  );
  const { selectedPrinter, printCopyCount } = useAppSelector(
    (state) => state.setting,
  );

  const [lastUpdatedAt, setLastUpdatedAt] = useState(
    moment().local().startOf('seconds').fromNow(),
  );
  const [pickedBill, setPickedBill] = useState<any>({});
  const [billItems, setBillItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const renderLastTimeUpdated = () => {
    setLastUpdatedAt(moment(lastUpdated).local().startOf('seconds').fromNow());
  };

  const handleSyncBill = async () => {
    try {
      setLoading(true);
      const response = await api.get('/billing', authHeader(token));
      if (response.data.status == 'success') {
        setLoading(false);
        setBillItems(response.data.data);
        return;
      } else {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Gagal mengupdate billing!',
          text2: response?.data?.status,
        });
        return;
      }
    } catch (error: any) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Gagal mengupdate billing!',
        text2: error?.response?.message,
      });
    }
    renderLastTimeUpdated();
  };

  const handlePressPrint = (data: any) => {
    setPickedBill(data);
  };

  // ============ FROZEN PRINT LOGIC (verbatim from V-113) ============
  const generateReciptText = async () => {
    const orderItems = await JSON.parse(pickedBill?.data || '');
    const text =
      `<C><B>NEW ORDER</B></C>\n\n` +
      `<L>${moment(pickedBill.updated_at).format('DD-MM-YYYY')}${addSpaceToLeftSide(
        moment(pickedBill?.updated_at).format('HH:mm:ss').toString(),
        30,
      )}</L>\n` +
      `<L>${pickedBill.name}${addSpaceToLeftSide(
        pickedBill.no,
        48 - pickedBill.name.length - pickedBill.no.length,
      )}</L>\n` +
      generateDivider(48) +
      `<C><B>${salesItems[selectedSalesIndex]?.name}</B></C>\n` +
      generateDivider(48);

    let itemDesc = '';
    await orderItems.items.forEach((menu: any) => {
      const item_variant =
        menu.variant_id != null
          ? `<L>${addSpaceToLeftSide(
              menu?.name,
              3 + menu.quantity.toString().length,
            )}</L>\n`
          : `\n`;
      itemDesc = itemDesc.concat(
        `<L>${menu.quantity} x ${
          menu.variant_id != null ? menu?.original_name : menu?.name
        }</L>\n` + item_variant,
      );
    });
    const iterate = Array(printCopyCount).fill(undefined);
    if (Object.keys(selectedPrinter).length === 0) {
      return Alert.alert(
        'Printer belum terhubung',
        'Konfigurasi printer dari halaman setting terlebih dahulu',
      );
    }
    try {
      iterate.forEach(async () => {
        const Printer = printerList[selectedPrinter?.printerType];
        await Printer.printImageBase64(pondokGalihBase64, {
          imageWidth: 400,
          imageHeight: 200,
        });
        await Printer.printBill(text.concat(itemDesc + generateDivider(48)));
      });
    } catch (error) {
      console.log('error', error);
      Toast.show({
        type: 'error',
        text1: 'Terjadi kesalahan Print Bill',
        text2: String(error),
      });
    }
  };
  // ============ END FROZEN PRINT LOGIC ============

  const confirmationPrint = (data: any) => {
    Alert.alert(
      'Konfirmasi Print Bill',
      'Apakah anda yakin ingin mencetak bill pesanan ?',
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya', onPress: () => handlePressPrint(data) },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    if (isFocused) {
      if (Object.keys(pickedBill).length > 0) {
        generateReciptText();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedBill, isFocused]);

  useEffect(() => {
    if (isFocused) {
      handleSyncBill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOperation, isFocused]);

  useEffect(() => {
    if (isFocused) {
      const interval = setInterval(() => {
        renderLastTimeUpdated();
      }, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated, isFocused]);

  return (
    <>
      <NoConnection />
      <AppLayout level="3" style={styles.Wrapper}>
        <View style={styles.HeaderWrapper}>
          <View>
            <AppText category="h4">Billing</AppText>
            <AppText category="c1" appearance="hint">
              Semua transaksi yang belum dibayar akan masuk kedalam menu ini
            </AppText>
          </View>
          <View>
            <AppButton
              status="primary"
              appearance="ghost"
              size="large"
              accessoryLeft={
                loading ? (
                  <View style={styles.indicator}>
                    <AppSpinner size="small" />
                  </View>
                ) : (
                  <AppIcon name="sync" size={24} fill={statusColors.primary} />
                )
              }
              onPress={handleSyncBill}>
              Sinkronasi Data
            </AppButton>
            <AppText category="c1" appearance="hint">
              Terakhir diperbarui {lastUpdatedAt || '-'}
            </AppText>
          </View>
        </View>
        {loading ? (
          <></>
        ) : (
          <FlatList
            data={billItems}
            renderItem={({ item }) => (
              <BillingCard data={item} onPressPrint={confirmationPrint} />
            )}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            removeClippedSubviews
            stickyHeaderIndices={[0]}
            refreshing={loading}
            ListHeaderComponent={BillingHeader}
            ListEmptyComponent={EmptyBill}
          />
        )}
      </AppLayout>
    </>
  );
}

function BillingHeader() {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: scale(5),
        marginBottom: 5,
        backgroundColor: '#EDF1F7',
        borderRadius: 5,
      }}>
      <AppText
        style={{
          flex: 1,
          textAlign: 'center',
          alignSelf: 'center',
          fontSize: scale(10),
        }}
        category="h6">
        No. Meja
      </AppText>
      <AppText
        style={{
          flex: 3,
          textAlign: 'left',
          alignSelf: 'center',
          fontSize: scale(10),
        }}
        category="h6">
        Nama Pelanggan
      </AppText>
      <AppText
        style={{
          flex: 3,
          textAlign: 'left',
          alignSelf: 'center',
          fontSize: scale(10),
        }}
        category="h6">
        Terakhir Diperbarui
      </AppText>
      <AppText
        style={{
          flex: 2,
          textAlign: 'center',
          alignSelf: 'center',
          fontSize: scale(10),
        }}
        category="h6">
        Aksi
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    height: '100%',
    padding: moderateScale(5),
  },
  HeaderWrapper: {
    backgroundColor: '#FFF',
    width: '100%',
    padding: moderateScale(10),
    borderRadius: 5,
    marginBottom: scale(5),
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
