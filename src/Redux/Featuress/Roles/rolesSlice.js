import { createSlice } from '@reduxjs/toolkit';
import { rolesApi } from './rolesApi';

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    roles: [],
    selectedRole: null,
  },
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      rolesApi.endpoints.getRoles.matchFulfilled,
      (state, action) => {
        state.roles = action.payload;
      }
    );
  },
});

export const { setSelectedRole } = rolesSlice.actions;
export default rolesSlice.reducer;
