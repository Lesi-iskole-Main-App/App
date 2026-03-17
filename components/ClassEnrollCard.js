import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = "#214294";

const getImageSource = (item) => {
  const uri =
    item?.image ||
    item?.imageUrl ||
    item?.classImage ||
    item?.classImageUrl ||
    item?.thumbnail ||
    item?.thumbnailUrl ||
    "";

  if (uri) return { uri: String(uri) };
  return null;
};

export default function ClassEnrollCard({
  item,
  status = "",
  onPressView,
  onPressEnroll,
  onPressDemo,
}) {
  const canView = status === "approved";
  const isPending = status === "pending";

  const imageSource = getImageSource(item);
  const className = String(item?.className || "Class");
  const teacherName = String(item?.teacherName || item?.teacher || "").trim();
  const batchNumber = String(
    item?.batchNumber || item?.batch || item?.classDetails?.batchNumber || ""
  ).trim();

  const statusLabel = canView
    ? "Approved"
    : isPending
    ? "Pending"
    : "Available";

  const actionText = canView
    ? "View Lessons"
    : isPending
    ? "Request Pending"
    : "Enroll Now";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <View style={styles.thumbWrap}>
            {imageSource ? (
              <Image source={imageSource} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imageFallback}>
                <Ionicons name="school-outline" size={22} color={PRIMARY} />
              </View>
            )}
          </View>

          <View style={styles.infoWrap}>
            <View
              style={[
                styles.statusBadge,
                canView
                  ? styles.statusApproved
                  : isPending
                  ? styles.statusPending
                  : styles.statusAvailable,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  canView
                    ? styles.statusApprovedText
                    : isPending
                    ? styles.statusPendingText
                    : styles.statusAvailableText,
                ]}
              >
                {statusLabel}
              </Text>
            </View>

            <Text style={styles.className} numberOfLines={2}>
              {className}
            </Text>

            {!!batchNumber && (
              <View style={styles.batchPill}>
                <Text style={styles.batchPillText}>Batch {batchNumber}</Text>
              </View>
            )}

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
          onPress={onPressDemo}
          style={({ pressed }) => [
            styles.demoBtn,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.demoBtnText}>Demo Lesson</Text>
          <View style={styles.demoIconChip}>
            <Ionicons name="play" size={14} color={PRIMARY} />
          </View>
        </Pressable>

        <Pressable
          onPress={canView ? onPressView : onPressEnroll}
          disabled={isPending}
          style={({ pressed }) => [
            styles.actionBtn,
            canView && styles.viewBtn,
            isPending && styles.pendingBtn,
            pressed && !isPending && styles.actionPressed,
          ]}
        >
          <Text
            style={[
              styles.actionBtnText,
              canView && styles.viewBtnText,
              isPending && styles.pendingBtnText,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
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
  },

  batchPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D7E5FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  batchPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: PRIMARY,
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
    gap: 10,
  },

  demoBtn: {
    minHeight: 44,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 10,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D7E5FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  demoBtnText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "800",
  },

  demoIconChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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
  },

  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
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