import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/authSlice";
import userReducer from "./features/userSlice";
import gradeReducer from "./features/gradeSlice";
import lessonReducer from "./features/lessonSlice";
import enrollReducer from "./features/enrollSlice";
import recordingReducer from "./features/recordingSlice";
import reviewReducer from "./features/reviewSlice";

import liveUiReducer from "./features/liveSlice";
import paperReducer from "./features/paperSlice";

import languageSelectionReducer from "./features/languageSelectionSlice";
import rankReducer from "./features/rankSlice";
import { rankApi } from "./rankApi";

import progressReducer from "./features/progressSlice";
import { progressApi } from "./progressApi";

import { attemptApi } from "./attemptApi";
import { liveApi } from "./liveApi";
import { paperApi } from "./paperApi";
import { enrollApi } from "./enrollApi";
import { authApi } from "./authApi";
import { gradeApi } from "./gradeApi";
import { userApi } from "./userApi";
import { classApi } from "./classApi";
import { lessonApi } from "./lessonApi";
import { paymentApi } from "./paymentApi";
import { languageApi } from "./languageApi";
import { recordingApi } from "./recordingApi";
import { reviewApi } from "./reviewApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    grade: gradeReducer,
    lesson: lessonReducer,
    enroll: enrollReducer,
    recording: recordingReducer,
    review: reviewReducer,

    liveUi: liveUiReducer,
    paper: paperReducer,
    rank: rankReducer,
    languageSelection: languageSelectionReducer,
    progress: progressReducer,

    [paymentApi.reducerPath]: paymentApi.reducer,
    [attemptApi.reducerPath]: attemptApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [enrollApi.reducerPath]: enrollApi.reducer,
    [paperApi.reducerPath]: paperApi.reducer,
    [liveApi.reducerPath]: liveApi.reducer,
    [rankApi.reducerPath]: rankApi.reducer,
    [languageApi.reducerPath]: languageApi.reducer,
    [progressApi.reducerPath]: progressApi.reducer,
    [recordingApi.reducerPath]: recordingApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      attemptApi.middleware,
      gradeApi.middleware,
      userApi.middleware,
      classApi.middleware,
      lessonApi.middleware,
      enrollApi.middleware,
      paperApi.middleware,
      liveApi.middleware,
      paymentApi.middleware,
      rankApi.middleware,
      languageApi.middleware,
      progressApi.middleware,
      recordingApi.middleware,
      reviewApi.middleware
    ),
});

export default store;