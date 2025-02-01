import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userPermissions: {},
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setUserPermissions: (state, action) => {
      state.userPermissions = action.payload;
    },
  },
});

export const { setUserPermissions } = permissionsSlice.actions;

export default permissionsSlice.reducer;
