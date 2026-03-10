import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { useGetRecordingsByClassIdQuery } from "../app/recordingApi";
import { setSelectedRecordingLesson } from "../app/features/recordingSlice";

const PRIMARY = "#1153ec";
const TAB_BAR_SPACE = 110;

const cleanDisplayText = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").trim();
};

export default function RecordingLessons({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const classId = route?.params?.classId || "";
  const className = route?.params?.className || "";
  const grade = route?.params?.grade || "";
  const subject = route?.params?.subject || "";
  const teacher = route?.params?.teacher || "";

  const {
    data: recordings = [],
    isLoading,
    isError,
    refetch,
  } = useGetRecordingsByClassIdQuery(classId, { skip: !classId });

  const timeWithDot = (v) =>
    String(v || "")
      .trim()
      .replace(/[：:ඃ]/g, ".")
      .replace(/\s+/g, "");

  const sortedRecordings = useMemo(() => {
    const toMs = (dateValue, timeValue) => {
      const dt = new Date(
        `${String(dateValue || "").trim()} ${String(timeValue || "").trim()}`
      );
      const ms = dt.getTime();
      return Number.isFinite(ms) ? ms : 0;
    };

    return [...(recordings || [])].sort((a, b) => {
      const da = toMs(a?.date, a?.time);
      const db = toMs(b?.date, b?.time);
      return da - db;
    });
  }, [recordings]);

  const onOpenRecording = (recording, index) => {
    const payload = {
      recordingId: recording?._id,
      recordingNo: index + 1,
      title: recording?.title || "",
      date: recording?.date || "",
      time: recording?.time || "",
      description: recording?.description || "",
      recordingUrl: recording?.recordingUrl || "",
      classId,
      className,
      grade,
      subject,
      teacher,
    };

    dispatch(setSelectedRecordingLesson(payload));
    navigation.navigate("RecordingViewLesson", payload);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Recording Lessons</Text>

      {!classId ? (
        <Text style={styles.centerInfo}>Missing class</Text>
      ) : isLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={styles.infoText}>Loading recordings...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errTitle}>Failed to load recordings</Text>
          <Pressable onPress={() => refetch?.()} style={styles.retryBtn}>
            <Text style={styles.tryAgain}>Try again</Text>
          </Pressable>
        </View>
      ) : sortedRecordings.length === 0 ? (
        <Text style={styles.centerInfo}>No recordings available.</Text>
      ) : (
        sortedRecordings.map((recording, idx) => {
          const title =
            cleanDisplayText(recording?.title) || `Recording ${idx + 1}`;
          const description =
            cleanDisplayText(recording?.description) ||
            "No description available.";

          return (
            <View style={styles.card} key={recording?._id || String(idx)}>
              <View style={styles.headerRow}>
                <View style={styles.lessonBadge}>
                  <Text style={styles.lessonBadgeText}>Recording {idx + 1}</Text>
                </View>

                <View style={styles.metaWrap}>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <Text style={styles.metaValue}>{recording?.date || "-"}</Text>
                  </View>

                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Time</Text>
                    <Text style={styles.metaValue}>
                      {timeWithDot(recording?.time) || "-"}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.lessonTitle} numberOfLines={2}>
                {title}
              </Text>

              <View style={styles.divider} />

              <View style={styles.descCard}>
                <Text style={styles.descLabel}>Description</Text>
                <Text style={styles.descText} numberOfLines={3}>
                  {description}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.watchBtn,
                    pressed && styles.watchBtnPressed,
                  ]}
                  onPress={() => onOpenRecording(recording, idx)}
                >
                  <Text style={styles.watchText}>Watch Recording</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: TAB_BAR_SPACE,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: PRIMARY,
    textAlign: "center",
    marginBottom: 15,
  },

  stateWrap: {
    paddingTop: 30,
    alignItems: "center",
  },

  infoText: {
    marginTop: 10,
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },

  errTitle: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },

  retryBtn: {
    marginTop: 10,
  },

  tryAgain: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },

  centerInfo: {
    textAlign: "center",
    marginTop: 24,
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },

  lessonBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  lessonBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  metaWrap: {
    flexDirection: "row",
    gap: 6,
  },

  metaBox: {
    minWidth: 70,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  metaLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },

  metaValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
  },

  lessonTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
    marginBottom: 8,
  },

  descCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  descLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },

  descText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    lineHeight: 18,
  },

  buttonRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },

  watchBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 130,
    alignItems: "center",
  },

  watchBtnPressed: {
    opacity: 0.9,
  },

  watchText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});