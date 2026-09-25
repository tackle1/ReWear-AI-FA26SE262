import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartOrderReducer from './slices/cartOrderSlice';
import systemConfigReducer from './slices/systemConfigSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cartOrder: cartOrderReducer,
    systemConfig: systemConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
