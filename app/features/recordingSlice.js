import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedRecordingClass: null,
  selectedRecordingLesson: null,
};

const recordingSlice = createSlice({
  name: "recording",
  initialState,
  reducers: {
    setSelectedRecordingClass: (state, action) => {
      state.selectedRecordingClass = action.payload || null;
    },
    clearSelectedRecordingClass: (state) => {
      state.selectedRecordingClass = null;
    },

    setSelectedRecordingLesson: (state, action) => {
      state.selectedRecordingLesson = action.payload || null;
    },
    clearSelectedRecordingLesson: (state) => {
      state.selectedRecordingLesson = null;
    },
  },
});

export const {
  setSelectedRecordingClass,
  clearSelectedRecordingClass,
  setSelectedRecordingLesson,
  clearSelectedRecordingLesson,
} = recordingSlice.actions;

export default recordingSlice.reducer;