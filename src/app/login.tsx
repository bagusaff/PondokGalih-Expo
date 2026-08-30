import { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  AppButton,
  AppIcon,
  AppInput,
  AppLayout,
  AppRadioGroup,
  AppSpinner,
  AppText,
} from '@/components/ui';
import { loginHandle, useAppDispatch, useAppSelector } from '@/state';
import { colors } from '@/theme';

// 1:1 port of screens/auth/Login.screen.js. keyboard-aware-scroll-view
// (dead lib) replaced by KeyboardAvoidingView + ScrollView.

export default function LoginRoute() {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();

  const loading = useAppSelector((state) => state.user.loading);

  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [shift, setShift] = useState<number | null>(null);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleLoginButton = () => {
    let shiftStatus = '';
    if (shift == 0) {
      shiftStatus = 'Pagi';
    } else if (shift == 1) {
      shiftStatus = 'Siang';
    }
    if (username && password != '') {
      dispatch(loginHandle(username, password, shiftStatus));
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <AppLayout level="4" style={styles.Container}>
          <AppLayout level="1" style={[styles.Wrapper, { width: (40 / 100) * width }]}>
            <View style={styles.HeaderWrapper}>
              <AppText category="h5" style={styles.HeaderText}>
                Selamat Datang
              </AppText>
              <AppText category="p2" appearance="hint">
                Silahkan masukkan Username dan Password
              </AppText>
            </View>
            <AppInput
              value={username}
              label="Username"
              placeholder="Masukkan Username"
              size="large"
              accessoryLeft={<AppIcon name="person" size={24} fill={colors.textHint} />}
              onChangeText={setUsername}
              style={styles.InputForm}
              autoCapitalize="none"
            />
            <AppInput
              value={password}
              label="Password"
              placeholder="Masukkan Password"
              accessoryLeft={<AppIcon name="lock" size={24} fill={colors.textHint} />}
              accessoryRight={
                <TouchableWithoutFeedback onPress={toggleSecureEntry}>
                  <View>
                    <AppIcon
                      name={secureTextEntry ? 'eye-off' : 'eye'}
                      size={24}
                      fill={colors.textHint}
                    />
                  </View>
                </TouchableWithoutFeedback>
              }
              secureTextEntry={secureTextEntry}
              size="large"
              style={styles.InputForm}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <AppText category="label" appearance="hint">
              Pilih Shift
            </AppText>
            <AppRadioGroup
              selectedIndex={shift}
              onChange={setShift}
              labels={['Pagi', 'Siang']}
              style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 8 }}
            />
            <AppButton
              style={styles.Button}
              status="primary"
              disabled={shift == null}
              onPress={handleLoginButton}
              accessoryLeft={
                loading ? (
                  <View style={styles.Spinner}>
                    <AppSpinner size="small" status="basic" />
                  </View>
                ) : undefined
              }>
              {loading ? undefined : 'Masuk'}
            </AppButton>
          </AppLayout>
        </AppLayout>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Wrapper: {
    padding: 25,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
    borderRadius: 10,
    flexDirection: 'column',
  },
  HeaderWrapper: {
    flexDirection: 'column',
    marginTop: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  HeaderText: {
    color: 'rgb(66,87,121)',
    marginBottom: 5,
  },
  InputForm: {
    marginVertical: 10,
  },
  Button: {
    width: '100%',
    marginVertical: 10,
  },
  Spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
