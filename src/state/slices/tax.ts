import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of Tax.reducer.js

export type TaxState = {
  taxItems: any[];
  loading: boolean;
  message: string;
};

const initialState: TaxState = {
  taxItems: [],
  loading: true,
  message: '',
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    fetchTaxRequest(state) {
      state.loading = true;
    },
    fetchTaxSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.taxItems = action.payload;
    },
    fetchTaxFailed(state, action: PayloadAction<{ message: string }>) {
      state.loading = false;
      state.message = action.payload.message;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { fetchTaxRequest, fetchTaxSuccess, fetchTaxFailed } =
  taxSlice.actions;
export default taxSlice.reducer;
