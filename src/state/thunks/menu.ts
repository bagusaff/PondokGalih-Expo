import Toast from 'react-native-toast-message';

import { api, authHeader } from '@/lib/api';

import {
  clearCategories,
  deleteMenuFromFavourite as deleteMenuFromFavouriteAction,
  fetchMenuCategories,
  fetchMenuFailed,
  fetchMenuFavouriteSuccess,
  fetchMenuRequest,
  fetchMenuSalesType,
  fetchMenuSuccess,
} from '../slices/menu';
import type { AppDispatch } from '../store';

// 1:1 port of Menu.creator.js

export const fetchMenuItems =
  (token: string) => async (dispatch: AppDispatch) => {
    dispatch(fetchMenuRequest());
    try {
      const response = await api.get('/menu', authHeader(token));
      if (response.data.status == 'success') {
        dispatch(fetchMenuSuccess(response.data.data));
      } else {
        dispatch(fetchMenuFailed({ message: 'Terjadi kesalahan!' }));
      }
    } catch (error) {
      dispatch(fetchMenuFailed({ message: error }));
    }
  };

export const filterMenuPerSalesType =
  (id: number) => (dispatch: AppDispatch) => {
    if (id) {
      dispatch(fetchMenuSalesType(id));
    }
  };

export const filterMenuPerCategory =
  (id: number | string | null, sales_type?: number, token?: string) =>
  async (dispatch: AppDispatch) => {
    if (typeof id === 'number') {
      dispatch(fetchMenuCategories(id));
    } else if (typeof id === 'string') {
      // Legacy: string id means the "favourite" pseudo-category (server-side).
      dispatch(fetchMenuRequest());
      try {
        const response = await api.get(
          `/favorite?type=${sales_type}`,
          authHeader(token ?? ''),
        );
        if (response.data.status == 'success') {
          dispatch(fetchMenuFavouriteSuccess(response.data.data));
        } else {
          dispatch(fetchMenuFailed({ message: 'Terjadi kesalahan!' }));
        }
      } catch (error) {
        dispatch(fetchMenuFailed({ message: error }));
      }
    } else {
      dispatch(clearCategories());
    }
  };

export const addToFavourite =
  (id: number, token: string) => (_dispatch: AppDispatch) => {
    api
      .post('/favorite', { item_id: id }, authHeader(token))
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Berhasil menambahkan menu ke favorit!',
        });
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Terjadi kesalahan.',
          text2: error.response.data.message,
        });
      });
  };

export const deleteFromFavourite =
  (id: number, token: string) => (dispatch: AppDispatch) => {
    api
      .delete(`/favorite/${id}`, authHeader(token))
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Berhasil menghapus menu dari favorit!',
        });
        dispatch(deleteMenuFromFavouriteAction(id));
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Terjadi kesalahan.',
          text2: error.response.data.message,
        });
        console.log('error', error?.response.data.message);
      });
  };
