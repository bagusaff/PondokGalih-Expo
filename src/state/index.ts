// Same public surface as the legacy src/state/index.js: screens import
// actions/thunks by their old names, so screen ports stay mechanical.

export { persistor, store } from './store';
export type { AppDispatch, RootState } from './store';
export { useAppDispatch, useAppSelector } from './hooks';
export { logout } from './actions';

export { loginHandle, logoutHandle, syncAllData } from './thunks/auth';
export {
  addOrderItem,
  changeQty,
  deleteOrderItem,
  loadOrderItems,
  postOrder,
  refundOrder,
  resetOrderItem,
  updateOrder,
} from './thunks/order';
export {
  addToFavourite,
  deleteFromFavourite,
  fetchMenuItems,
  filterMenuPerCategory,
  filterMenuPerSalesType,
} from './thunks/menu';
export {
  deleteBill,
  fetchBillItems,
  resetSelectedBill,
  selectBill,
  updateBill,
  uploadBill,
} from './thunks/bill';
export {
  changeSalesType,
  checkConnection,
  setAutoPrintBill,
  setPrintCopy,
  setPrinter,
  setSelectedCategory,
} from './thunks/misc';
