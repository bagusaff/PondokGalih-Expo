import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import billReducer from './slices/bill';
import categoryReducer from './slices/category';
import connectionReducer from './slices/connection';
import discountReducer from './slices/discount';
import menuReducer from './slices/menu';
import orderReducer from './slices/order';
import salesTypeReducer from './slices/sales-type';
import settingReducer from './slices/setting';
import taxReducer from './slices/tax';
import userReducer from './slices/user';

// Persist layout identical to legacy reducers/index.js:
// root persists user + setting; order persists only pendingOrder (nested).

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'setting'],
};

const orderConfig = {
  key: 'order',
  storage: AsyncStorage,
  whitelist: ['pendingOrder'],
};

const rootReducer = combineReducers({
  user: userReducer,
  connection: connectionReducer,
  order: persistReducer(orderConfig, orderReducer),
  menu: menuReducer,
  category: categoryReducer,
  salestype: salesTypeReducer,
  discount: discountReducer,
  tax: taxReducer,
  bill: billReducer,
  setting: settingReducer,
});

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Legacy store had no serializability constraints: redux-persist
      // actions and the Date values in bill state must keep working.
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
