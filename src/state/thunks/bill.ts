import Toast from 'react-native-toast-message';

import { api, authHeader } from '@/lib/api';

import {
  deleteBillRequest,
  fetchBill,
  fetchBillFailed,
  fetchBillSuccess,
  resetBill,
  selectBill as selectBillAction,
  uploadBill as uploadBillAction,
  uploadBillFailed,
  uploadBillSuccess,
} from '../slices/bill';
import { resetOrderItem } from '../slices/order';
import type { AppDispatch } from '../store';

// 1:1 port of Bill.creator.js

export const fetchBillItems =
  (token: string) => async (dispatch: AppDispatch) => {
    dispatch(fetchBill());
    try {
      const response = await api.get('/billing', authHeader(token));
      if (response.data.status == 'success') {
        dispatch(fetchBillSuccess(response.data));
      } else {
        dispatch(fetchBillFailed({ message: 'Terjadi kesalahan!' }));
      }
    } catch (error) {
      dispatch(fetchBillFailed({ message: error }));
    }
  };

export const uploadBill =
  (items: any, token: string) => async (dispatch: AppDispatch) => {
    dispatch(uploadBillAction());
    try {
      api
        .post('/billing', items, authHeader(token))
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Berhasil menambahkan pesanan ke billing!',
          });
          dispatch(uploadBillSuccess(new Date()));
          dispatch(resetOrderItem());
        })
        .catch((error) => {
          Toast.show({
            type: 'error',
            text1: 'Terjadi kesalahan.',
            text2: error.toString(),
          });
          dispatch(uploadBillFailed(error.response.message));
          console.log(error.response.message);
        });
    } catch (error) {
      dispatch(uploadBillFailed(error));
    }
  };

export const selectBill = (item: any) => (dispatch: AppDispatch) => {
  dispatch(selectBillAction(item));
};

export const resetSelectedBill = () => (dispatch: AppDispatch) => {
  dispatch(resetBill());
};

export const updateBill =
  (id: number | string, items: any, token: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(uploadBillAction());
    try {
      api
        .put(`/billing/${id}`, items, authHeader(token))
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Berhasil memperbarui billing!',
          });
          dispatch(uploadBillSuccess(new Date()));
          dispatch(resetOrderItem());
          dispatch(resetBill());
        })
        .catch((error) => {
          Toast.show({
            type: 'error',
            text1: 'Terjadi kesalahan.',
            text2: error.toString(),
          });
          dispatch(uploadBillFailed(error.response.message));
          console.log(error);
        });
    } catch (error) {
      dispatch(uploadBillFailed(error));
    }
  };

export const deleteBill =
  (id: number | string, token: string) => async (dispatch: AppDispatch) => {
    dispatch(deleteBillRequest());
    try {
      api
        .delete(`/billing/${id}`, authHeader(token))
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Berhasil menghapus billing!',
          });
          dispatch(uploadBillSuccess(new Date()));
        })
        .catch((error) => {
          Toast.show({
            type: 'error',
            text1: 'Terjadi kesalahan.',
            text2: error.toString(),
          });
          dispatch(uploadBillFailed(error?.response?.message));
        });
    } catch (error) {
      console.log(error);
      dispatch(uploadBillFailed(error));
    }
  };
