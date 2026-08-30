import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of SalesType.reducer.js.
// DEVIATION (documented in MIGRATION_PLAN.md): legacy stored a UI Kitten
// IndexPath object for selectedSalesIndex; the new store keeps a plain
// number (row index) — the SalesType selector component adapts in Phase 3.

export type SalesTypeState = {
  salesItems: any[];
  selectedSalesType: number;
  selectedSalesIndex: number;
  loading: boolean;
  message: string;
  paymentMethod: any[];
};

const initialState: SalesTypeState = {
  salesItems: [],
  selectedSalesType: 1,
  selectedSalesIndex: 0,
  loading: true,
  message: '',
  paymentMethod: [],
};

const salesTypeSlice = createSlice({
  name: 'salestype',
  initialState,
  reducers: {
    fetchSalesRequest(state) {
      state.loading = true;
    },
    fetchSalesSuccess(
      state,
      action: PayloadAction<{ sale_types: any[]; payment_methods: any[] }>,
    ) {
      state.loading = false;
      state.salesItems = action.payload.sale_types;
      state.paymentMethod = action.payload.payment_methods;
    },
    fetchSalesFailed(state, action: PayloadAction<{ message: string }>) {
      state.loading = false;
      state.message = action.payload.message;
    },
    changeSalesTypeAction(
      state,
      action: PayloadAction<{ type: number; index: number }>,
    ) {
      state.selectedSalesType = action.payload.type;
      state.selectedSalesIndex = action.payload.index;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  fetchSalesRequest,
  fetchSalesSuccess,
  fetchSalesFailed,
  changeSalesTypeAction,
} = salesTypeSlice.actions;
export default salesTypeSlice.reducer;
