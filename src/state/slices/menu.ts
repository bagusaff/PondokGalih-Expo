import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1:1 port of Menu.reducer.js. NOTE: legacy Menu state deliberately survives
// logout (no USER_LOGOUT_REQUEST case) — do not add a reset here.

export type MenuState = {
  menuItems: any[];
  filteredMenu: any[];
  groupedByCategoryMenu: Record<string, any[]>;
  filteredMenuCategory: any[];
  loading: boolean;
  message: string;
};

const initialState: MenuState = {
  menuItems: [],
  filteredMenu: [],
  groupedByCategoryMenu: {},
  filteredMenuCategory: [],
  loading: true,
  message: '',
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    fetchMenuRequest(state) {
      state.loading = true;
    },
    fetchMenuSuccess(state, action: PayloadAction<any[]>) {
      // Group items by category ID, faster than array scans (legacy comment).
      const result = action.payload.reduce(
        (r: Record<string, any[]>, a: any) => {
          r[a.category_id] = r[a.category_id] || [];
          r[a.category_id].push(a);
          return r;
        },
        Object.create(null),
      );
      state.loading = false;
      state.menuItems = action.payload;
      state.filteredMenu = action.payload;
      state.groupedByCategoryMenu = result;
      state.message = (action.payload as any).message;
    },
    fetchMenuFailed(state, action: PayloadAction<any>) {
      state.loading = false;
      state.message = action.payload.data;
    },
    fetchMenuCategories(state, action: PayloadAction<number>) {
      state.filteredMenuCategory =
        state.groupedByCategoryMenu[action.payload] || [];
    },
    fetchMenuSalesType(state, action: PayloadAction<number>) {
      const filtered: any[] = [];
      state.menuItems.forEach((item) => {
        if (item.variant.length > 0) {
          if (
            item.variant.some(
              (variant: any) => variant.sale_type_id == action.payload,
            )
          ) {
            filtered.push(item);
          }
        } else filtered.push(item);
      });
      state.filteredMenu = filtered;
    },
    clearCategories(state) {
      state.filteredMenuCategory = [];
    },
    fetchMenuFavouriteSuccess(state, action: PayloadAction<any[]>) {
      const filteredFavouriteMenu: any[] = [];
      action?.payload.forEach((item) => {
        // Guard (2026-08-31): favourite rows whose menu item was deleted
        // server-side arrive as { item: null } — legacy pushed the null and
        // crashed the grid renderer.
        if (item?.item) {
          filteredFavouriteMenu.push(item.item);
        }
      });
      state.loading = false;
      state.filteredMenuCategory = filteredFavouriteMenu;
    },
    deleteMenuFromFavourite(state, action: PayloadAction<number>) {
      state.filteredMenuCategory = state.filteredMenuCategory?.filter(
        (item) => item.id !== action.payload,
      );
    },
  },
});

export const {
  fetchMenuRequest,
  fetchMenuSuccess,
  fetchMenuFailed,
  fetchMenuCategories,
  fetchMenuSalesType,
  clearCategories,
  fetchMenuFavouriteSuccess,
  deleteMenuFromFavourite,
} = menuSlice.actions;
export default menuSlice.reducer;
