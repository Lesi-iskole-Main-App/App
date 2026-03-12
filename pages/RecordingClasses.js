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

const PRIMARY = "#214294";
const TAB_BAR_SPACE = 110;

const cleanText = (v) => String(v || "").replace(/\s+/g, " ").trim();

const getImageSource = (item) => {
  const uri =
    item?.image ||
    item?.imageUrl ||
    item?.classImage ||
    item?.classImageUrl ||
    item?.thumbnail ||
    item?.thumbnailUrl ||
    item?.banner ||
    item?.bannerUrl ||
    "";

  if (uri) {
    return { uri: String(uri) };
  }

  return null;
};

export default function RecordingClasses() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    data,
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
      ? item.teachers.join(", ")
      : "";

    const payload = {
      classId: item?.classId || item?._id || "",
      className: item?.className || "",
      grade: item?.grade || "",
      subject: item?.subject || "",
      teacher: teacherText,
    };

    dispatch(setSelectedRecordingClass(payload));
    navigation.navigate("RecordingLessons", payload);
  };

  const shouldCenterCards =
    Array.isArray(classes) && classes.length > 0 && classes.length <= 3;

  return (
    <View style={styles.screen}>
      <Text style={styles.pageTitle}>Recording Classes</Text>

      {isLoading ? (
        <View style={styles.stateWrap}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={PRIMARY} />
          </View>
          <Text style={styles.infoText}>Loading approved recording classes...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errTitle}>Failed to load recording classes</Text>
          <Pressable onPress={() => refetch?.()} style={styles.retryWrap}>
            <Text style={styles.tryAgain}>Try again</Text>
          </Pressable>
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No approved recording classes</Text>
          <Text style={styles.centerInfo}>
            No approved recording classes found.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            shouldCenterCards && styles.scrollCentered,
          ]}
        >
          {classes.map((item, idx) => {
            const className = cleanText(item?.className) || `Class ${idx + 1}`;
            const imageSource = getImageSource(item);

            return (
              <View
                style={styles.card}
                key={item?.classId || item?._id || String(idx)}
              >
                <View style={styles.cardGlow} />

                <View style={styles.topRow}>
                  <View style={styles.leftSection}>
                    <View style={styles.thumbOuter}>
                      <View style={styles.thumbWrap}>
                        {imageSource ? (
                          <Image
                            source={imageSource}
                            style={styles.image}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.imageFallback}>
                            <View style={styles.iconCore}>
                              <Ionicons
                                name="videocam-outline"
                                size={22}
                                color={PRIMARY}
                              />
                            </View>
                            <View style={styles.fallbackBlobOne} />
                            <View style={styles.fallbackBlobTwo} />
                            <View style={styles.fallbackMiniDot} />
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.infoWrap}>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Approved</Text>
                      </View>

                      <Text style={styles.className} numberOfLines={2}>
                        {className}
                      </Text>

                     
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.bottomRow}>
                  <Pressable
                    onPress={() => onOpenClass(item)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.viewBtn,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <Text style={[styles.actionBtnText, styles.viewBtnText]}>
                      View Recordings
                    </Text>

                    <View style={[styles.iconChip, styles.viewIconChip]}>
                      <Ionicons name="play" size={14} color={PRIMARY} />
                    </View>
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

  loaderBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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

  scrollCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
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
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    padding: 14,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  cardGlow: {
    position: "absolute",
    top: -18,
    right: -18,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF4FF",
    opacity: 0.9,
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

  thumbOuter: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    marginRight: 12,
  },

  thumbWrap: {
    width: 78,
    height: 78,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
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
    position: "relative",
  },

  iconCore: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  fallbackBlobOne: {
    position: "absolute",
    top: 10,
    left: 9,
    width: 18,
    height: 18,
    borderRadius: 8,
    backgroundColor: "#DDD6FE",
  },

  fallbackBlobTwo: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 15,
    height: 15,
    borderRadius: 7,
    backgroundColor: "#BFDBFE",
  },

  fallbackMiniDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
  },

  infoWrap: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 6,
  },

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#ECFDF3",
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#16A34A",
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
    letterSpacing: 0.1,
  },

  gradePill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  gradeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginTop: 12,
    marginBottom: 12,
  },

  bottomRow: {
    alignItems: "stretch",
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

  viewBtn: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D7E5FF",
  },

  actionPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.988 }],
  },

  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.1,
  },

  viewBtnText: {
    color: PRIMARY,
  },

  iconChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  viewIconChip: {
    backgroundColor: "#FFFFFF",
  },
});