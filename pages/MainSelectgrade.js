import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import {
  useFonts as useAlexandria,
  Alexandria_400Regular,
  Alexandria_700Bold,
} from "@expo-google-fonts/alexandria";

import lesiiskole_logo from "../assets/lesiiskole_logo.png";
import alstudents from "../assets/alstudents.png";
import olstudents from "../assets/olstudents.png";
import primarylevel from "../assets/primarylevel.png";

import { useDispatch, useSelector } from "react-redux";
import {
  setGradeSelection,
  clearGradeSelection,
} from "../app/features/authSlice";
import { setUser, updateUserFields } from "../app/features/userSlice";

import {
  useGetGradesQuery,
  useGetStreamsByGradeNumberQuery,
} from "../app/gradeApi";
import {
  setGrades,
  setStreamsForGrade,
} from "../app/features/gradeSlice";

import { useSaveStudentGradeSelectionMutation } from "../app/userApi";

// ---------- helpers ----------
const getGradeNumber = (g) => {
  if (Number.isFinite(Number(g?.grade))) return Number(g.grade);
  const name = g?.gradeName || g?.name || g?.title || g?.label || "";
  const m = String(name).match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
};

const getGradeLabel = (g) => {
  const num = getGradeNumber(g);
  if (num != null) return `Grade ${num}`;
  return g?.gradeName || g?.name || g?.title || g?.label || "—";
};

const getStreamLabel = (s) => {
  return s?.label || s?.stream || s?.name || s?.title || "—";
};

const getStreamValue = (s) => {
  return String(s?.stream || s?.value || s?.key || "").trim();
};

export default function MainSelectgrade({ navigation }) {
  const dispatch = useDispatch();

  const pendingPhone = useSelector((s) => s?.auth?.pendingPhone);
  const streamsByGrade = useSelector((s) => s?.grade?.streamsByGrade || {});
  const token = useSelector((s) => s?.auth?.token);
  const user =
    useSelector((s) => s?.user?.user) || useSelector((s) => s?.auth?.user);

  const [saveGradeSelection] = useSaveStudentGradeSelectionMutation();

  const [fontsLoaded] = useAlexandria({
    Alexandria_400Regular,
    Alexandria_700Bold,
  });

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [selectedALMode, setSelectedALMode] = useState(false);

  const {
    data: gradesRaw,
    isLoading: gradesLoading,
    isError: gradesError,
    refetch: refetchGrades,
  } = useGetGradesQuery();

  const {
    data: streamsRaw,
    isLoading: streamsLoading,
    isError: streamsError,
    refetch: refetchStreams,
  } = useGetStreamsByGradeNumberQuery(selectedALMode ? "al" : null, {
    skip: !selectedALMode,
  });

  const grades = useMemo(() => {
    if (Array.isArray(gradesRaw)) return gradesRaw;
    if (Array.isArray(gradesRaw?.grades)) return gradesRaw.grades;
    return [];
  }, [gradesRaw]);

  const activeGrades = useMemo(() => {
    return grades
      .map((g) => ({
        ...g,
        _num: getGradeNumber(g),
        _label: getGradeLabel(g),
      }))
      .filter((g) => Number.isInteger(g._num));
  }, [grades]);

  const primaryGrades = useMemo(() => {
    return activeGrades
      .filter((g) => g._num >= 1 && g._num <= 5)
      .sort((a, b) => a._num - b._num);
  }, [activeGrades]);

  const secondaryGrades = useMemo(() => {
    return activeGrades
      .filter((g) => g._num >= 6 && g._num <= 11)
      .sort((a, b) => a._num - b._num);
  }, [activeGrades]);

  const alGrades = useMemo(() => {
    return activeGrades
      .filter((g) => g._num >= 12 && g._num <= 13)
      .sort((a, b) => a._num - b._num);
  }, [activeGrades]);

  const streamsForSelected = useMemo(() => {
    if (!selectedALMode) return [];

    if (Array.isArray(streamsRaw?.streams)) return streamsRaw.streams;
    if (Array.isArray(streamsRaw)) return streamsRaw;

    return streamsByGrade?.al || [];
  }, [selectedALMode, streamsRaw, streamsByGrade]);

  useEffect(() => {
    if (grades.length > 0) {
      dispatch(setGrades(grades));
    }
  }, [grades, dispatch]);

  useEffect(() => {
    if (selectedALMode && Array.isArray(streamsForSelected)) {
      dispatch(
        setStreamsForGrade({
          gradeNumber: "al",
          streams: streamsForSelected,
        })
      );
    }
  }, [selectedALMode, streamsForSelected, dispatch]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (gradesLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#64748B", fontWeight: "700" }}>
          Loading grades...
        </Text>
      </View>
    );
  }

  if (gradesError) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 16 }}>
          Failed to load grades
        </Text>
        <Pressable onPress={refetchGrades} style={{ marginTop: 10 }}>
          <Text style={{ color: "#214294", fontWeight: "900" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const goSignin = () => {
    navigation.replace("Sign", { mode: "signin", phone: pendingPhone || "" });
  };

  const openGradeModal = (type) => {
    setModalType(type);
    setGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setGradeModalOpen(false);
    setModalType(null);
  };

  const openALStreams = () => {
    setSelectedALMode(true);
    setStreamModalOpen(true);
  };

  const closeStreamModal = () => {
    setStreamModalOpen(false);
    setSelectedALMode(false);
  };

  const saveToDbIfPossible = async ({ level, gradeNumber, stream }) => {
    try {
      if (!token) return;
      if (!user || user?.role !== "student") return;
      if (user?.gradeSelectionLocked) return;

      if (!gradeNumber) return;

      const resp = await saveGradeSelection({
        level,
        gradeNumber,
        stream: level === "al" ? stream : null,
      }).unwrap();

      if (resp?.user) {
        dispatch(setUser(resp.user));
        dispatch(updateUserFields(resp.user));
      }

      dispatch(clearGradeSelection());
    } catch (e) {
      const status = e?.status || e?.originalStatus;
      if (status === 409) return;
      console.log("save grade selection failed:", e);
    }
  };

  const pickNormalGrade = async (level, gradeObj) => {
    const gradeLabel = gradeObj?._label || getGradeLabel(gradeObj);
    const gradeNumber = gradeObj?._num || getGradeNumber(gradeObj);

    dispatch(setGradeSelection({ level, grade: gradeLabel, stream: null }));
    closeGradeModal();

    await saveToDbIfPossible({
      level,
      gradeNumber,
      stream: null,
    });

    goSignin();
  };

  const pickStream = async (streamObj) => {
    const streamLabel = getStreamLabel(streamObj);
    const streamValue = getStreamValue(streamObj) || streamLabel;

    dispatch(
      setGradeSelection({
        level: "al",
        grade: "A/L",
        stream: streamValue,
      })
    );

    closeStreamModal();

    await saveToDbIfPossible({
      level: "al",
      gradeNumber: 12,
      stream: streamValue,
    });

    goSignin();
  };

  const GradeCard = ({ img, title, subTitle, level }) => (
    <Pressable
      style={({ pressed }) => [styles.gradeCard, pressed && styles.pressed]}
      onPress={() => {
        if (level === "al") {
          if (!alGrades.length) {
            Alert.alert("No A/L", "Backend has no A/L grades.");
            return;
          }
          openALStreams();
          return;
        }

        const has =
          level === "primary"
            ? primaryGrades.length > 0
            : secondaryGrades.length > 0;

        if (!has) {
          Alert.alert("No Grades", "Backend has no grades for this category.");
          return;
        }

        openGradeModal(level);
      }}
    >
      <Image source={img} style={styles.cardImg} resizeMode="contain" />
      <View style={styles.cardTextWrap}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubTitle}>{subTitle}</Text>
      </View>
      <View style={styles.arrowWrap}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </Pressable>
  );

  const list =
    modalType === "primary"
      ? primaryGrades
      : modalType === "secondary"
      ? secondaryGrades
      : [];

  const gradeModalTitle =
    modalType === "primary"
      ? "Select Grade (Primary)"
      : "Select Grade (Secondary)";

  return (
    <View style={styles.container}>
      <View style={styles.centerGroup}>
        <Image
          source={lesiiskole_logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.pageTitle}>Select your grade</Text>

        <View style={styles.cardsWrap}>
          <GradeCard
            img={primarylevel}
            title="Primary Level"
            subTitle="Grades 1 - 5"
            level="primary"
          />
          <GradeCard
            img={olstudents}
            title="Secondary Level"
            subTitle="Grades 6 - 11"
            level="secondary"
          />
          <GradeCard
            img={alstudents}
            title="A/L"
            subTitle="Show available streams"
            level="al"
          />
        </View>
      </View>

      <Modal visible={gradeModalOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeGradeModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{gradeModalTitle}</Text>

            {list.length === 0 ? (
              <Text style={{ color: "#64748B", fontWeight: "700" }}>
                No grades available from backend for this category.
              </Text>
            ) : (
              list.map((g) => (
                <Pressable
                  key={g?._id || g?._label || String(g?._num)}
                  style={styles.modalItem}
                  onPress={() => pickNormalGrade(modalType, g)}
                >
                  <Text style={styles.modalItemText}>{g._label}</Text>
                </Pressable>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={streamModalOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeStreamModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Stream (A/L)</Text>

            {streamsLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 14 }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 10, color: "#64748B", fontWeight: "700" }}>
                  Loading streams...
                </Text>
              </View>
            ) : streamsError ? (
              <>
                <Text style={{ color: "#0F172A", fontWeight: "900" }}>
                  Failed to load streams
                </Text>
                <Pressable onPress={refetchStreams} style={{ marginTop: 10 }}>
                  <Text style={{ color: "#214294", fontWeight: "900" }}>
                    Try again
                  </Text>
                </Pressable>
              </>
            ) : streamsForSelected.length === 0 ? (
              <Text style={{ color: "#64748B", fontWeight: "700" }}>
                No streams available for A/L.
              </Text>
            ) : (
              streamsForSelected.map((s) => (
                <Pressable
                  key={s?._id || getStreamValue(s) || getStreamLabel(s)}
                  style={styles.modalItem}
                  onPress={() => pickStream(s)}
                >
                  <Text style={styles.modalItemText}>{getStreamLabel(s)}</Text>
                </Pressable>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  centerGroup: { alignItems: "center" },
  logo: { width: 150, height: 150, marginBottom: 8 },
  pageTitle: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 30,
    color: "#214294",
    marginBottom: 25,
  },
  cardsWrap: { gap: 16, alignItems: "center" },

  gradeCard: {
    width: 353,
    height: 106,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 14,
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  cardImg: { width: 70, height: 70, marginRight: 14 },
  cardTextWrap: { flex: 1, justifyContent: "center", marginLeft: 10 },
  cardTitle: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 13,
    color: "#0F172A",
  },
  cardSubTitle: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  arrowWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontSize: 38, color: "#214294" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#214294",
  },
});