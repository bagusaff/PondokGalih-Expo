import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';

import { pondokGalihBase64 } from '@/features/printing/logo';

// Phase 0 spike screen — throwaway. Verifies the legacy printer lib works on
// Expo SDK 57 / RN 0.86 (New Architecture interop) before the real migration.

type PrinterType = 'ble' | 'net' | 'usb';

const printers = { ble: BLEPrinter, net: NetPrinter, usb: USBPrinter } as const;

async function requestBlePermissions(): Promise<boolean> {
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

export default function PrinterSpikeScreen() {
  const [type, setType] = useState<PrinterType>('ble');
  const [devices, setDevices] = useState<any[]>([]);
  const [connected, setConnected] = useState<string | null>(null);
  const [host, setHost] = useState('192.168.1.');
  const [port, setPort] = useState('9100');
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [
      `${new Date().toLocaleTimeString()}  ${msg}`,
      ...prev.slice(0, 30),
    ]);
  }, []);

  const scan = useCallback(async () => {
    setDevices([]);
    setConnected(null);
    try {
      if (type === 'ble') {
        const ok = await requestBlePermissions();
        if (!ok) {
          addLog('BLE permissions denied');
          return;
        }
      }
      const Printer = printers[type];
      await Printer.init();
      addLog(`${type}: init OK`);
      if (type === 'net') return; // net uses manual host/port
      const results = await Printer.getDeviceList();
      addLog(`${type}: found ${results?.length ?? 0} device(s)`);
      setDevices(results ?? []);
    } catch (err) {
      addLog(`${type}: ERROR ${String(err)}`);
    }
  }, [type, addLog]);

  useEffect(() => {
    scan();
  }, [scan]);

  const connectBle = async (device: any) => {
    try {
      const printer = await BLEPrinter.connectPrinter(
        device?.inner_mac_address ?? '',
      );
      setConnected(printer?.device_name ?? device?.device_name ?? 'BLE printer');
      addLog(`BLE connected: ${device?.inner_mac_address}`);
    } catch (err) {
      addLog(`BLE connect ERROR: ${String(err)}`);
    }
  };

  const connectNet = async () => {
    try {
      await NetPrinter.init();
      await NetPrinter.connectPrinter(host, parseInt(port, 10) || 9100);
      setConnected(`${host}:${port}`);
      addLog(`NET connected: ${host}:${port}`);
    } catch (err) {
      addLog(`NET connect ERROR: ${String(err)}`);
    }
  };

  const printSample = async () => {
    try {
      const Printer = printers[type];
      Printer.printImageBase64(pondokGalihBase64, {
        imageWidth: 400,
        imageHeight: 200,
      });
      await Printer.printBill('<C>SPIKE TEST - PONDOK GALIH</C>\n<L>Kiri</L>\n<R>Kanan</R>\n');
      addLog('print sample sent');
    } catch (err) {
      addLog(`print ERROR: ${String(err)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Printer Spike (Phase 0)</Text>

      <View style={styles.row}>
        {(['ble', 'net', 'usb'] as PrinterType[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeButton, type === t && styles.typeButtonActive]}>
            <Text style={type === t ? styles.typeTextActive : styles.typeText}>
              {t.toUpperCase()}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={scan} style={styles.actionButton}>
          <Text style={styles.actionText}>Rescan</Text>
        </Pressable>
      </View>

      {type === 'net' ? (
        <View style={styles.row}>
          <TextInput value={host} onChangeText={setHost} style={styles.input} placeholder="Host" />
          <TextInput value={port} onChangeText={setPort} style={[styles.input, { width: 80 }]} keyboardType="numeric" placeholder="Port" />
          <Pressable onPress={connectNet} style={styles.actionButton}>
            <Text style={styles.actionText}>Connect</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={styles.deviceList}
          data={devices}
          keyExtractor={(item, i) => `${item?.inner_mac_address ?? i}`}
          ListEmptyComponent={<Text style={styles.hint}>No devices found</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => connectBle(item)} style={styles.deviceRow}>
              <Text>{item?.device_name ?? 'Unknown'} ({item?.inner_mac_address})</Text>
            </Pressable>
          )}
        />
      )}

      <View style={styles.row}>
        <Text style={styles.hint}>
          {connected ? `Connected: ${connected}` : 'Not connected'}
        </Text>
        <Pressable
          onPress={printSample}
          style={[styles.actionButton, !connected && styles.disabled]}
          disabled={!connected}>
          <Text style={styles.actionText}>Print sample</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.logBox}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logLine}>{line}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#009900',
  },
  typeButtonActive: { backgroundColor: '#009900' },
  typeText: { color: '#009900' },
  typeTextActive: { color: '#fff', fontWeight: '700' },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#008EE0',
    marginLeft: 'auto',
  },
  actionText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
  },
  deviceList: { maxHeight: 200 },
  deviceRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  hint: { color: '#8F9BB3' },
  logBox: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 4,
    padding: 8,
  },
  logLine: { fontSize: 12, fontFamily: Platform.select({ default: 'monospace', ios: 'Menlo' }) },
});
