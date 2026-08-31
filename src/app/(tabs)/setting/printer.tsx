import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  NetPrinterEventEmitter,
  RN_THERMAL_RECEIPT_PRINTER_EVENTS,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';

import { NoConnection } from '@/components/no-connection';
import {
  AppButton,
  AppDivider,
  AppIcon,
  AppInput,
  AppLayout,
  AppSpinner,
  AppText,
} from '@/components/ui';
import { pondokGalihBase64 } from '@/features/printing/logo';
import { setPrinter, useAppDispatch } from '@/state';
import { moderateScale } from '@/theme';

// 1:1 port of screens/setting/Printer.screen.js — printer discovery and
// connection (BLE/Net/USB). Logic verbatim; the only addition is the
// Android 12+ Bluetooth runtime-permission request before BLE scanning.

const printerList: Record<string, any> = {
  net: NetPrinter,
  ble: BLEPrinter,
  usb: USBPrinter,
};

async function ensureBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(result).every(
      (v) => v === PermissionsAndroid.RESULTS.GRANTED,
    );
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

const renderDeviceType = (text: string) => {
  switch (text) {
    case 'ble':
      return 'Bluetooth Printer';
    case 'net':
      return 'Network Printer';
    case 'usb':
      return 'USB Printer';
    default:
      return 'Thermal Printer';
  }
};

export default function PrinterRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedValue, setSelectedValue] = useState('net');
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [keyboardSize, setKeyboardSize] = useState(0);

  const backHandler = () => {
    router.back();
  };

  const savePrinterToRedux = (printer: any) => {
    dispatch(setPrinter(printer));
  };

  const handleChangeHostAndPort = (params: string) => (text: string) => {
    let textVal: string | number = text;
    if (params == 'port') {
      textVal = parseFloat(text);
    }
    setSelectedPrinter((prev: any) => ({
      ...prev,
      device_name: 'Net Printer',
      [params]: textVal,
      printerType: 'net',
    }));
  };

  useEffect(() => {
    const getListDevices = async () => {
      const Printer = printerList[selectedValue];
      try {
        setLoading(true);
        if (selectedValue === 'ble' && !(await ensureBlePermissions())) return;
        await Printer.init();
        const results = await Printer.getDeviceList();
        // Net printers resolve undefined here — their results arrive via the
        // NetPrinterEventEmitter listener below instead.
        setDevices(
          (results ?? []).map((item: any) => ({
            ...item,
            printerType: selectedValue,
          })),
        );
      } catch (err) {
        console.log('error', err);
      } finally {
        setLoading(false);
      }
    };
    getListDevices();
    // Legacy effect ran once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (devices.length === 0) {
      setLoading(true);
      NetPrinterEventEmitter.addListener(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
        (printers: any) => {
          if (printers) {
            setLoading(false);
            setDevices(printers);
          }
        },
      );
      (async () => {
        await NetPrinter.getDeviceList();
      })();
    }
    return () => {
      NetPrinterEventEmitter.removeAllListeners(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
      );
      NetPrinterEventEmitter.removeAllListeners(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_ERROR,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleConnectSelectedPrinter = () => {
    setLoading(true);
    if (!selectedPrinter) return;
    const connect = async () => {
      try {
        switch (selectedPrinter.printerType) {
          case 'ble':
            if (!(await ensureBlePermissions())) break;
            await BLEPrinter.connectPrinter(
              selectedPrinter?.inner_mac_address || '',
            )
              .then((printer: any) => {
                savePrinterToRedux({
                  ...printer,
                  printerType: selectedPrinter.printerType,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Berhasil menghubungkan Printer',
                });
              })
              .catch((err: any) => {
                Toast.show({
                  type: 'error',
                  text1: 'Terjadi kesalahan saat menghubungkan Printer',
                  text2: err,
                });
              });
            break;
          case 'net':
            NetPrinter.connectPrinter(
              selectedPrinter?.host || '192.168.0.0',
              selectedPrinter?.port || 9100,
            )
              .then((printer: any) => {
                savePrinterToRedux({
                  ...printer,
                  printerType: selectedPrinter.printerType,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Berhasil menghubungkan Printer',
                });
              })
              .catch((err: any) => {
                console.log('Error Reseponse', err, err?.response);
                NetPrinter.closeConn();
                Toast.show({
                  type: 'error',
                  text1: 'Terjadi kesalahan saat menghubungkan Printer',
                  text2: err,
                });
              });
            break;
          case 'usb':
            await USBPrinter.connectPrinter(
              selectedPrinter?.vendor_id || '',
              selectedPrinter?.product_id || '',
            )
              .then((printer: any) => {
                savePrinterToRedux({
                  ...printer,
                  printerType: selectedPrinter.printerType,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Berhasil menghubungkan Printer',
                });
              })
              .catch((err: any) => {
                Toast.show({
                  type: 'error',
                  text1: 'Terjadi kesalahan saat menghubungkan Printer',
                  text2: err,
                });
              });
            break;
          default:
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    connect();
  };

  const handlePrint = async () => {
    try {
      const Printer = printerList[selectedValue];
      Printer.printImageBase64(pondokGalihBase64, {
        imageWidth: 400,
        imageHeight: 200,
      });
      await Printer.printBill('<C>sample text</C>');
    } catch (err) {
      console.warn(err);
    }
  };

  const handleChangePrinterType = (type: string) => {
    setSelectedValue((prev) => {
      printerList[prev].closeConn();
      return type;
    });
    setSelectedPrinter({});
  };

  // Hints per printer type (owner feedback 2026-08-31: the screen needed
  // labels/hints — an empty native Picker rendered as a lone chevron).
  const typeHints: Record<string, string> = {
    net: 'Printer LAN/WiFi — masukkan alamat IP printer dan port (umumnya 9100), lalu tekan Hubungkan.',
    ble: 'Pastikan Bluetooth aktif dan printer sudah dipasangkan (paired) dengan tablet ini.',
    usb: 'Hubungkan printer melalui kabel USB/OTG sebelum memindai.',
  };

  const _renderDeviceList = () =>
    devices.length === 0 ? (
      <AppText category="c1" appearance="hint" style={{ marginVertical: 8 }}>
        {selectedValue === 'net'
          ? 'Tidak ada printer terdeteksi otomatis — isi Host & Port di atas secara manual.'
          : 'Tidak ada printer ditemukan. Pastikan printer menyala, lalu buka ulang halaman ini.'}
      </AppText>
    ) : (
      <View style={styles.pickerFrame}>
        <Picker
          selectedValue={selectedPrinter}
          onValueChange={setSelectedPrinter}>
          {devices.map((item, index) => (
            <Picker.Item
              label={item.device_name}
              value={item}
              key={`printer-item-${index}`}
            />
          ))}
        </Picker>
      </View>
    );

  const _renderNet = () => (
    <View
      style={{ flex: 1, paddingVertical: 8, marginBottom: keyboardSize + 20 }}>
      <View style={styles.rowDirection}>
        <AppText category="s1" style={styles.inputLabel}>
          Host:
        </AppText>
        <AppInput
          placeholder="192.168.100.19"
          onChangeText={handleChangeHostAndPort('host')}
          style={{ flex: 1 }}
          defaultValue="192.168.1."
        />
      </View>
      <View style={styles.rowDirection}>
        <AppText category="s1" style={styles.inputLabel}>
          Port:
        </AppText>
        <AppInput
          keyboardType="numeric"
          placeholder="9100"
          onChangeText={handleChangeHostAndPort('port')}
          style={{ flex: 1 }}
          defaultValue={'9100'}
        />
      </View>
      <AppText category="label" appearance="hint" style={{ marginTop: 8 }}>
        PRINTER TERDETEKSI DI JARINGAN
      </AppText>
      {_renderDeviceList()}
    </View>
  );

  const _renderOther = () => (
    <View style={{ paddingVertical: 8 }}>
      <AppText category="label" appearance="hint">
        PRINTER DITEMUKAN
      </AppText>
      {_renderDeviceList()}
    </View>
  );

  return (
    <>
      <NoConnection />
      <AppLayout level="3" style={styles.Wrapper}>
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <AppSpinner size="giant" status="info" />
            </View>
          ) : null}
          <ScrollView>
            <View style={styles.buttonContainer}>
              <AppButton
                style={styles.button}
                appearance="ghost"
                accessoryLeft={<AppIcon name="arrow-back" size={32} fill="#000" />}
                onPress={backHandler}
              />
              <AppText category="h5">Printer Device</AppText>
            </View>
            <AppDivider style={{ marginBottom: 16 }} />
            <AppText category="h6">Pilih tipe printer</AppText>
            <View style={[styles.pickerFrame, { marginTop: 8 }]}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={handleChangePrinterType}>
                {Object.keys(printerList).map((item, index) => (
                  <Picker.Item
                    label={renderDeviceType(item)}
                    value={item}
                    key={`printer-type-item-${index}`}
                  />
                ))}
              </Picker>
            </View>
            <AppText category="c1" appearance="hint" style={{ marginTop: 6 }}>
              {typeHints[selectedValue]}
            </AppText>
            <View style={styles.section}>
              <AppText category="h6" style={{ marginTop: 16 }}>
                Pilih printer
              </AppText>
              {selectedValue === 'net' ? _renderNet() : _renderOther()}
            </View>
          </ScrollView>

          <AppButton
            disabled={!selectedPrinter?.device_name}
            onPress={handleConnectSelectedPrinter}
            status="info"
            style={{ marginBottom: 16 }}>
            Hubungkan Printer
          </AppButton>
          <AppButton
            disabled={!selectedPrinter?.device_name}
            onPress={handlePrint}
            status="info"
            appearance="outline">
            Cetak Tes Print
          </AppButton>
        </View>
      </AppLayout>
    </>
  );
}

const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    height: '100%',
    padding: moderateScale(5),
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
  },
  button: {
    margin: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    flex: 1,
  },
  rowDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    width: 56,
  },
  // Frames the native Pickers so they read as form fields (match AppInput).
  pickerFrame: {
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 4,
    backgroundColor: '#F7F9FC',
  },
});
