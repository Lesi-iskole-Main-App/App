import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedLessonId: null,
};

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    setSelectedLessonId: (state, action) => {
      state.selectedLessonId = action.payload || null;
    },
    clearSelectedLessonId: (state) => {
      state.selectedLessonId = null;
    },
  },
});

export const { setSelectedLessonId, clearSelectedLessonId } = lessonSlice.actions;
export default lessonSlice.reducer;