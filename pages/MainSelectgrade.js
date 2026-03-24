import React, { useMemo, useState } from "react";
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
import { setGradeSelection } from "../app/features/authSlice";
import { setGrades } from "../app/features/gradeSlice";

import {
  useGetGradesQuery,
  useGetStreamsByGradeNumberQuery,
} from "../app/gradeApi";

import useT from "../app/i18n/useT";

const getGradeNumber = (g) => {
  if (Number.isFinite(Number(g?.grade))) return Number(g.grade);
  const name = g?.gradeName || g?.name || g?.title || g?.label || "";
  const m = String(name).match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
};

const normalizeStreamKey = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const getStreamValue = (s) => {
  return String(s?.stream || s?.value || s?.key || "").trim();
};

const hasSubjects = (streamObj) =>
  Array.isArray(streamObj?.subjects) && streamObj.subjects.length > 0;

export default function MainSelectgrade({ navigation }) {
  const dispatch = useDispatch();
  const pendingPhone = useSelector((s) => s?.auth?.pendingPhone);
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

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

  const translateGradeLabel = (num) => {
    const n = Number(num);
    if (!Number.isInteger(n)) return "—";

    if (isSi) {
      const gradeKeyMap = {
        1: "grade1",
        2: "grade2",
        3: "grade3",
        4: "grade4",
        5: "grade5",
        6: "grade6",
        7: "grade7",
        8: "grade8",
        9: "grade9",
        10: "grade10",
        11: "grade11",
        12: "grade12",
        13: "grade13",
      };

      return t(gradeKeyMap[n] || "grade");
    }

    return `Grade ${n}`;
  };

  const translateStreamLabel = (streamObj) => {
    const raw =
      streamObj?.label ||
      streamObj?.stream ||
      streamObj?.name ||
      streamObj?.title ||
      "—";

    const key = normalizeStreamKey(
      streamObj?.stream || streamObj?.value || streamObj?.key || raw
    );

    const knownStreamKeys = [
      "physical_science",
      "biological_science",
      "commerce",
      "arts",
      "technology",
      "common",
    ];

    if (isSi && knownStreamKeys.includes(key)) {
      return t(key);
    }

    return raw;
  };

  const activeGrades = useMemo(() => {
    return grades
      .map((g) => {
        const num = getGradeNumber(g);
        return {
          ...g,
          _num: num,
          _label: translateGradeLabel(num),
        };
      })
      .filter((g) => Number.isInteger(g._num));
  }, [grades, isSi, t]);

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
      .filter((g) => g?.flowType === "al" || g._num >= 12)
      .sort((a, b) => a._num - b._num);
  }, [activeGrades]);

  const streamsForSelected = useMemo(() => {
    let list = [];

    if (Array.isArray(streamsRaw?.streams)) list = streamsRaw.streams;
    else if (Array.isArray(streamsRaw)) list = streamsRaw;

    return list
      .filter(hasSubjects)
      .map((s) => ({
        ...s,
        _label: translateStreamLabel(s),
      }));
  }, [streamsRaw, isSi, t]);

  const cachedGradesKey = useMemo(
    () =>
      JSON.stringify(
        (grades || []).map(
          (g) => `${g?._id || ""}:${g?.grade || ""}:${g?.flowType || ""}`
        )
      ),
    [grades]
  );

  React.useEffect(() => {
    if (grades.length > 0) {
      dispatch(setGrades(grades));
    }
  }, [cachedGradesKey, dispatch, grades]);

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

  const pickNormalGrade = (level, gradeObj) => {
    dispatch(
      setGradeSelection({
        level,
        grade: `Grade ${gradeObj?._num}`,
        stream: null,
      })
    );
    closeGradeModal();
    goSignin();
  };

  const pickStream = (streamObj) => {
    const streamLabel = streamObj?._label || translateStreamLabel(streamObj);
    const streamValue = getStreamValue(streamObj) || streamLabel;

    dispatch(
      setGradeSelection({
        level: "al",
        grade: "A/L",
        stream: streamValue,
      })
    );

    closeStreamModal();
    goSignin();
  };

  const GradeCard = ({ img, title, subTitle, level }) => (
    <Pressable
      style={({ pressed }) => [styles.gradeCard, pressed && styles.pressed]}
      onPress={() => {
        if (level === "al") {
          if (!alGrades.length) {
            Alert.alert("No A/L", "Backend has no A/L flow.");
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
        <Text
          style={[
            styles.cardTitle,
            isSi && sinFont("bold"),
            isSi && styles.siTextFix,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardSubTitle,
            isSi && sinFont("regular"),
            isSi && styles.siTextFix,
          ]}
        >
          {subTitle}
        </Text>
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
      ? isSi
        ? t("primaryLevelTitle")
        : "Select Grade (Primary)"
      : isSi
      ? t("secondaryLevelTitle")
      : "Select Grade (Secondary)";

  return (
    <View style={styles.container}>
      <View style={styles.centerGroup}>
        <Image
          source={lesiiskole_logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.pageTitle,
            isSi && sinFont("bold"),
            isSi && styles.siTextFix,
          ]}
        >
          {t("mainGradeSelectTitle")}
        </Text>

        <View style={styles.cardsWrap}>
          <GradeCard
            img={primarylevel}
            title={t("primaryLevelTitle")}
            subTitle={t("primaryLevelSubtitle")}
            level="primary"
          />
          <GradeCard
            img={olstudents}
            title={t("secondaryLevelTitle")}
            subTitle={t("secondaryLevelSubtitle")}
            level="secondary"
          />
          <GradeCard
            img={alstudents}
            title={t("alLevelTitle")}
            subTitle={t("showAvailableStreams")}
            level="al"
          />
        </View>
      </View>

      <Modal visible={gradeModalOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeGradeModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text
              style={[
                styles.modalTitle,
                isSi && sinFont("bold"),
                isSi && styles.siTextFix,
              ]}
            >
              {gradeModalTitle}
            </Text>

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
                  <Text
                    style={[
                      styles.modalItemText,
                      isSi && sinFont("bold"),
                      isSi && styles.siTextFix,
                    ]}
                  >
                    {g._label}
                  </Text>
                </Pressable>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={streamModalOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeStreamModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text
              style={[
                styles.modalTitle,
                isSi && sinFont("bold"),
                isSi && styles.siTextFix,
              ]}
            >
              {isSi ? t("showAvailableStreams") : "Select Stream (A/L)"}
            </Text>

            {streamsLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 14 }}>
                <ActivityIndicator />
                <Text
                  style={{
                    marginTop: 10,
                    color: "#64748B",
                    fontWeight: "700",
                  }}
                >
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
                  key={s?._id || getStreamValue(s) || s?._label}
                  style={styles.modalItem}
                  onPress={() => pickStream(s)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      isSi && sinFont("bold"),
                      isSi && styles.siTextFix,
                    ]}
                  >
                    {s._label}
                  </Text>
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
    textAlign: "center",
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
  siTextFix: {
    fontFamily: undefined,
    fontWeight: "normal",
  },
});