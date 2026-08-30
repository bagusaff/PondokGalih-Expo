import { useFocusEffect, useIsFocused } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';

import { NoConnection } from '@/components/no-connection';
import { AppButton, AppDivider, AppLayout, AppText } from '@/components/ui';
import { HistoryMenu } from '@/features/history/history-menu';
import { pondokGalihBase64 } from '@/features/printing/logo';
import {
  addSpaceToLeftSide,
  generateDivider,
  generateReceiptRowText,
} from '@/lib/adjust-price-text';
import { api, authHeader } from '@/lib/api';
import { currencyFormatter } from '@/lib/currency-formatter';
import {
  changeSalesType,
  filterMenuPerCategory,
  filterMenuPerSalesType,
  loadOrderItems,
  selectBill,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale } from '@/theme';

// 1:1 port of screens/history/History.screen.js (V-113: payment method,
// charge fee, item notes, conditional rounding). PRINT LOGIC IS FROZEN.

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

export default function HistoryRoute() {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.user.token);
  const selectedPrinter = useAppSelector(
    (state) => state.setting.selectedPrinter,
  );
  const salesItems = useAppSelector((state) => state.salestype.salesItems);
  const selectedCategory = useAppSelector(
    (state) => state.category.selectedCategory,
  );

  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [start, setStart] = useState(0);
  const [reciptText, setReciptText] = useState('');

  const loadMoreOrder = () => {
    setStart((prevState) => prevState + 15);
  };

  const fetchOrder = async () => {
    setLoading(true);
    const res = await api.get(`/order?limit=15&start=${start}`, authHeader(token));
    if (res.data.code == 200) {
      setOrderHistory((prevData) => [...prevData, ...res.data.data]);
      setLoading(false);
    } else {
      console.log('Failed Fetch More', res);
      setLoading(false);
    }
  };

  const handlePressHistory = (item: any) => {
    setSelectedHistory(item);
  };

  // ============ FROZEN PRINT LOGIC (verbatim from V-113) ============
  const generateReciptText = async () => {
    const additionalInfo = JSON.parse(selectedHistory?.note || '');
    const text =
      `<C><B>${additionalInfo?.outlet_name}</B></C>\n\n` +
      `<C> ${additionalInfo?.outlet_address}</C>\n` +
      '\n' +
      generateDivider(48) +
      `<L>Nomor Nota: ${selectedHistory?.invoice}</L>\n` +
      `<L>Tanggal : ${moment(selectedHistory?.created_at).format(
        'DD MMM YYYY, HH:mm:ss',
      )}</L>\n` +
      generateDivider(48) +
      `<C>${additionalInfo?.sales_type_name}</C>\n` +
      generateDivider(48) +
      '\n\n';

    let itemDesc = '';
    await selectedHistory?.items.forEach((menu: any) => {
      const item_variant =
        menu.variant_id != null
          ? menu.variant_name !== menu?.item_name
            ? `<L>${menu.variant_name}</L>\n`
            : ``
          : ``;

      let trimString =
        currencyFormatter(menu.quantity * menu.price) + menu.quantity + menu.price;
      let spaceCount = 48 - (trimString.replace(/\s/g, '').length + 4);
      let variantNote =
        menu.note && menu.note?.trim().length !== 0
          ? `<L>Catatan : ${menu.note}</L>\n`
          : '';

      itemDesc = itemDesc.concat(
        `<L>${menu.item_name}</L>\n` +
          `<L>${menu.quantity} x ${menu.price}${addSpaceToLeftSide(
            currencyFormatter(menu.quantity * menu.price),
            spaceCount,
          )}</L>\n` +
          item_variant +
          variantNote +
          `\n`,
      );
    });
    let paymentMethodFee =
      selectedHistory?.payment_method !== 'Cash' &&
      parseInt(selectedHistory?.charge) > 0
        ? generateReceiptRowText(
            48,
            `Charge ${selectedHistory?.payment_method} 2%`,
            parseInt(selectedHistory?.charge),
            'L',
          )
        : '';
    let rounding =
      selectedHistory?.payment_method == 'Cash'
        ? generateReceiptRowText(
            48,
            'Pembulatan',
            selectedHistory?.net_amount -
              (selectedHistory?.tax +
                selectedHistory?.gross_amount -
                selectedHistory?.discount),
            'L',
          )
        : '';
    let payDesc =
      generateDivider(48) +
      generateReceiptRowText(48, 'Subtotal', selectedHistory?.gross_amount, 'L') +
      generateReceiptRowText(48, 'Pajak', selectedHistory?.tax, 'L') +
      generateReceiptRowText(48, 'Diskon', selectedHistory?.discount, 'L') +
      paymentMethodFee +
      generateDivider(48) +
      rounding +
      generateReceiptRowText(48, 'Total', selectedHistory?.net_amount, 'L') +
      generateReceiptRowText(48, 'Bayar Tunai', additionalInfo?.pay_amount, 'L') +
      generateReceiptRowText(
        48,
        'Kembali',
        additionalInfo?.pay_amount - selectedHistory?.net_amount,
        'L',
      ) +
      '\n' +
      `<C>Terima kasih atas kunjungan Anda</C>\n` +
      `<C>Bebek Pondok Galih</C>\n`;
    let footerText = '';

    setReciptText(text.concat(itemDesc + payDesc + footerText));
  };

  const printRecipt = async () => {
    if (Object.keys(selectedPrinter).length === 0) {
      return Toast.show({
        type: 'error',
        text1: 'Printer tidak ditemukan',
        text2: 'Silahkan hubungkan printer melalui menu Setting',
      });
    }
    try {
      const Printer = printerList[selectedPrinter?.printerType];
      await Printer.printImageBase64(pondokGalihBase64, {
        imageWidth: 400,
        imageHeight: 200,
      });
      await Printer.printBill(reciptText);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Terjadi kesalahan Load History',
        text2: String(error),
      });
      return;
    }
  };
  // ============ END FROZEN PRINT LOGIC ============

  const updateHistoryData = () => {
    // Legacy stored an IndexPath ({row}) here; new store uses plain numbers.
    const salesIndex = selectedHistory?.sales_type_id - 1;
    let data = { ...selectedHistory, sales_index: salesIndex };
    data.items.forEach((item: any) => {
      item.id = item.item_id;
      item.name = item?.variant_id ? item?.variant_name : item.item_name;
      item.price = parseInt(item.price);
      item.totalPrice = parseInt(item.price) * item.quantity;
      item.quantity = item.quantity;
      item.original_name = item?.item_name;
      item.variant_id = item?.variant_id;
    });
    dispatch(selectBill({ ...data, methodType: 'updateHistory' }));
    dispatch(changeSalesType(data.sales_type_id, salesIndex));
    dispatch(filterMenuPerSalesType(data.sales_type_id));
    dispatch(filterMenuPerCategory(selectedCategory));
    dispatch(loadOrderItems(data.items));
  };

  useEffect(() => {
    if (isFocused) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, isFocused]);

  // Legacy blur listener: reset the list when leaving the tab.
  useFocusEffect(
    useCallback(() => {
      return () => {
        setOrderHistory([]);
        setSelectedHistory(null);
        setStart(0);
      };
    }, []),
  );

  useEffect(() => {
    if (selectedHistory !== null) {
      generateReciptText();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHistory]);

  return (
    <>
      <NoConnection />
      <AppLayout level="3" style={styles.Layout}>
        <AppLayout level="2" style={styles.LeftWrapper}>
          <HistoryMenu
            loading={loading}
            data={orderHistory}
            onPressHistory={handlePressHistory}
            loadMore={loadMoreOrder}
          />
        </AppLayout>
        <AppLayout level="1" style={styles.RightWrapper}>
          <AppLayout style={styles.Wrapper}>
            {selectedHistory !== null && (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <AppText category="h6" style={{ marginRight: 5 }}>
                      Invoice Number :
                    </AppText>
                    <AppText>{selectedHistory?.invoice}</AppText>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ marginRight: 10 }}>
                      <AppButton
                        size="large"
                        status="primary"
                        appearance="outline"
                        onPress={printRecipt}>
                        Print Nota
                      </AppButton>
                    </View>
                    <View>
                      <AppButton
                        size="large"
                        status="basic"
                        appearance="outline"
                        onPress={updateHistoryData}>
                        Edit Data
                      </AppButton>
                    </View>
                  </View>
                </View>
                <View>
                  <View>
                    <AppText category="h6" style={{ marginRight: 5 }}>
                      Order Date :
                    </AppText>
                    <AppText>
                      {moment(selectedHistory?.created_at).format(
                        'DD MMM YYYY, HH:mm:ss',
                      )}
                    </AppText>
                  </View>
                  <View>
                    <AppText category="h6" style={{ marginRight: 5 }}>
                      Tipe Penjualan :
                    </AppText>
                    <AppText>
                      {salesItems[selectedHistory?.sales_type_id - 1]?.name}
                    </AppText>
                  </View>
                  <View>
                    <AppText category="h6" style={{ marginRight: 5 }}>
                      Metode Pembayaran :
                    </AppText>
                    <AppText>{selectedHistory?.payment_method}</AppText>
                  </View>
                </View>
                <ScrollView>
                  <AppText category="h6" style={{ marginRight: 5 }}>
                    Order Items :
                  </AppText>
                  {selectedHistory?.items.map((item: any, index: number) => (
                    <View key={index}>
                      <AppText>
                        {item.item_name +
                          ' ' +
                          ((item?.variant_name !== item?.item_name &&
                            item?.variant_name) ||
                            '')}
                      </AppText>
                      <View style={{ flexDirection: 'row' }}>
                        <AppText appearance="hint">
                          {currencyFormatter(parseInt(item?.price))}
                        </AppText>
                        <AppText appearance="hint"> x </AppText>
                        <AppText appearance="hint">{item.quantity}</AppText>
                      </View>
                      {item.note ? (
                        <AppText appearance="hint">
                          Catatan Menu : {item.note}
                        </AppText>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>

                <AppDivider style={{ marginVertical: 10 }} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <AppText category="h6" style={{ fontSize: scale(10) }}>
                    Total Harga :{' '}
                  </AppText>
                  <AppText category="h6" style={{ fontSize: scale(10) }}>
                    {currencyFormatter(parseInt(selectedHistory?.gross_amount))}
                  </AppText>
                </View>
                {selectedHistory?.tax_id !== null && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <AppText category="h6" style={{ fontSize: scale(10) }}>
                      Pajak :{' '}
                    </AppText>
                    <AppText category="h6" style={{ fontSize: scale(10) }}>
                      {currencyFormatter(parseInt(selectedHistory?.tax))}
                    </AppText>
                  </View>
                )}
                {selectedHistory?.discount_id !== null && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <AppText category="h6" style={{ fontSize: scale(10) }}>
                      Diskon :{' '}
                    </AppText>
                    <AppText category="h6" style={{ fontSize: scale(10) }}>
                      {currencyFormatter(parseInt(selectedHistory?.discount))}
                    </AppText>
                  </View>
                )}
                {parseInt(selectedHistory?.charge) > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <AppText category="h6" style={{ fontSize: scale(10) }}>
                      Biaya Pembayaran :{' '}
                    </AppText>
                    <AppText category="h6" style={{ fontSize: scale(10) }}>
                      {currencyFormatter(parseInt(selectedHistory?.charge))}
                    </AppText>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <AppText category="h6" style={{ fontSize: scale(10) }}>
                    Total Bayar :{' '}
                  </AppText>
                  <AppText category="h6" style={{ fontSize: scale(10) }}>
                    {currencyFormatter(parseInt(selectedHistory?.net_amount))}
                  </AppText>
                </View>
              </View>
            )}
          </AppLayout>
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
  Wrapper: {
    flex: 1,
    height: '100%',
    padding: scale(6),
  },
  LeftWrapper: {
    flex: 3.5,
  },
  RightWrapper: {
    flex: 6.5,
    borderLeftWidth: 2,
    borderLeftColor: '#F7F9FC',
  },
});
