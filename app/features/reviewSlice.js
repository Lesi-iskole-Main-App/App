import { createSlice } from "@reduxjs/toolkit";
import { reviewApi } from "../reviewApi";

const initialState = {
  items: [],
  selectedReview: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setSelectedReview: (state, action) => {
      state.selectedReview = action.payload ?? null;
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      reviewApi.endpoints.getAllReviews.matchFulfilled,
      (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      }
    );

    builder.addMatcher(
      reviewApi.endpoints.getReviewById.matchFulfilled,
      (state, action) => {
        state.selectedReview = action.payload ?? null;
      }
    );
  },
});

export const { setSelectedReview, clearSelectedReview } = reviewSlice.actions;
export default reviewSlice.reducer;