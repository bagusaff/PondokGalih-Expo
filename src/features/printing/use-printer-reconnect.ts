import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';

import { useAppSelector } from '@/state';

// Auto-reconnects the persisted printer on mount — verbatim port of the
// connect effect in legacy Home.screen.js. The only addition (required by
// Android 12+/targetSdk 36, not a logic change) is requesting the Bluetooth
// runtime permissions before a BLE connect.

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

export function usePrinterReconnect() {
  const { selectedPrinter } = useAppSelector((state) => state.setting);

  useEffect(() => {
    const connect = async () => {
      if (!selectedPrinter) return;
      try {
        switch (selectedPrinter.printerType) {
          case 'ble':
            if (!(await ensureBlePermissions())) return;
            BLEPrinter.init().then(async () => {
              await BLEPrinter.connectPrinter(
                selectedPrinter?.inner_mac_address || '',
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
                    text1: 'Terjadi kesalahan saat menghubungkan Printer',
                    text2: err,
                  });
                });
            });
            break;
          case 'net':
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
                    text1: 'Terjadi kesalahan saat menghubungkan Printer',
                    text2: err,
                  });
                });
            });
            break;
          case 'usb':
            USBPrinter.init().then(async () => {
              await USBPrinter.connectPrinter(
                selectedPrinter?.vendor_id || '',
                selectedPrinter?.product_id || '',
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
                    text1: 'Terjadi kesalahan saat menghubungkan Printer',
                    text2: err,
                  });
                });
            });
            break;
          default:
        }
      } catch (err) {
        console.warn(err);
      }
    };
    connect();
    // Legacy effect ran once on mount ([]); keep that behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
