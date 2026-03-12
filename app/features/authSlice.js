import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,

  pendingPhone: "",

  selectedLevel: null,
  selectedGrade: null,
  selectedStream: null,

  signupDistrict: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload || null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.pendingPhone = "";
      state.selectedLevel = null;
      state.selectedGrade = null;
      state.selectedStream = null;
      state.signupDistrict = "";
    },
    setPendingIdentity: (state, action) => {
      const { phone } = action.payload || {};
      state.pendingPhone = phone || "";
    },
    setGradeSelection: (state, action) => {
      const { level, grade, stream } = action.payload || {};
      state.selectedLevel = level ?? null;
      state.selectedGrade = grade ?? null;
      state.selectedStream = stream ?? null;
    },
    clearGradeSelection: (state) => {
      state.selectedLevel = null;
      state.selectedGrade = null;
      state.selectedStream = null;
    },
    setSignupDistrict: (state, action) => {
      state.signupDistrict = String(action.payload || "");
    },
  },
});

export const {
  setToken,
  clearAuth,
  setPendingIdentity,
  setGradeSelection,
  clearGradeSelection,
  setSignupDistrict,
} = authSlice.actions;

export default authSlice.reducer;