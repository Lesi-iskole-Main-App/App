import React, { useEffect, useState } from "react";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { Provider } from "react-redux";
import store, { persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import * as Font from "expo-font";
import { NotoSerifSinhala_700Bold } from "@expo-google-fonts/noto-serif-sinhala";
import {
  AbhayaLibre_700Bold,
  AbhayaLibre_400Regular,
} from "@expo-google-fonts/abhaya-libre";

import RootLayout from "./Layouts/RootLayout";
import SecondLayout from "./Layouts/SecondLayout";

import SplashScreen from "./pages/SplashScreen";
import LanguageSelect from "./pages/LanguageSelect";
import MainSelectgrade from "./pages/MainSelectgrade";
import Sign from "./pages/Sign";
import OTP from "./pages/OTP";
import ForgotPassword from "./pages/ForgotPassword";

import Home from "./pages/Home";
import Live from "./pages/Live";
import LMS from "./pages/LMS";
import Result from "./pages/Result";
import Profile from "./pages/Profile";

import Lessons from "./pages/Lessions";
import ViewLesson from "./pages/ViewLesson";
import IndexNumber from "./pages/IndexNumber";
import Subjects from "./pages/Subject";
import SubjectWithTeachers from "./pages/SubjectWithteacher";

import DailyQuiz from "./pages/DailyQuiz";
import TopicWisePaper from "./pages/TopicWisepaper";
import ModelPaper from "./pages/Modelpaper";
import PastPapers from "./pages/Pastpapers";

import EnrollSubjects from "./pages/EnrollSubjects";

import RecordingClasses from "./pages/RecordingClasses";
import RecordingLessons from "./pages/RecordingLessons";
import RecordingViewLesson from "./pages/RecordingViewLesson";

import DailyQuizMenu from "./pages/DailyQuizzMenu";
import TopicWiseMenu from "./pages/TopicWisemenu";
import ModelPaperMenu from "./pages/ModelPaperMenu";
import PastpaperMenu from "./pages/PastpaperMenu";

import ReviewPage from "./pages/ReviewPage";
import PaperPage from "./pages/paper";
import PaymentCheckout from "./pages/PaymentCheckout";

const Stack = createNativeStackNavigator();
const NAVIGATION_STATE_KEY = "NAVIGATION_STATE_V1";

const withSecondLayout = (ScreenComponent) => {
  return function WrappedScreen(props) {
    return (
      <SecondLayout>
        <ScreenComponent {...props} />
      </SecondLayout>
    );
  };
};

const HomeWithLayout = withSecondLayout(Home);
const LiveWithLayout = withSecondLayout(Live);
const LMSWithLayout = withSecondLayout(LMS);
const ResultWithLayout = withSecondLayout(Result);
const ProfileWithLayout = withSecondLayout(Profile);

const LessonsWithLayout = withSecondLayout(Lessons);
const ViewLessonWithLayout = withSecondLayout(ViewLesson);
const IndexNumberWithLayout = withSecondLayout(IndexNumber);
const SubjectsWithLayout = withSecondLayout(Subjects);
const SubjectWithTeachersWithLayout = withSecondLayout(SubjectWithTeachers);

const EnrollSubjectsWithLayout = withSecondLayout(EnrollSubjects);

const RecordingClassesWithLayout = withSecondLayout(RecordingClasses);
const RecordingLessonsWithLayout = withSecondLayout(RecordingLessons);
const RecordingViewLessonWithLayout = withSecondLayout(RecordingViewLesson);

const DailyQuizWithLayout = withSecondLayout(DailyQuiz);
const TopicWisePaperWithLayout = withSecondLayout(TopicWisePaper);
const ModelPaperWithLayout = withSecondLayout(ModelPaper);
const PastPapersWithLayout = withSecondLayout(PastPapers);

const DailyQuizMenuWithLayout = withSecondLayout(DailyQuizMenu);
const TopicWiseMenuWithLayout = withSecondLayout(TopicWiseMenu);
const ModelPaperMenuWithLayout = withSecondLayout(ModelPaperMenu);
const PastpaperMenuWithLayout = withSecondLayout(PastpaperMenu);

const ReviewPageWithLayout = withSecondLayout(ReviewPage);

function BootLoader() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="small" color="#2563EB" />
    </View>
  );
}

function AppNavigator() {
  const [isNavReady, setIsNavReady] = useState(false);
  const [initialNavState, setInitialNavState] = useState(undefined);

  useEffect(() => {
    const restoreNavigationState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);

        if (savedState) {
          setInitialNavState(JSON.parse(savedState));
        }
      } catch (e) {
        console.log("Navigation restore error:", e);
      } finally {
        setIsNavReady(true);
      }
    };

    restoreNavigationState();
  }, []);

  if (!isNavReady) {
    return <BootLoader />;
  }

  return (
    <NavigationContainer
      initialState={initialNavState}
      onStateChange={async (state) => {
        try {
          if (state) {
            await AsyncStorage.setItem(
              NAVIGATION_STATE_KEY,
              JSON.stringify(state)
            );
          }
        } catch (e) {
          console.log("Navigation persist error:", e);
        }
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RootLayout>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Splash"
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="LanguageSelect" component={LanguageSelect} />
          <Stack.Screen name="Sign" component={Sign} />
          <Stack.Screen name="OTP" component={OTP} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="MainSelectgrade" component={MainSelectgrade} />

          <Stack.Screen name="Home" component={HomeWithLayout} />
          <Stack.Screen name="Live" component={LiveWithLayout} />
          <Stack.Screen name="LMS" component={LMSWithLayout} />
          <Stack.Screen name="Result" component={ResultWithLayout} />
          <Stack.Screen name="Profile" component={ProfileWithLayout} />
          <Stack.Screen name="PaymentCheckout" component={PaymentCheckout} />

          <Stack.Screen name="Subjects" component={SubjectsWithLayout} />
          <Stack.Screen
            name="SubjectWithTeachers"
            component={SubjectWithTeachersWithLayout}
          />
          <Stack.Screen name="IndexNumber" component={IndexNumberWithLayout} />
          <Stack.Screen name="Lessons" component={LessonsWithLayout} />
          <Stack.Screen name="ViewLesson" component={ViewLessonWithLayout} />

          <Stack.Screen
            name="EnrollSubjects"
            component={EnrollSubjectsWithLayout}
          />

          <Stack.Screen
            name="RecordingClasses"
            component={RecordingClassesWithLayout}
          />
          <Stack.Screen
            name="RecordingLessons"
            component={RecordingLessonsWithLayout}
          />
          <Stack.Screen
            name="RecordingViewLesson"
            component={RecordingViewLessonWithLayout}
          />

          <Stack.Screen name="DailyQuiz" component={DailyQuizWithLayout} />
          <Stack.Screen
            name="TopicWisePaper"
            component={TopicWisePaperWithLayout}
          />
          <Stack.Screen name="ModelPaper" component={ModelPaperWithLayout} />
          <Stack.Screen name="PastPapers" component={PastPapersWithLayout} />

          <Stack.Screen
            name="DailyQuizMenu"
            component={DailyQuizMenuWithLayout}
          />
          <Stack.Screen
            name="TopicWiseMenu"
            component={TopicWiseMenuWithLayout}
          />
          <Stack.Screen
            name="ModelPaperMenu"
            component={ModelPaperMenuWithLayout}
          />
          <Stack.Screen
            name="PastpaperMenu"
            component={PastpaperMenuWithLayout}
          />

          <Stack.Screen name="ReviewPage" component={ReviewPageWithLayout} />
          <Stack.Screen name="PaperPage" component={PaperPage} />
        </Stack.Navigator>
      </RootLayout>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          FM_Derana: require("./assets/fonts/FM_Derana.ttf"),
          FMEmaneex: require("./assets/fonts/FMEmaneex.ttf"),
          NotoSerifSinhala_700Bold,
          AbhayaLibre_700Bold,
          AbhayaLibre_300Bold: AbhayaLibre_400Regular,
        });
      } catch (e) {
        console.log("Font load error:", e);
      } finally {
        setFontsReady(true);
      }
    })();
  }, []);

  if (!fontsReady) {
    return <BootLoader />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<BootLoader />} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}