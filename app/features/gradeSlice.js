import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  grades: [],
  streamsByGrade: {},
};

const gradeSlice = createSlice({
  name: "grade",
  initialState,
  reducers: {
    setGrades: (state, action) => {
      state.grades = Array.isArray(action.payload) ? action.payload : [];
    },

    setStreamsForGrade: (state, action) => {
      const { gradeNumber, streams } = action.payload || {};
      if (gradeNumber == null) return;
      state.streamsByGrade[String(gradeNumber)] = Array.isArray(streams)
        ? streams
        : [];
    },

    clearGradeState: (state) => {
      state.grades = [];
      state.streamsByGrade = {};
    },
  },
});

export const { setGrades, setStreamsForGrade, clearGradeState } =
  gradeSlice.actions;

export default gradeSlice.reducer;