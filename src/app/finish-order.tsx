import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';

import { AppButton, AppText } from '@/components/ui';
import { pondokGalihBase64 } from '@/features/printing/logo';
import {
  addSpaceToLeftSide,
  generateDivider,
  generateReceiptRowText,
} from '@/lib/adjust-price-text';
import { currencyFormatter } from '@/lib/currency-formatter';
import {
  changeSalesType,
  filterMenuPerCategory,
  filterMenuPerSalesType,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale } from '@/theme';

// 1:1 port of screens/finishorder/index.js (V-113). The completed-order
// payload arrives via the order slice (finishedOrder) instead of navigation
// params — expo-router params are string-serialized. PRINT LOGIC IS FROZEN.

const orderFinishAnimation = require('../assets/animations/completed-animation.json');

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

export default function FinishOrderRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const finishedOrder = useAppSelector((state) => state.order.finishedOrder);
  const {
    created_at,
    discount,
    gross_amount,
    invoice,
    items,
    net_amount,
    note,
    tax,
    charge,
    payment_method,
  } = finishedOrder ?? {};

  const selectedPrinter = useAppSelector(
    (state) => state.setting.selectedPrinter,
  );
  const token = useAppSelector((state) => state.user.token);
  const selectedCategory = useAppSelector(
    (state) => state.category.selectedCategory,
  );

  const [reciptText, setReciptText] = useState('');

  const connectNetPrinter = () => {
    NetPrinter.init().then(async () => {
      await NetPrinter.connectPrinter(
        selectedPrinter?.host || '',
        selectedPrinter?.port || 9100,
      )
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Berhasil menghubungkan Printer',
          });
        })
        .catch((err) => {
          Toast.show({
            type: 'error',
            text1: 'Silahkan hubungkan printer melalui menu Setting',
            text2: err,
          });
        });
    });
  };

  // ============ FROZEN PRINT LOGIC (verbatim from V-113) ============
  const generateReciptText = async () => {
    const additionalInfo = JSON.parse(note || '');
    const text =
      `<C><B>${additionalInfo?.outlet_name}</B></C>\n\n` +
      `<C> ${additionalInfo?.outlet_address}</C>\n` +
      '\n' +
      generateDivider(48) +
      `<L>Nomor Nota: ${invoice}</L>\n` +
      `<L>Tanggal : ${moment(created_at).format('DD MMM YYYY, HH:mm:ss')}</L>\n` +
      generateDivider(48) +
      `<C>${additionalInfo?.sales_type_name}</C>\n` +
      generateDivider(48) +
      '\n\n';

    let itemDesc = '';
    await items.forEach((menu: any) => {
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
      payment_method !== 'Cash' && charge > 0
        ? generateReceiptRowText(48, `Charge ${payment_method} 2%`, charge, 'L')
        : '';
    let rounding =
      payment_method == 'Cash'
        ? generateReceiptRowText(
            48,
            'Pembulatan',
            net_amount - (tax + gross_amount - discount),
            'L',
          )
        : '';
    let payDesc =
      generateDivider(48) +
      generateReceiptRowText(48, 'Subtotal', gross_amount, 'L') +
      generateReceiptRowText(48, 'Pajak', tax, 'L') +
      generateReceiptRowText(48, 'Diskon', discount, 'L') +
      paymentMethodFee +
      generateDivider(48) +
      rounding +
      generateReceiptRowText(48, 'Total', net_amount, 'L') +
      generateReceiptRowText(48, 'Bayar Tunai', additionalInfo?.pay_amount, 'L') +
      generateReceiptRowText(
        48,
        'Kembali',
        additionalInfo?.pay_amount - net_amount,
        'L',
      ) +
      '\n' +
      `<C>Terima kasih atas kunjungan Anda</C>\n` +
      `<C>Bebek Pondok Galih</C>\n`;

    let footerText = '';

    setReciptText(text.concat(itemDesc + payDesc + footerText));
  };

  const printRecipt = async () => {
    await generateReciptText();
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
        text1: 'Terjadi kesalahan Print Recipt',
        text2: String(error),
      });
      return;
    }
  };
  // ============ END FROZEN PRINT LOGIC ============

  useEffect(() => {
    if (finishedOrder) {
      generateReciptText();
    }
    // Legacy effect ran once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateBack = () => {
    dispatch(changeSalesType(1, 0));
    dispatch(filterMenuPerSalesType(1));
    dispatch(filterMenuPerCategory(selectedCategory, 1, token));
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <AppButton
        size="medium"
        appearance="outline"
        status="info"
        onPress={connectNetPrinter}
        style={{ alignSelf: 'flex-end', marginRight: 16 }}>
        Hubungkan Printer
      </AppButton>
      <AppText category="h3">Order Completed</AppText>
      <LottieView
        source={orderFinishAnimation}
        autoPlay
        loop
        style={{ width: scale(200), height: scale(200) }}
      />
      <View style={{ flexDirection: 'row' }}>
        <AppButton
          size="giant"
          appearance="outline"
          status="success"
          onPress={navigateBack}
          style={{ marginRight: 16 }}>
          Kembali
        </AppButton>
        <AppButton
          size="giant"
          appearance="outline"
          status="success"
          onPress={printRecipt}>
          Print Nota
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
