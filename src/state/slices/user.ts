import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '../actions';

// 1:1 port of User.reducer.js

export type UserState = {
  isLoggedIn: boolean;
  loading: boolean;
  userData: Record<string, any>;
  token: string;
  message: string;
  shift: string;
};

const initialState: UserState = {
  isLoggedIn: false,
  loading: false,
  userData: {},
  token: '',
  message: '',
  shift: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginRequest(state) {
      state.loading = true;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ data: any; token: string; message: string; shift: string }>,
    ) {
      state.loading = false;
      state.userData = action.payload.data;
      state.token = action.payload.token;
      state.message = action.payload.message;
      state.shift = action.payload.shift;
    },
    loginFailure(state, action: PayloadAction<{ message: string }>) {
      state.loading = false;
      state.isLoggedIn = false;
      state.message = action.payload.message;
    },
    getAllDataRequest(state) {
      state.loading = true;
    },
    getAllDataSuccess(state) {
      state.loading = false;
      state.isLoggedIn = true;
    },
    getAllDataFailed(state, action: PayloadAction<{ message: string }>) {
      state.loading = false;
      state.message = action.payload.message;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  getAllDataRequest,
  getAllDataSuccess,
  getAllDataFailed,
} = userSlice.actions;
export default userSlice.reducer;
