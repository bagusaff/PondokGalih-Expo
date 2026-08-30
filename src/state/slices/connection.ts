import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1:1 port of Connection.reducer.js (no logout reset in legacy).

export type ConnectionState = {
  isConnected: boolean;
};

const initialState: ConnectionState = {
  isConnected: false,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    checkingConnection(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
  },
});

export const { checkingConnection } = connectionSlice.actions;
export default connectionSlice.reducer;
