import Toast from 'react-native-toast-message';

import { api, authHeader } from '@/lib/api';
import { navigate, replace } from '@/lib/legacy-navigation';

import { logout } from '../actions';
import { fetchCategorySuccess } from '../slices/category';
import { fetchDiscountSuccess } from '../slices/discount';
import { fetchMenuSuccess } from '../slices/menu';
import { fetchSalesSuccess } from '../slices/sales-type';
import { fetchTaxSuccess } from '../slices/tax';
import {
  getAllDataFailed,
  getAllDataRequest,
  getAllDataSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
} from '../slices/user';
import type { AppDispatch } from '../store';

// 1:1 port of Auth.creator.js (V-113). react-redux batch() dropped — React 18+
// auto-batches dispatches.

export const loginHandle =
  (username: string, password: string, shift: string) =>
  (dispatch: AppDispatch) => {
    dispatch(loginRequest());
    api
      .post('/login', { username, password })
      .then((res) => {
        dispatch(loginSuccess({ ...res.data, shift }));
        // Legacy navigated to 'Splash' in the Auth stack — which is
        // PreFetchScreen (Auth.stack.js registers PreFetch under that name).
        navigate('/prefetch');
      })
      .catch((err) => {
        console.log('message', err.response);
        dispatch(loginFailure({ message: 'Unauthorized' }));
        Toast.show({
          type: 'error',
          text1: 'Terjadi kesalahan Koneksi!',
          text2: err.response?.data?.message || 'Periksa koneksi jaringan anda',
        });
      });
  };

export const syncAllData = (token: string) => (dispatch: AppDispatch) => {
  dispatch(getAllDataRequest());
  api
    .get('/sync', {
      ...authHeader(token),
      timeout: 5000,
      timeoutErrorMessage: 'Timeout Fetching Data',
    })
    .then((res) => {
      setTimeout(() => {
        dispatch(fetchMenuSuccess(res.data.data.items));
        dispatch(fetchCategorySuccess(res.data.data.categories));
        dispatch(fetchDiscountSuccess(res.data.data.discounts));
        dispatch(fetchSalesSuccess(res.data.data));
        dispatch(fetchTaxSuccess(res.data.data.taxs));
        dispatch(getAllDataSuccess());
        Toast.show({
          type: 'success',
          text1: 'Berhasil memperbarui data! 🎉',
        });
        replace('/home');
      }, 1000);
    })
    .catch((err) => {
      console.log('sync err msg:', err);
      dispatch(getAllDataFailed({ message: 'Sync data failed' }));
    });
};

export const logoutHandle = () => (dispatch: AppDispatch) => {
  dispatch(logout());
  replace('/login');
};
