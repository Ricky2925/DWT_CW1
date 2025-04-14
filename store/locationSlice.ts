import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义位置数据的类型
// interface LocationData {
//   latitude: number;
//   longitude: number;
//   datetime: string; // ISO 时间字符串
// }

export type LocationData = {
  latitude: string;
  longitude: string;
  datetime: string;
  session: string;
  is_send: number;
  send_time: string | null;
  img?: string;
};

// 定义状态类型
interface LocationState {
  session: string | null;
  locations: LocationData[];
}

// 初始状态
const initialState: LocationState = {
  locations: [] as LocationData[],
  session: "",
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    // 更新 session
    setSession: (state, action: PayloadAction<string>) => {
      state.session = action.payload;
    },
    // 添加新位置数据
    addLocation: (state, action: PayloadAction<LocationData>) => {
      state.locations.push(action.payload);
    },
    // 更新已有位置数据
    updateLocation: (state, action: PayloadAction<LocationData>) => {
      const index = state.locations.findIndex(
        (loc) => loc.datetime === action.payload.datetime
      );
      if (index !== -1) {
        state.locations[index] = action.payload;
      }
    },
  },
});

// 导出生成的 action
export const { setSession, addLocation, updateLocation } =
  locationSlice.actions;

// 导出 reducer
export default locationSlice.reducer;
