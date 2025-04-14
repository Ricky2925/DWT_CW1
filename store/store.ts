import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./locationSlice";

// 创建 store
export const store = configureStore({
  reducer: {
    location: locationReducer,
  },
});

// 定义 store 的类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
