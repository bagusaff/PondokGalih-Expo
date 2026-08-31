import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { syncAllData, useAppDispatch, useAppSelector } from '@/state';

// 1:1 port of screens/PreFetchScreen.js — syncs all data then the thunk
// replaces to /home. Deviation (2026-08-31, owner-reported hang): legacy had
// no failure path — a network error left this screen loading forever. Now a
// failed sync shows a retry button.

const paperplane = require('../assets/animations/paperplane-animation.json');

export default function PrefetchRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);
  const loading = useAppSelector((state) => state.user.loading);

  const [attempted, setAttempted] = useState(false);

  const startSync = () => {
    setAttempted(false);
    dispatch(syncAllData(token));
    // Mark attempted on the next tick so the failure UI only appears after
    // this sync round-trip actually finishes (loading goes true -> false).
    setTimeout(() => setAttempted(true), 0);
  };

  useEffect(() => {
    startSync();
    // Legacy effect ran once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failed = attempted && !loading;

  return (
    <View style={styles.container}>
      <LottieView source={paperplane} autoPlay loop style={styles.animation} />
      {failed ? (
        <View style={{ alignItems: 'center', gap: 16 }}>
          <AppText category="h5" status="danger">
            Gagal mengambil data. Periksa koneksi jaringan anda.
          </AppText>
          <AppButton status="primary" size="large" onPress={startSync}>
            Coba Lagi
          </AppButton>
        </View>
      ) : (
        <AppText category="h5">Mengambil data, mohon tunggu sebentar...</AppText>
      )}
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
  animation: {
    width: 500,
    height: 250,
  },
});
