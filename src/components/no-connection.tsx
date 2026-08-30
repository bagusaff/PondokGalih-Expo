import { useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { checkConnection, useAppDispatch, useAppSelector } from '@/state';

// 1:1 port of components/alerts/NoConnection.js — red offline banner.

export function NoConnection() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector((state) => state.connection.isConnected);

  const [loading, setLoading] = useState(false);

  const handlePressCheckConnection = () => {
    setLoading(true);
    dispatch(checkConnection());
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  if (isConnected) return null;

  return (
    <View style={styles.Container}>
      <Text style={{ color: '#FFF' }}>Tidak ada koneksi</Text>
      <TouchableWithoutFeedback
        onPress={handlePressCheckConnection}
        disabled={loading}>
        <Text style={{ color: '#FFF', textDecorationLine: 'underline' }}>
          {loading ? 'Mohon Tunggu...' : 'Tekan untuk menghubungkan kembali'}
        </Text>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    width: '100%',
    backgroundColor: 'red',
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
