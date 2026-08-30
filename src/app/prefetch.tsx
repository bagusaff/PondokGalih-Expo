import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { syncAllData, useAppDispatch, useAppSelector } from '@/state';

// 1:1 port of screens/PreFetchScreen.js — syncs all data then the thunk
// replaces to /home.

const paperplane = require('../assets/animations/paperplane-animation.json');

export default function PrefetchRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    dispatch(syncAllData(token));
    // Legacy effect ran once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <LottieView source={paperplane} autoPlay loop style={styles.animation} />
      <AppText category="h5">Mengambil data, mohon tunggu sebentar...</AppText>
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
