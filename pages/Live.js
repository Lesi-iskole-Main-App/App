import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useGetStudentLivesQuery } from "../app/liveApi";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  } catch {
    return "";
  }
};

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "p.m." : "a.m.";
    h = h % 12 || 12;
    return `${h}.${m} ${ampm}`;
  } catch {
    return "";
  }
};

export default function Live() {
  const { data = [], isLoading, isFetching, error, refetch } =
    useGetStudentLivesQuery(undefined, {
      pollingInterval: 10000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  useFocusEffect(
    useCallback(() => {
      refetch?.();
    }, [refetch])
  );

  const lives = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return [...list].sort(
      (a, b) =>
        new Date(a?.scheduledAt || 0).getTime() -
        new Date(b?.scheduledAt || 0).getTime()
    );
  }, [data]);

  const onJoin = async (url) => {
    try {
      if (!url) return;
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch (err) {
      console.log("Failed to open live link:", err);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerWrap]}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.stateText}>Loading live classes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.centerWrap]}>
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>Failed to load live classes</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.pageTitle}>Live Classes</Text>

      {isFetching ? (
        <View style={styles.refreshWrap}>
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      ) : null}

      {lives.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No live classes right now.</Text>
        </View>
      ) : (
        <FlatList
          data={lives}
          keyExtractor={(item, index) => String(item?._id || index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const title = item?.title || item?.classTitle || "Live Class";
            const teacher =
              item?.teacherNames?.[0] ||
              item?.teacherName ||
              item?.teacher ||
              "Teacher";
            const dateText = formatDate(item?.scheduledAt);
            const timeText = formatTime(item?.scheduledAt);
            const batchNumber = String(
              item?.batchNumber || item?.classDetails?.batchNumber || ""
            ).trim();

            return (
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.title} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.teacher} numberOfLines={1}>
                      {teacher}
                    </Text>

                    {!!batchNumber && (
                      <View style={styles.batchPill}>
                        <Text style={styles.batchPillText}>Batch {batchNumber}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {dateText || "-"}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {timeText || "-"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.joinBtn}
                  onPress={() => onJoin(item?.zoomLink || item?.liveLink)}
                >
                  <Text style={styles.joinBtnText}>Join Class</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  centerWrap: {
    justifyContent: "center",
    alignItems: "center",
  },

  pageTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: "#DC2626",
    marginBottom: 10,
  },

  refreshWrap: {
    alignItems: "center",
    marginBottom: 8,
  },

  refreshText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  stateText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  stateCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  retryBtn: {
    marginTop: 10,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyWrap: {
    marginTop: 20,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },

  listContent: {
    paddingBottom: 120,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 4,
  },

  title: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
  },

  teacher: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },

  batchPill: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D7E5FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  batchPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#214294",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#DC2626",
    marginRight: 5,
  },

  liveBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#DC2626",
    letterSpacing: 0.3,
  },

  infoRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  infoItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  infoDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#E2E8F0",
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  joinBtn: {
    alignSelf: "center",
    minWidth: 126,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  joinBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
});