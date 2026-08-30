import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of Category.reducer.js

export type CategoryState = {
  categoryItems: any[];
  selectedCategory: number | string | null;
  loading: boolean;
  message: string;
};

const initialState: CategoryState = {
  categoryItems: [],
  selectedCategory: null,
  loading: true,
  message: '',
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    fetchCategoryRequest(state) {
      state.loading = true;
    },
    fetchCategorySuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.categoryItems = action.payload;
    },
    fetchCategoryFailed(state, action: PayloadAction<{ message: string }>) {
      state.loading = false;
      state.message = action.payload.message;
    },
    changeCategory(
      state,
      action: PayloadAction<number | string | null>,
    ) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  fetchCategoryRequest,
  fetchCategorySuccess,
  fetchCategoryFailed,
  changeCategory,
} = categorySlice.actions;
export default categorySlice.reducer;
