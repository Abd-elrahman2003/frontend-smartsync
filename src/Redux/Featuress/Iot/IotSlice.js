import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  camera: null,
  wifi: null,
};

const iotSlice = createSlice({
  name: 'iot',
  initialState,
  reducers: {
    setCamera: (state, action) => {
      state.camera = action.payload;
    },
    setWifi: (state, action) => {
      state.wifi = action.payload;
    },
    clearCamera: (state) => {
      state.camera = null;
    },
    clearWifi: (state) => {
      state.wifi = null;
    },
  },
});

export const { setCamera, setWifi, clearCamera, clearWifi } = iotSlice.actions;

export default iotSlice.reducer;