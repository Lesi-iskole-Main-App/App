import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedLiveId: null,
};

const liveSlice = createSlice({
  name: "liveUi",
  initialState,
  reducers: {
    setSelectedLiveId: (state, action) => {
      state.selectedLiveId = action.payload || null;
    },
    clearSelectedLiveId: (state) => {
      state.selectedLiveId = null;
    },
  },
});

export const { setSelectedLiveId, clearSelectedLiveId } = liveSlice.actions;
export default liveSlice.reducer;