import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';

import {
  AppButton,
  AppDivider,
  AppInput,
  AppModal,
  AppSpinner,
  AppText,
} from '@/components/ui';
import { addSpaceToLeftSide, generateDivider } from '@/lib/adjust-price-text';
import { pondokGalihBase64 } from '@/features/printing/logo';
import {
  updateBill,
  uploadBill,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale, verticalScale } from '@/theme';

// 1:1 port of components/modals/BillModal.js — save order as billing +
// kitchen-order print. PRINT LOGIC IS FROZEN (verbatim).
// IndexPath -> number: bill JSON keeps `sales_index` — old server rows hold
// an IndexPath object, so readers must use sales_index?.row ?? sales_index.

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

type BillModalProps = {
  isOpen: boolean;
  hideModal: () => void;
};

export function BillModal({ isOpen, hideModal }: BillModalProps) {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();

  const { userData, token } = useAppSelector((state) => state.user);
  const orderItems = useAppSelector((state) => state.order.orderItems);
  const { selectedSalesType, selectedSalesIndex, salesItems } = useAppSelector(
    (state) => state.salestype,
  );
  const { selectedBill, loading } = useAppSelector((state) => state.bill);
  const { selectedPrinter, printCopyCount, autoPrintBill } = useAppSelector(
    (state) => state.setting,
  );

  const [name, setName] = useState('');
  const [table, setTable] = useState('');

  const isBillSelected =
    Object.keys(selectedBill).length !== 0 &&
    selectedBill?.methodType == 'updateBill';

  useEffect(() => {
    if (isOpen) {
      setName(selectedBill?.name || '');
      setTable(selectedBill?.no || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleHideModal = () => {
    setName('');
    setTable('');
    hideModal();
  };

  // ============ FROZEN PRINT LOGIC (verbatim from V-113) ============
  const generateReciptText = async () => {
    const text =
      `<C><B>NEW ORDER</B></C>\n\n` +
      `<L>${moment().format('DD-MM-YYYY')}${addSpaceToLeftSide(
        moment().format('HH:MM:SS').toString(),
        30,
      )}</L>\n` +
      `<L>${name}${addSpaceToLeftSide(table, 48 - name.length - table.length)}</L>\n` +
      generateDivider(48) +
      `<C><B>${salesItems[selectedSalesIndex]?.name}</B></C>\n` +
      generateDivider(48);

    let itemDesc = '';
    await orderItems.forEach((menu: any) => {
      const item_variant =
        menu.variant_id != null
          ? `<L>${addSpaceToLeftSide(
              menu?.name,
              3 + menu.quantity.toString().length,
            )}</L>\n`
          : `\n`;
      let item_variant_name = item_variant
        ? item_variant !== menu.name
          ? item_variant
          : ''
        : '';
      itemDesc = itemDesc.concat(
        `<L>${menu.quantity} x ${
          menu.variant_id != null ? menu?.original_name : menu?.name
        }</L>\n` + item_variant_name,
      );
    });
    const iterate = Array(printCopyCount).fill(undefined);
    if (Object.keys(selectedPrinter).length === 0) {
      hideModal();
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
      hideModal();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Terjadi kesalahan Print Bill',
        text2: String(error),
      });
      return;
    }
  };
  // ============ END FROZEN PRINT LOGIC ============

  const handleUpload = async () => {
    const orderDetails = {
      sales_type: selectedSalesType,
      sales_index: selectedSalesIndex,
      items: orderItems,
    };
    const body = {
      no: table,
      name: name,
      data: JSON.stringify(orderDetails),
      outlet_id: userData.outlet.id,
    };
    if (!isBillSelected) {
      dispatch(uploadBill(body, token));
      if (autoPrintBill) {
        await generateReciptText();
      } else {
        hideModal();
      }
    } else {
      dispatch(updateBill(selectedBill.id, body, token));
      if (autoPrintBill) {
        await generateReciptText();
      } else {
        hideModal();
      }
    }
  };

  return (
    <AppModal visible={isOpen}>
      <View style={[styles.InnerWrapper, { width: (3 / 4) * width }]}>
        <View style={styles.HeaderContainer}>
          <AppButton
            onPress={handleHideModal}
            appearance="outline"
            status="danger"
            size="large">
            Cancel
          </AppButton>
          <AppText category="h6">
            {isBillSelected ? 'Update Billing' : 'Tambah Billing'}
          </AppText>
          <AppButton
            appearance="outline"
            status="info"
            size="large"
            disabled={name == '' || table == '' || loading}
            onPress={handleUpload}
            accessoryLeft={
              loading ? (
                <View style={styles.Spinner}>
                  <AppSpinner size="small" status="info" />
                </View>
              ) : undefined
            }>
            {loading ? undefined : 'Simpan'}
          </AppButton>
        </View>
        <AppDivider />

        <ScrollView>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View
              style={{
                flexDirection: 'column',
                marginVertical: verticalScale(10),
                flex: 1,
              }}>
              <View
                style={{ flexDirection: 'row', marginBottom: verticalScale(5) }}>
                <AppText category="h6" style={{ fontSize: scale(6) }}>
                  NAMA PELANGGAN
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                <AppInput
                  placeholder="Nama Pelanggan"
                  style={{ width: '100%' }}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            <View style={{ width: 25 }} />
            <View
              style={{
                flexDirection: 'column',
                marginVertical: verticalScale(10),
                flex: 1,
              }}>
              <View
                style={{ flexDirection: 'row', marginBottom: verticalScale(5) }}>
                <AppText category="h6" style={{ fontSize: scale(6) }}>
                  NOMOR MEJA
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                <AppInput
                  placeholder="Nomor Meja"
                  style={{ width: '100%' }}
                  value={table}
                  onChangeText={setTable}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  InnerWrapper: {
    backgroundColor: '#fff',
    padding: scale(10),
    borderRadius: 15,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
  },
  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  Spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
