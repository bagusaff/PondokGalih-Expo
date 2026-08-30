import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of Setting.reducer.js — selectedPrinter shape comes from the
// thermal printer lib and is persisted for auto-reconnect on app start.

export type SettingState = {
  selectedPrinter: Record<string, any>;
  printCopyCount: number;
  autoPrintBill: boolean;
};

const initialState: SettingState = {
  selectedPrinter: {},
  printCopyCount: 1,
  autoPrintBill: false,
};

const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    setPrinterAction(state, action: PayloadAction<Record<string, any>>) {
      state.selectedPrinter = action.payload;
    },
    setPrintCopyAction(state, action: PayloadAction<number>) {
      state.printCopyCount = action.payload;
    },
    setAutoPrintBillAction(state, action: PayloadAction<boolean>) {
      state.autoPrintBill = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { setPrinterAction, setPrintCopyAction, setAutoPrintBillAction } =
  settingSlice.actions;
export default settingSlice.reducer;
