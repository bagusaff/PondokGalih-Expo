import moment from 'moment';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';

import {
  AppButton,
  AppDivider,
  AppIcon,
  AppModal,
  AppSpinner,
  AppText,
  AppToggle,
} from '@/components/ui';
import { AppSelect } from '@/components/ui/app-select';
import {
  addSpaceToLeftSide,
  generateDivider,
  generateReceiptRowText,
} from '@/lib/adjust-price-text';
import { currencyFormatter, roundingUp } from '@/lib/currency-formatter';
import { pondokGalihBase64 } from '@/features/printing/logo';
import {
  postOrder,
  updateOrder,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale, statusColors, verticalScale } from '@/theme';

import { PayAmountButton } from './pay-amount-button';

// 1:1 port of components/modals/OrderModal/OrderModal.js (V-113).
// PRINT LOGIC IS FROZEN — generateReciptText and the print calls are
// verbatim. IndexPath -> plain number index; easy-grid Rows/Cols -> flexbox.

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

// react-native-easy-grid replacements: Row = flex row, Col size = flex.
function Row({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[{ flexDirection: 'row', width: '100%' }, style]}>{children}</View>;
}
function Col({ size = 1, children }: { size?: number; children?: ReactNode }) {
  return <View style={{ flex: size }}>{children}</View>;
}

type OrderModalProps = {
  isOpen: boolean;
  hideModal: () => void;
  totalPrice: number;
  selectedTax: number;
};

export function OrderModal({
  isOpen,
  hideModal,
  totalPrice,
  selectedTax,
}: OrderModalProps) {
  const dispatch = useAppDispatch();
  const { width, height } = useWindowDimensions();

  const taxItems = useAppSelector((state) => state.tax.taxItems);
  const discountItems = useAppSelector((state) => state.discount.discountItems);
  const { userData, token, shift } = useAppSelector((state) => state.user);
  const { orderItems, loading, message, error } = useAppSelector(
    (state) => state.order,
  );
  const { selectedSalesType, salesItems, selectedSalesIndex, paymentMethod } =
    useAppSelector((state) => state.salestype);
  const selectedBill = useAppSelector((state) => state.bill.selectedBill);
  const selectedPrinter = useAppSelector(
    (state) => state.setting.selectedPrinter,
  );

  const [customAmount, setCustomAmount] = useState(0);
  const [selectedDiscount, setSelectedDiscount] = useState<any>({});
  const [notes] = useState('');
  const [date, setDate] = useState(new Date());
  const [keyboardSize, setKeyboardSize] = useState(0);
  const [showDiscountList, setShowDiscountList] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const [selectedIndexPath, setSelectedIndexPath] = useState(0);
  const [additionalFees, setAdditionalFees] = useState(false);

  const selectedUpdateType = useMemo(() => {
    if (Object.keys(selectedBill).length == 0) return 'default order';
    if (selectedBill?.methodType == 'updateBill') {
      return 'update bill';
    } else if (selectedBill?.methodType == 'updateHistory') {
      return 'update history';
    }
  }, [selectedBill]);

  const renderDiscountAmount = () => {
    let amount = 0;
    if (selectedDiscount.type == 'percent') {
      amount = (selectedDiscount.amount / 100) * totalPrice;
    } else if (selectedDiscount.type == 'amount') {
      amount = parseInt(selectedDiscount.amount);
    }
    return amount;
  };

  const isFree = totalPrice == renderDiscountAmount();

  const additionalFeesAmount = useMemo(() => {
    if (selectedPaymentMethod == 'Cash' || isFree || !additionalFees) return 0;
    const totalPay =
      totalPrice - renderDiscountAmount() + (selectedTax / 100) * totalPrice;
    const feeAmount = parseInt(paymentMethod[selectedIndexPath]?.charge);
    return (feeAmount / 100) * totalPay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPaymentMethod,
    totalPrice,
    selectedTax,
    selectedDiscount,
    isFree,
    additionalFees,
    selectedIndexPath,
  ]);

  const sumTotalNetAmount = useMemo(() => {
    if (isFree) {
      return 0;
    }
    return Math.round(
      totalPrice -
        renderDiscountAmount() +
        (selectedTax / 100) * totalPrice +
        additionalFeesAmount,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice, additionalFeesAmount, selectedTax, selectedDiscount, isFree]);

  const handleHideModal = () => {
    setCustomAmount(0);
    setSelectedDiscount({});
    setDate(new Date());
    setShowDiscountList(false);
    hideModal();
    setSelectedPaymentMethod('Cash');
    setSelectedIndexPath(0);
  };

  const handleAmountButton = (value: number) => {
    setSelectedPaymentMethod('Cash');
    setCustomAmount(value);
  };

  const additionalNotes =
    notes +
    `+ Catatan tambahan : Pelanggan membayar dengan nominal ${currencyFormatter(
      customAmount,
    )} dan kembaliannya sebesar ${currencyFormatter(
      customAmount - roundingUp(sumTotalNetAmount)!,
    )} `;

  const handlePostOrder = async (token: string) => {
    const additionalInfo = {
      pay_amount:
        selectedPaymentMethod === 'Cash' ? customAmount : sumTotalNetAmount,
      outlet_name: userData?.outlet?.name,
      outlet_address: userData?.outlet?.address,
      sales_type_name: salesItems[selectedSalesIndex]?.name,
      note: additionalNotes,
      paymentMethod: selectedPaymentMethod,
    };
    const item = {
      invoice: new Date().getTime(),
      date: date.toISOString().slice(0, 10),
      gross_amount: totalPrice,
      net_amount:
        selectedPaymentMethod === 'Cash'
          ? roundingUp(sumTotalNetAmount)
          : sumTotalNetAmount,
      sales_type_id: selectedSalesType,
      billing_id: selectedUpdateType == 'update bill' ? selectedBill?.id : null,
      discount_id:
        Object.keys(selectedDiscount).length != 0 ? selectedDiscount.id : null,
      tax_id:
        sumTotalNetAmount == 0 ? null : selectedTax != 0 ? taxItems[0]?.id : null,
      tax: sumTotalNetAmount == 0 ? 0 : (selectedTax / 100) * totalPrice,
      discount: renderDiscountAmount(),
      outlet_id: userData.outlet.id,
      items: orderItems,
      rounding: roundingUp(sumTotalNetAmount)! - sumTotalNetAmount,
      note: JSON.stringify(additionalInfo),
      payment_method: selectedPaymentMethod,
      shift: shift,
      charge: additionalFeesAmount,
    };
    if (selectedUpdateType == 'update history') {
      dispatch(updateOrder(item, selectedBill?.id, token));
    } else {
      dispatch(postOrder(item, token));
    }
  };

  // ============ FROZEN PRINT LOGIC (verbatim from V-113) ============
  const generateReciptText = async () => {
    const text =
      `<C><B>${userData?.outlet?.name}</B></C>\n\n` +
      `<C> ${userData?.outlet?.address}</C>\n` +
      '\n' +
      generateDivider(48) +
      `<L>Tanggal : ${moment().format('DD MMM YYYY, HH:mm:ss')}</L>\n` +
      generateDivider(48) +
      `<C>${salesItems[selectedSalesIndex]?.name}</C>\n` +
      generateDivider(48) +
      '\n\n';

    let itemDesc = '';
    await orderItems.forEach((menu: any) => {
      const item_variant =
        menu.variant_id != null
          ? menu.name !== menu?.original_name
            ? `<L>${menu.name}</L>\n`
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
        `<L>${menu.original_name || menu?.name}</L>\n` +
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
      selectedPaymentMethod !== 'Cash' && additionalFees
        ? generateReceiptRowText(
            48,
            `Charge ${paymentMethod[selectedIndexPath]?.name} ${paymentMethod[selectedIndexPath]?.charge}%`,
            additionalFeesAmount,
            'L',
          )
        : '';
    let rounding =
      selectedPaymentMethod == 'Cash'
        ? generateReceiptRowText(
            48,
            'Pembulatan',
            roundingUp(sumTotalNetAmount)! - sumTotalNetAmount,
            'L',
          )
        : '';
    let payDesc =
      generateDivider(48) +
      generateReceiptRowText(48, 'Subtotal', totalPrice, 'L') +
      generateReceiptRowText(48, 'Pajak', (selectedTax / 100) * totalPrice, 'L') +
      generateReceiptRowText(48, 'Diskon', renderDiscountAmount(), 'L') +
      paymentMethodFee +
      generateDivider(48) +
      generateReceiptRowText(
        48,
        'Total',
        selectedPaymentMethod === 'Cash'
          ? roundingUp(sumTotalNetAmount)!
          : sumTotalNetAmount,
        'L',
      ) +
      rounding +
      '\n' +
      `<C><B>*THIS IS NOT A RECIPT*</B></C>\n` +
      `<C>*Ini bukan struk pembayaran*</C>\n\n` +
      `<C>Terima kasih atas kunjungan Anda</C>\n` +
      `<C>Bebek Pondok Galih</C>\n`;
    let footerText = '';
    if (Object.keys(selectedPrinter).length === 0) {
      return Alert.alert(
        'Printer belum terhubung',
        'Konfigurasi printer dari halaman setting terlebih dahulu',
      );
    }
    try {
      const Printer = printerList[selectedPrinter?.printerType];
      await Printer.printImageBase64(pondokGalihBase64, {
        imageWidth: 400,
        imageHeight: 200,
      });
      await Printer.printBill(text.concat(itemDesc + payDesc + footerText));
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

  const handlePrintBill = () => {
    generateReciptText();
  };

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardSize(e.endCoordinates.height);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', (e) => {
      setKeyboardSize(e.endCoordinates.height);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      if (error) {
        handleHideModal();
        Toast.show({
          type: 'error',
          text1: 'Terjadi kesalahan Order',
          text2: message,
        });
      }
    }
    // Legacy deps: loading + message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, message]);

  useEffect(() => {
    if (isOpen) {
      if (selectedUpdateType == 'update history') {
        const userPayInfo = JSON.parse(selectedBill?.note);
        setSelectedDiscount(
          discountItems.find((x: any) => x.id === selectedBill?.discount_id) || {},
        );
        setCustomAmount(parseInt(userPayInfo?.pay_amount));
        setShowDiscountList(true);
        setDate(new Date(selectedBill?.date));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedUpdateType]);

  const saleName = salesItems.find((item: any) => item.id == selectedSalesType);

  const LoadingIndicator = (
    <View style={styles.Spinner}>
      <AppSpinner size="small" status="info" />
    </View>
  );

  return (
    // Fullscreen dialog: manages the keyboard itself (legacy keyboardSize
    // margin), so it opts out of AppModal's keyboard padding.
    <AppModal
      visible={isOpen}
      avoidKeyboard={false}
      contentStyle={{ width, height }}>
      <View style={[styles.Container, { width, height }]}>
        <View style={styles.HeaderWrapper}>
          <AppButton
            onPress={handleHideModal}
            appearance="outline"
            status="danger"
            size="medium"
            disabled={loading}>
            Cancel
          </AppButton>
          {selectedUpdateType == 'update history' ? (
            <>
              <AppText category="h5" style={{ fontSize: scale(10) }}>
                Update History | {saleName?.name}
              </AppText>
              {loading ? (
                LoadingIndicator
              ) : (
                <AppButton
                  appearance="outline"
                  status="info"
                  size="medium"
                  disabled={loading || customAmount < sumTotalNetAmount}
                  onPress={() => handlePostOrder(token)}>
                  Update Data
                </AppButton>
              )}
            </>
          ) : (
            <>
              <AppText category="h5" style={{ fontSize: scale(10) }}>
                New Order | {saleName?.name}
              </AppText>
              {loading ? (
                LoadingIndicator
              ) : (
                <AppButton
                  appearance="outline"
                  status="info"
                  size="medium"
                  disabled={loading || customAmount < sumTotalNetAmount}
                  onPress={() => handlePostOrder(token)}>
                  Bayar
                </AppButton>
              )}
            </>
          )}
        </View>
        <AppDivider />

        <ScrollView>
          <View style={{ marginBottom: keyboardSize + 20 }}>
            <AppButton
              appearance="ghost"
              status="primary"
              size="giant"
              onPress={handlePrintBill}
              accessoryLeft={
                <AppIcon name="printer" size={24} fill={statusColors.primary} />
              }>
              Print Bill
            </AppButton>
            <Row style={styles.RowStyle}>
              <Col size={1}>
                <View>
                  <AppText category="h4" style={{ fontSize: scale(8) }}>
                    Metode Pembayaran
                  </AppText>
                </View>
              </Col>
              <Col size={3}>
                <View>
                  <AppSelect
                    placeholder="Default"
                    value={selectedPaymentMethod || 'Pilih Metode Lain'}
                    options={paymentMethod}
                    onSelect={(option, index) => {
                      setSelectedIndexPath(index);
                      setSelectedPaymentMethod(paymentMethod[index]?.name);
                      if (paymentMethod[index]?.name !== 'Cash') {
                        let addonValue =
                          (parseInt(paymentMethod[index]?.charge) / 100) *
                          (totalPrice -
                            renderDiscountAmount() +
                            (selectedTax / 100) * totalPrice);
                        setCustomAmount(
                          totalPrice -
                            renderDiscountAmount() +
                            (selectedTax / 100) * totalPrice +
                            addonValue,
                        );
                      }
                    }}
                  />
                </View>
              </Col>
            </Row>
            {selectedPaymentMethod === 'Cash' ? (
              <Row style={styles.RowStyle}>
                <Col size={1}>
                  <View />
                </Col>
                <Col size={3}>
                  <View>
                    <PayAmountButton
                      value={(selectedTax / 100) * totalPrice + totalPrice}
                      onPress={handleAmountButton}
                    />
                    <View style={{ marginTop: verticalScale(2) }}>
                      <CurrencyInput
                        value={customAmount}
                        onChangeValue={(v) => setCustomAmount(v ?? 0)}
                        precision={0}
                        delimiter="."
                        prefix="Rp "
                        style={styles.InputAmount}
                        placeholder="Custom Amount"
                      />
                    </View>
                  </View>
                </Col>
              </Row>
            ) : (
              <Row style={styles.RowStyle}>
                <Col size={1}>
                  <View />
                </Col>
                <Col size={3}>
                  <View style={{ alignItems: 'flex-start', alignSelf: 'flex-start' }}>
                    <AppToggle
                      status="success"
                      checked={additionalFees}
                      onChange={() => setAdditionalFees(!additionalFees)}>
                      Biaya Tambahan
                    </AppToggle>
                  </View>
                </Col>
              </Row>
            )}
            <AppDivider />
            <Row style={styles.RowStyle}>
              <Col size={1}>
                <View>
                  <AppText category="h4" style={{ fontSize: scale(8) }}>
                    Diskon
                  </AppText>
                </View>
              </Col>
              <Col size={3}>
                {showDiscountList ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {discountItems?.map((item: any) => (
                      <AppButton
                        key={item.id}
                        style={{
                          width: '32%',
                          marginRight: 5,
                          marginBottom: verticalScale(3),
                        }}
                        appearance={
                          item.id == selectedDiscount.id ? 'filled' : 'outline'
                        }
                        status="basic"
                        size="small"
                        onPress={() => {
                          setSelectedDiscount(item);
                        }}>
                        <AppText
                          category="h6"
                          appearance="hint"
                          style={{ fontSize: scale(6) }}>
                          {item.type == 'percent'
                            ? item.amount + '%'
                            : currencyFormatter(parseInt(item.amount))}
                        </AppText>
                      </AppButton>
                    ))}
                    <AppButton
                      appearance="filled"
                      status="danger"
                      size="small"
                      style={{ marginBottom: 8, width: '100%' }}
                      onPress={() => setSelectedDiscount({})}
                      disabled={Object.keys(selectedDiscount).length === 0}>
                      Hapus Diskon
                    </AppButton>
                  </View>
                ) : null}
                <AppButton
                  appearance="filled"
                  status="info"
                  size="medium"
                  onPress={() => setShowDiscountList(!showDiscountList)}>
                  {showDiscountList ? 'Sembunyikan Diskon' : 'Tampilkan Diskon'}
                </AppButton>
              </Col>
            </Row>
            <AppDivider />

            <Row style={styles.RowStyle}>
              <View style={styles.OrderTotal}>
                <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                  Gross Amount
                </AppText>
                <AppText category="h6" style={{ fontSize: scale(8) }}>
                  {currencyFormatter(totalPrice)}
                </AppText>
              </View>
            </Row>
            <Row style={styles.RowStyle}>
              <View style={styles.OrderTotal}>
                <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                  Diskon
                </AppText>
                <AppText category="h6" style={{ fontSize: scale(8) }}>
                  {currencyFormatter(renderDiscountAmount())}
                </AppText>
              </View>
            </Row>
            {selectedTax != 0 && (
              <Row style={styles.RowStyle}>
                <View style={styles.OrderTotal}>
                  <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                    Pajak
                  </AppText>
                  {selectedTax != 0 && (
                    <AppText category="h6" style={{ fontSize: scale(8) }}>
                      ({selectedTax}%){' '}
                      {currencyFormatter(
                        isFree ? 0 : (selectedTax / 100) * totalPrice,
                      )}
                    </AppText>
                  )}
                </View>
              </Row>
            )}
            <Row style={styles.RowStyle}>
              <View style={styles.OrderTotal}>
                <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                  Biaya Pembayaran
                </AppText>
                <AppText category="h6" style={{ fontSize: scale(8) }}>
                  {currencyFormatter(additionalFeesAmount)}
                </AppText>
              </View>
            </Row>
            <AppDivider />

            <Row style={styles.RowStyle}>
              <View style={styles.OrderTotal}>
                <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                  Total Tagihan
                </AppText>
                <AppText category="h6" style={{ fontSize: scale(8) }}>
                  {currencyFormatter(isFree ? 0 : sumTotalNetAmount)}
                </AppText>
              </View>
            </Row>
            {selectedPaymentMethod === 'Cash' ? (
              <>
                <Row style={styles.RowStyle}>
                  <View style={styles.OrderTotal}>
                    <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                      Pembulatan
                    </AppText>
                    <AppText category="h6" style={{ fontSize: scale(8) }}>
                      {currencyFormatter(
                        isFree ? 0 : roundingUp(sumTotalNetAmount)!,
                      )}
                    </AppText>
                  </View>
                </Row>
                <Row style={styles.RowStyle}>
                  <View style={styles.OrderTotal}>
                    <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                      Uang Bayar
                    </AppText>
                    <AppText category="h6" style={{ fontSize: scale(8) }}>
                      {currencyFormatter(customAmount)}
                    </AppText>
                  </View>
                </Row>
                <AppDivider />
                <Row style={styles.RowStyle}>
                  <View style={styles.OrderTotal}>
                    <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
                      Kembalian
                    </AppText>
                    <AppText category="h6" style={{ fontSize: scale(8) }}>
                      {currencyFormatter(
                        isFree ? 0 : customAmount - roundingUp(sumTotalNetAmount)!,
                      )}
                    </AppText>
                  </View>
                </Row>
              </>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    alignSelf: 'center',
    padding: scale(10),
  },
  HeaderWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  InputAmount: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'rgb(202,206,219)',
    padding: scale(6),
    fontSize: scale(9),
  },
  OrderTotal: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flex: 1,
  },
  RowStyle: {
    maxWidth: '80%',
    alignSelf: 'center',
    marginVertical: verticalScale(3),
  },
  Spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
