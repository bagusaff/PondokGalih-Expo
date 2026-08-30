import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { changeCategory } from '../slices/category';
import { checkingConnection } from '../slices/connection';
import { changeSalesTypeAction } from '../slices/sales-type';
import {
  setAutoPrintBillAction,
  setPrintCopyAction,
  setPrinterAction,
} from '../slices/setting';
import type { AppDispatch } from '../store';

// 1:1 ports of Connection.creator.js, SalesType.creator.js,
// Category.creator.js and Setting.creator.js.

export const checkConnection = () => (dispatch: AppDispatch) => {
  NetInfo.addEventListener((state) => {
    dispatch(checkingConnection(!!state.isConnected));
  });
};

export const changeSalesType =
  (type: number, index: number) => (dispatch: AppDispatch) => {
    dispatch(changeSalesTypeAction({ type, index }));
  };

export const setSelectedCategory =
  (id: number | string | null) => (dispatch: AppDispatch) => {
    dispatch(changeCategory(id));
  };

export const setPrinter =
  (printer: Record<string, any>) => (dispatch: AppDispatch) => {
    dispatch(setPrinterAction(printer));
  };

export const setPrintCopy = (number: number) => (dispatch: AppDispatch) => {
  dispatch(setPrintCopyAction(number));
  Toast.show({
    type: 'success',
    text1: 'Berhasil memperbarui pengaturan',
  });
};

export const setAutoPrintBill = (value: boolean) => (dispatch: AppDispatch) => {
  dispatch(setAutoPrintBillAction(value));
};
