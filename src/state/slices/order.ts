import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of Order.reducer.js — order math is FROZEN (tested in production).
// Only mechanical changes: RTK immer style, perf logging removed.

export type OrderItem = {
  id: number;
  variant_id?: number | null;
  quantity: number;
  price: number;
  totalPrice: number;
  note?: string;
  [key: string]: any;
};

export type OrderState = {
  orderItems: OrderItem[];
  loading: boolean;
  message: string;
  error: boolean;
  pendingOrder: any[];
  // NEW vs legacy: the completed-order payload for the FinishOrder screen.
  // Legacy passed it through navigation params; expo-router params are
  // string-serialized, so the object travels through the store instead.
  // Not persisted (order persist whitelist covers only pendingOrder).
  finishedOrder: any;
};

const initialState: OrderState = {
  orderItems: [],
  loading: false,
  message: '',
  error: false,
  pendingOrder: [],
  finishedOrder: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    uploadOrder(state) {
      state.loading = true;
      state.error = false;
    },
    uploadOrderSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.message = action.payload;
      state.error = false;
    },
    uploadOrderFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.message = action.payload;
      state.error = true;
    },
    addOrderItem(state, action: PayloadAction<OrderItem>) {
      const exists = state.orderItems.some(
        (item) =>
          item.id === action.payload.id &&
          item?.variant_id === action.payload?.variant_id,
      );
      let orderItems: OrderItem[] = [];
      if (exists) {
        for (let i = 0; i < state.orderItems.length; i++) {
          if (
            state.orderItems[i].id === action.payload.id &&
            state.orderItems[i].variant_id === action.payload?.variant_id
          ) {
            orderItems.push({
              ...state.orderItems[i],
              quantity:
                state.orderItems[i].quantity + action?.payload?.quantity,
              totalPrice:
                state.orderItems[i].price *
                (state.orderItems[i].quantity + action?.payload?.quantity),
              note: action?.payload?.note,
            });
          } else {
            orderItems.push(state.orderItems[i]);
          }
        }
      } else {
        orderItems = [...state.orderItems, action.payload];
      }
      state.orderItems = orderItems;
      state.error = false;
    },
    deleteOrderItem(
      state,
      action: PayloadAction<{ id: number; variant_id?: number | null }>,
    ) {
      // Legacy semantics: with a variant_id, every row with a different
      // variant_id stays (loose != on purpose); otherwise filter by item id.
      state.orderItems =
        action.payload.variant_id != null
          ? state.orderItems.filter(
              (item) => item.variant_id != action.payload.variant_id,
            )
          : state.orderItems.filter((item) => item.id !== action.payload.id);
      state.error = false;
    },
    changeOrderQty(
      state,
      action: PayloadAction<{
        item_id: number;
        qty: number;
        price: number;
        variant_id?: number | null;
      }>,
    ) {
      state.orderItems =
        action.payload.variant_id != null
          ? state.orderItems.map((item) =>
              item.variant_id === action.payload.variant_id
                ? {
                    ...item,
                    quantity: item.quantity + action.payload.qty,
                    totalPrice:
                      item.price * (item.quantity + action.payload.qty),
                  }
                : item,
            )
          : state.orderItems.map((item) =>
              item.id === action.payload.item_id
                ? {
                    ...item,
                    quantity: item.quantity + action.payload.qty,
                    totalPrice:
                      item.price * (item.quantity + action.payload.qty),
                  }
                : item,
            );
      state.error = false;
    },
    resetOrderItem(state) {
      state.orderItems = [];
      state.error = false;
    },
    loadOrder(state, action: PayloadAction<OrderItem[]>) {
      state.orderItems = action.payload;
      state.error = false;
    },
    setFinishedOrder(state, action: PayloadAction<any>) {
      state.finishedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Legacy kept pendingOrder across logout — not a full reset.
    builder.addCase(logout, (state) => {
      state.orderItems = [];
      state.loading = false;
      state.message = '';
      state.error = false;
    });
  },
});

export const {
  uploadOrder,
  uploadOrderSuccess,
  uploadOrderFailed,
  addOrderItem,
  deleteOrderItem,
  changeOrderQty,
  resetOrderItem,
  loadOrder,
  setFinishedOrder,
} = orderSlice.actions;
export default orderSlice.reducer;
