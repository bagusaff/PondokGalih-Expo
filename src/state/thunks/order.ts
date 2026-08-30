import Toast from 'react-native-toast-message';

import { api, authHeader } from '@/lib/api';
import { navigate } from '@/lib/legacy-navigation';

import { resetBill } from '../slices/bill';
import {
  addOrderItem as addOrderItemAction,
  changeOrderQty,
  deleteOrderItem as deleteOrderItemAction,
  loadOrder,
  resetOrderItem as resetOrderItemAction,
  setFinishedOrder,
  uploadOrder,
  uploadOrderFailed,
  uploadOrderSuccess,
  type OrderItem,
} from '../slices/order';
import type { AppDispatch } from '../store';

// 1:1 port of Order.creator.js (V-113): invoice is generated first, then the
// order is posted with it. Legacy signatures preserved.

export const postOrder =
  (item: any, token: string) => async (dispatch: AppDispatch) => {
    dispatch(uploadOrder());
    api
      .get('/generate-invoice', authHeader(token))
      .then((response) => {
        if (response?.data?.status == 'success') {
          api
            .post(
              '/order',
              { ...item, invoice: response?.data?.data?.invoice },
              authHeader(token),
            )
            .then((response) => {
              dispatch(uploadOrderSuccess(response.data.status));
              dispatch(resetOrderItemAction());
              dispatch(resetBill());
              // Payload goes through the store; expo-router params are
              // string-serialized (legacy used navigation params).
              dispatch(setFinishedOrder(response.data.data));
              navigate('/finish-order');
            })
            .catch((error) => {
              dispatch(uploadOrderFailed(error.response.data.message));
              console.log(error.response.data.message);
            });
        }
      })
      .catch((error) => {
        dispatch(uploadOrderFailed(error.response.data.message));
        console.log('ERROR get Invoice', error.response);
      });
  };

export const addOrderItem = (item: OrderItem) => (dispatch: AppDispatch) => {
  dispatch(addOrderItemAction(item));
};

export const deleteOrderItem =
  (id: number, variant_id?: number | null) => (dispatch: AppDispatch) => {
    dispatch(deleteOrderItemAction({ id, variant_id }));
  };

export const resetOrderItem = () => (dispatch: AppDispatch) => {
  dispatch(resetOrderItemAction());
};

export const changeQty =
  (price: number, item_id: number, qty: number, variant_id?: number | null) =>
  (dispatch: AppDispatch) => {
    dispatch(changeOrderQty({ item_id, qty, price, variant_id }));
  };

export const loadOrderItems = (items: OrderItem[]) => (dispatch: AppDispatch) => {
  dispatch(loadOrder(items));
  navigate('/home');
};

export const updateOrder =
  (items: any, id: number | string, token: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(uploadOrder());
    api
      .put(`/order/${id}`, items, authHeader(token))
      .then((res) => {
        dispatch(uploadOrderSuccess(res.data.status));
        dispatch(resetOrderItemAction());
        dispatch(resetBill());
        dispatch(setFinishedOrder(res.data.data));
        navigate('/finish-order');
      })
      .catch((err) => {
        console.log('Error PUT Order ====>', JSON.stringify(err.response.data));
        dispatch(uploadOrderFailed(err.response.data.message));
      });
  };

export const refundOrder =
  (order_id: number | string, token: string) => async (_dispatch: AppDispatch) => {
    api
      .put(`/order/refund/${order_id}`, {}, authHeader(token))
      .then((res) => {
        Toast.show({
          type: 'success',
          text1: 'Berhasil  melakukan refund',
          text2: res?.data?.message,
        });
        navigate('/home');
      })
      .catch((err) => {
        console.log('err refund ===>', err?.response?.data?.message);
        Toast.show({
          type: 'error',
          text1: 'Terjadi kesalahan.',
          text2: err?.response?.data?.message,
        });
      });
  };
