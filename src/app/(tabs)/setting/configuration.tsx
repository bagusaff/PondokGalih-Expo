import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { NoConnection } from '@/components/no-connection';
import {
  AppButton,
  AppDivider,
  AppIcon,
  AppLayout,
  AppText,
} from '@/components/ui';
import {
  setAutoPrintBill,
  setPrintCopy,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { moderateScale } from '@/theme';

// 1:1 port of screens/setting/Configuration.screen.js (print copy count +
// auto-print-bill toggle; RN core Switch as in legacy).

export default function ConfigurationRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { printCopyCount, autoPrintBill } = useAppSelector(
    (state) => state.setting,
  );

  const [newPrintCopy, setNewPrintCopy] = useState(printCopyCount);
  const [autoPrintCopy, setAutoPrintCopy] = useState(autoPrintBill);

  const backHandler = () => {
    router.back();
  };

  const updatePrintCount = (value: number) => {
    if (value < 1) {
      newPrintCopy > 1 &&
        setNewPrintCopy((prevValue: number) => prevValue + value);
    } else {
      setNewPrintCopy((prevValue: number) => prevValue + value);
    }
  };

  const saveUpdate = () => {
    dispatch(setPrintCopy(newPrintCopy));
    dispatch(setAutoPrintBill(autoPrintCopy));
    router.back();
  };

  return (
    <>
      <NoConnection />
      <AppLayout level="3" style={styles.Wrapper}>
        <View style={styles.Container}>
          <View style={styles.ButtonContainer}>
            <AppButton
              style={styles.Button}
              appearance="ghost"
              accessoryLeft={<AppIcon name="arrow-back" size={32} fill="#000" />}
              onPress={backHandler}
            />
            <AppText category="h5">Konfigurasi Lanjutan</AppText>
          </View>
          <AppDivider />
          <View style={styles.Row}>
            <AppText category="h6">Jumlah Salinan Nota Print</AppText>
            <View style={{ flexDirection: 'row' }}>
              <AppButton
                status="basic"
                appearance="outline"
                onPress={() => updatePrintCount(-1)}>
                -
              </AppButton>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 30,
                }}>
                <AppText>{newPrintCopy}</AppText>
              </View>
              <AppButton
                status="basic"
                appearance="outline"
                onPress={() => updatePrintCount(1)}>
                +
              </AppButton>
            </View>
          </View>
          <AppDivider />
          <View style={[styles.Row, { paddingVertical: 0, marginVertical: 15 }]}>
            <AppText category="h6">
              Otomatis print bill ketika simpan Order
            </AppText>
            <View style={{ flex: 1 }}>
              <Switch
                trackColor={{ false: '#767577', true: '#009900' }}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setAutoPrintCopy}
                value={autoPrintCopy}
              />
            </View>
          </View>
          <AppDivider />
        </View>
        <View>
          <AppButton
            onPress={saveUpdate}
            disabled={
              printCopyCount === newPrintCopy && autoPrintBill == autoPrintCopy
            }>
            Simpan Perubahan
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
  Container: {
    flex: 1,
    backgroundColor: '#FFF',
    marginBottom: 15,
    padding: moderateScale(5),
  },
  Row: {
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Icon: {
    width: 32,
    height: 32,
  },
  Button: {
    margin: 2,
  },
});
