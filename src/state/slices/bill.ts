import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of Bill.reducer.js. lastUpdated/lastOperation hold Date objects,
// as in legacy (store serializableCheck is disabled for this).

export type BillState = {
  billItems: any[];
  selectedBill: Record<string, any>;
  loading: boolean;
  message: string;
  lastUpdated: Date | string;
  lastOperation: Date | string;
};

const buildInitialState = (): BillState => ({
  billItems: [],
  selectedBill: {},
  loading: false,
  message: '',
  lastUpdated: new Date(),
  lastOperation: new Date(),
});

const billSlice = createSlice({
  name: 'bill',
  initialState: buildInitialState,
  reducers: {
    fetchBill(state) {
      state.loading = true;
    },
    fetchBillSuccess(
      state,
      action: PayloadAction<{ data: any[]; timestamp: Date | string }>,
    ) {
      state.loading = false;
      state.billItems = action.payload.data;
      state.lastUpdated = action.payload.timestamp;
    },
    fetchBillFailed(state, action: PayloadAction<any>) {
      state.loading = false;
      state.message = action.payload;
    },
    uploadBill(state) {
      state.loading = true;
    },
    uploadBillSuccess(state, action: PayloadAction<Date | string>) {
      state.loading = false;
      state.lastOperation = action.payload;
    },
    uploadBillFailed(state, action: PayloadAction<any>) {
      state.loading = false;
      state.message = action.payload;
    },
    selectBill(state, action: PayloadAction<any>) {
      state.selectedBill = action.payload;
    },
    resetBill(state) {
      state.selectedBill = {};
    },
    deleteBillRequest(state) {
      state.loading = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => buildInitialState());
  },
});

export const {
  fetchBill,
  fetchBillSuccess,
  fetchBillFailed,
  uploadBill,
  uploadBillSuccess,
  uploadBillFailed,
  selectBill,
  resetBill,
  deleteBillRequest,
} = billSlice.actions;
export default billSlice.reducer;
