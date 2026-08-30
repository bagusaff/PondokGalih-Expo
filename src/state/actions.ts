import { createAction } from '@reduxjs/toolkit';

// Legacy USER_LOGOUT_REQUEST was observed by many reducers; a standalone
// action avoids circular slice imports. Each slice handles it in
// extraReducers exactly as its legacy switch-case did.
export const logout = createAction('user/logout');
