import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of Discount.reducer.js

export type DiscountState = {
  discountItems: any[];
  loading: boolean;
  message: string;
};

const initialState: DiscountState = {
  discountItems: [],
  loading: true,
  message: '',
};

const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    fetchDiscountRequest(state) {
      state.loading = true;
    },
    fetchDiscountSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.discountItems = action.payload;
    },
    fetchDiscountFailed(state, action: PayloadAction<{ message: string }>) {
      state.loading = false;
      state.message = action.payload.message;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { fetchDiscountRequest, fetchDiscountSuccess, fetchDiscountFailed } =
  discountSlice.actions;
export default discountSlice.reducer;
