import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import useT from "../app/i18n/useT";

const PRIMARY = "#214294";

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

const StatusBadge = ({ status }) => {
  const { t, lang, sinFont } = useT();

  if (status === "approved") {
    return (
      <View style={[styles.statusBadge, styles.statusApproved]}>
        <View style={[styles.statusDot, { backgroundColor: "#16A34A" }]} />
        <Text
          style={[
            styles.statusText,
            styles.statusApprovedText,
            lang === "si" && sinFont("bold"),
          ]}
        >
          {t("statusApproved")}
        </Text>
      </View>
    );
  }

  if (status === "pending") {
    return (
      <View style={[styles.statusBadge, styles.statusPending]}>
        <View style={[styles.statusDot, { backgroundColor: "#D97706" }]} />
        <Text
          style={[
            styles.statusText,
            styles.statusPendingText,
            lang === "si" && sinFont("bold"),
          ]}
        >
          {t("statusPending")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusBadge, styles.statusAvailable]}>
      <View style={[styles.statusDot, { backgroundColor: PRIMARY }]} />
      <Text
        style={[
          styles.statusText,
          styles.statusAvailableText,
          lang === "si" && sinFont("bold"),
        ]}
      >
        {t("statusAvailable")}
      </Text>
    </View>
  );
};

export default function ClassEnrollCard({
  item,
  status = "",
  onPressView,
  onPressEnroll,
}) {
  const { t, lang, sinFont } = useT();

  const canView = status === "approved";
  const isPending = status === "pending";

  const imageSource = getImageSource(item);
  const className = String(item?.className || "Class");
  const teacherName = String(item?.teacherName || item?.teacher || "").trim();

  const actionText = canView
    ? t("viewLessons")
    : isPending
    ? t("requestPending")
    : t("enrollNow");

  return (
    <View style={styles.card}>
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
                      name="school-outline"
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
            <StatusBadge status={status} />

            <Text style={styles.className} numberOfLines={2}>
              {className}
            </Text>

            {!!teacherName && (
              <View style={styles.teacherRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={14}
                  color="#64748B"
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {teacherName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <Pressable
          onPress={canView ? onPressView : onPressEnroll}
          style={({ pressed }) => [
            styles.actionBtn,
            canView && styles.viewBtn,
            isPending && styles.pendingBtn,
            pressed && styles.actionPressed,
          ]}
        >
          <Text
            style={[
              styles.actionBtnText,
              canView && styles.viewBtnText,
              isPending && styles.pendingBtnText,
              lang === "si" && sinFont("bold"),
            ]}
          >
            {actionText}
          </Text>

          <View
            style={[
              styles.iconChip,
              canView && styles.viewIconChip,
              isPending && styles.pendingIconChip,
            ]}
          >
            <Ionicons
              name={
                canView
                  ? "play"
                  : isPending
                  ? "time-outline"
                  : "arrow-forward"
              }
              size={14}
              color={canView ? PRIMARY : isPending ? "#92400E" : "#FFFFFF"}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  statusApproved: {
    backgroundColor: "#ECFDF3",
    borderColor: "#BBF7D0",
  },

  statusApprovedText: {
    color: "#166534",
  },

  statusPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },

  statusPendingText: {
    color: "#92400E",
  },

  statusAvailable: {
    backgroundColor: "#EEF4FF",
    borderColor: "#D7E5FF",
  },

  statusAvailableText: {
    color: PRIMARY,
  },

  className: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  teacherRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
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

  pendingBtn: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
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

  pendingBtnText: {
    color: "#92400E",
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

  pendingIconChip: {
    backgroundColor: "#FEF3C7",
  },
});