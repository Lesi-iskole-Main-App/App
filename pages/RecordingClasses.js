import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

import { useGetMyApprovedClassesQuery } from "../app/enrollApi";
import { setSelectedRecordingClass } from "../app/features/recordingSlice";
import useT from "../app/i18n/useT";

const PRIMARY = "#214294";
const TAB_BAR_SPACE = 110;

const getImageSource = (item) => {
  const uri =
    item?.image ||
    item?.imageUrl ||
    item?.classImage ||
    item?.classImageUrl ||
    "";

  if (uri) return { uri: String(uri) };
  return null;
};

export default function RecordingClasses() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t, lang, sinFont } = useT();

  const labelFontRegular = lang === "si" ? sinFont("regular") : {};
  const labelFontBold = lang === "si" ? sinFont("bold") : {};

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyApprovedClassesQuery(undefined, {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch?.();
    }, [refetch])
  );

  const classes = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const onOpenClass = (item) => {
    const teacherText = Array.isArray(item?.teachers)
      ? item.teachers
          .map((t) => (typeof t === "string" ? t : t?.name))
          .filter(Boolean)
          .join(", ")
      : "";

    const payload = {
      classId: item?._id || item?.classId || "",
      className: item?.className || "",
      grade: item?.grade || item?.gradeLabel || "",
      subject: item?.subject || item?.subjectName || "",
      teacher: teacherText,
      batchNumber: item?.batchNumber || item?.batch || "",
      streamName:
        Array.isArray(item?.streams) && item.streams.length > 0
          ? item.streams.join(", ")
          : item?.streamName || "",
    };

    dispatch(setSelectedRecordingClass(payload));
    navigation.navigate("RecordingLessons", payload);
  };

  return (
    <View style={styles.screen}>
      <Text style={[styles.pageTitle, labelFontBold]}>
        {t("recordingClassesTitle")}
      </Text>

      {isLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={[styles.infoText, labelFontRegular]}>
            {t("loadingReviewLbl")}
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errTitle}>Failed to load recording classes</Text>
          <Pressable onPress={() => refetch?.()} style={styles.retryWrap}>
            <Text style={[styles.tryAgain, labelFontBold]}>
              {t("retryBtnLbl")}
            </Text>
          </Pressable>
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={[styles.emptyTitle, labelFontBold]}>
            {t("recordingsNotAvailableTitle")}
          </Text>
          <Text style={[styles.centerInfo, labelFontRegular]}>
            {t("recordingsNotAvailableDesc")}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {classes.map((item, idx) => {
            const imageSource = getImageSource(item);
            const className = String(item?.className || `Class ${idx + 1}`);
            const batchNumber = String(
              item?.batchNumber || item?.batch || ""
            ).trim();

            return (
              <View
                style={styles.card}
                key={item?._id || item?.classId || String(idx)}
              >
                <View style={styles.topRow}>
                  <View style={styles.leftSection}>
                    <View style={styles.thumbWrap}>
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imageFallback}>
                          <Ionicons
                            name="videocam-outline"
                            size={22}
                            color={PRIMARY}
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.infoWrap}>
                      <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, labelFontBold]}>
                          {t("statusApproved")}
                        </Text>
                      </View>

                      <Text style={styles.className} numberOfLines={2}>
                        {className}
                      </Text>

                      {!!batchNumber && (
                        <View style={styles.batchPill}>
                          <Text style={styles.batchText}>{`Batch ${batchNumber}`}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <Pressable
                  onPress={() => onOpenClass(item)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    pressed && styles.actionPressed,
                  ]}
                >
                  <Text style={[styles.actionBtnText, labelFontBold]}>
                    {t("viewRecordings")}
                  </Text>
                  <View style={styles.iconChip}>
                    <Ionicons name="play" size={14} color="#FFFFFF" />
                  </View>
                </Pressable>
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: PRIMARY,
    textAlign: "center",
    marginBottom: 14,
  },

  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },

  infoText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "700",
    fontSize: 13,
  },

  errTitle: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 15,
  },

  retryWrap: {
    marginTop: 12,
    backgroundColor: "#EAF1FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E5FF",
  },

  tryAgain: {
    color: PRIMARY,
    fontWeight: "800",
    fontSize: 13,
  },

  scrollContent: {
    paddingBottom: TAB_BAR_SPACE,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  centerInfo: {
    textAlign: "center",
    color: "#64748B",
    fontWeight: "500",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    padding: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  thumbWrap: {
    width: 78,
    height: 78,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoWrap: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 6,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#ECFDF3",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
  },

  className: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 22,
  },

  batchPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D7E5FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  batchText: {
    fontSize: 11,
    fontWeight: "800",
    color: PRIMARY,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginTop: 12,
    marginBottom: 12,
  },

  actionBtn: {
    minHeight: 44,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 10,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionPressed: {
    opacity: 0.94,
  },

  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  iconChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});