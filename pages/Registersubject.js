import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import { useGetMyApprovedRecordingClassesQuery } from "../app/recordingApi";
import { setSelectedRecordingClass } from "../app/features/recordingSlice";
import useT from "../app/i18n/useT";

const PRIMARY = "#1153ec";
const TAB_BAR_SPACE = 110;

const cleanText = (v) => String(v || "").replace(/\s+/g, " ").trim();

export default function Registersubject() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetMyApprovedRecordingClassesQuery();

  const classes = useMemo(() => {
    const items = data?.items || [];
    return Array.isArray(items) ? items : [];
  }, [data]);

  const onOpenClass = (item) => {
    dispatch(
      setSelectedRecordingClass({
        classId: item?.classId || "",
        className: item?.className || "",
        grade: item?.grade || "",
        subject: item?.subject || "",
        teachers: item?.teachers || [],
      })
    );

    navigation.navigate("Lessons", {
      classId: item?.classId || "",
      className: item?.className || "",
      grade: item?.grade || "",
      subject: item?.subject || "",
      teacher: Array.isArray(item?.teachers) ? item.teachers.join(", ") : "",
    });
  };

  return (
    <View style={styles.screen}>
      <Text style={[styles.pageTitle, isSi ? sinFont("bold") : null]}>
        {isSi ? "පටිගත පාඩම්" : "Recording Classes"}
      </Text>

      {isLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={styles.infoText}>Loading approved classes...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errTitle}>Failed to load approved classes</Text>
          <Pressable onPress={() => refetch?.()} style={styles.retryBtn}>
            <Text style={styles.tryAgain}>Try again</Text>
          </Pressable>
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.stateWrap}>
          <Text style={styles.centerInfo}>No approved recording classes yet.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {classes.map((item, idx) => {
            const className = cleanText(item?.className) || `Class ${idx + 1}`;
            const subject = cleanText(item?.subject) || "-";
            const grade = item?.grade || "-";
            const teacherText = Array.isArray(item?.teachers) && item.teachers.length
              ? item.teachers.join(", ")
              : "-";

            return (
              <View style={styles.card} key={item?.classId || String(idx)}>
                <View style={styles.headerRow}>
                  <View style={styles.badge}>
                    <Text
                      style={[styles.badgeText, isSi ? sinFont("bold") : null]}
                    >
                      Approved
                    </Text>
                  </View>

                  <View style={styles.metaWrap}>
                    <View style={styles.metaBox}>
                      <Text
                        style={[
                          styles.metaLabel,
                          isSi ? sinFont("bold") : null,
                        ]}
                      >
                        Grade
                      </Text>
                      <Text style={styles.metaValue}>{String(grade)}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.classTitle} numberOfLines={2}>
                  {className}
                </Text>

                <View style={styles.divider} />

                <View style={styles.infoCard}>
                  <Text
                    style={[styles.infoLabel, isSi ? sinFont("bold") : null]}
                  >
                    Subject
                  </Text>
                  <Text style={styles.infoTextValue} numberOfLines={2}>
                    {subject}
                  </Text>
                </View>

                <View style={[styles.infoCard, { marginTop: 8 }]}>
                  <Text
                    style={[styles.infoLabel, isSi ? sinFont("bold") : null]}
                  >
                    Teacher
                  </Text>
                  <Text style={styles.infoTextValue} numberOfLines={2}>
                    {teacherText}
                  </Text>
                </View>

                <View style={styles.buttonRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.openBtn,
                      pressed && styles.openBtnPressed,
                    ]}
                    onPress={() => onOpenClass(item)}
                  >
                    <Text
                      style={[styles.openText, isSi ? sinFont("bold") : null]}
                    >
                      {isSi ? "පාඩම් බලන්න" : "View Lessons"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
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
    marginTop: 14,
    marginBottom: 6,
  },

  stateWrap: {
    paddingTop: 30,
    alignItems: "center",
    paddingHorizontal: 16,
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
    textAlign: "center",
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

  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
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

  classTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
    fontFamily: "AbhayaLibre_700Bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
    marginBottom: 8,
  },

  infoCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },

  infoTextValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    lineHeight: 18,
    fontFamily: "AbhayaLibre_700Bold",
  },

  buttonRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },

  openBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 110,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },

  openBtnPressed: {
    opacity: 0.9,
  },

  openText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});