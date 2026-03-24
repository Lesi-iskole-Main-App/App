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
import useT from "../app/i18n/useT";

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

const normalizeZoomLinks = (item) => {
  if (Array.isArray(item?.zoomLinks)) {
    const cleaned = item.zoomLinks
      .map((x) => String(x || "").trim())
      .filter(Boolean);

    if (cleaned.length > 0) return cleaned;
  }

  const single = String(item?.zoomLink || item?.liveLink || "").trim();
  return single ? [single] : [];
};

export default function Live() {
  const { t, sinFont, lang } = useT();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentLivesQuery(undefined, {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch?.();
    }, [refetch])
  );

  const safeData = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.lives)) return data.lives;
    return [];
  }, [data]);

  const lives = useMemo(() => {
    return [...safeData].sort(
      (a, b) =>
        new Date(a?.scheduledAt || 0).getTime() -
        new Date(b?.scheduledAt || 0).getTime()
    );
  }, [safeData]);

  const hasLives = lives.length > 0;
  const showInitialLoader = isLoading && !hasLives;
  const showFullError = isError && !hasLives && !isFetching;

  const onJoin = async (url) => {
    try {
      if (!url) return;
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch (err) {
      console.log("Failed to open live link:", err);
    }
  };

  const pageTitle = t("liveClassesTitle");
  const liveText = t("liveLabel");
  const dateTextLabel = t("dateLabel");
  const timeTextLabel = t("timeLabel");
  const joinLinkText = t("joinLink");

  if (showInitialLoader) {
    return (
      <View style={[styles.screen, styles.centerWrap]}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={[styles.stateText, sinFont("regular")]}>
          {t("loadingReviewLbl")}
        </Text>
      </View>
    );
  }

  if (showFullError) {
    return (
      <View style={[styles.screen, styles.centerWrap]}>
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>Unable to load live classes right now</Text>
          <Text style={styles.errorSubText}>Please try again.</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={[styles.pageTitle, sinFont("bold")]}>{pageTitle}</Text>

      {isFetching ? (
        <View style={styles.refreshWrap}>
          <Text style={[styles.refreshText, sinFont("regular")]}>
            {t("loadingReviewLbl")}
          </Text>
        </View>
      ) : null}

      {isError && hasLives ? (
        <View style={styles.inlineErrorWrap}>
          <Text style={styles.inlineErrorText}>
            Could not refresh live classes. Showing latest available data.
          </Text>
          <Pressable onPress={refetch} style={styles.inlineRetryBtn}>
            <Text style={styles.inlineRetryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!hasLives ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, lang === "si" ? sinFont("regular") : null]}>
            {t("noLiveClassesNow")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={lives}
          keyExtractor={(item, index) => String(item?._id || index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const title = item?.title || item?.classTitle || "Live Classes";
            const dateText = formatDate(item?.scheduledAt);
            const timeText = formatTime(item?.scheduledAt);
            const batchNumber = String(
              item?.batchNumber || item?.classDetails?.batchNumber || ""
            ).trim();

            const zoomLinks = normalizeZoomLinks(item);

            return (
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.title} numberOfLines={2}>
                      {title}
                    </Text>

                    {!!batchNumber && (
                      <View style={styles.batchPill}>
                        <Text style={styles.batchPillText}>
                          {`Batch ${batchNumber}`}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveBadgeText, sinFont("bold")]}>
                      {liveText}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, sinFont("bold")]}>
                      {dateTextLabel}
                    </Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {dateText || "-"}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, sinFont("bold")]}>
                      {timeTextLabel}
                    </Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {timeText || "-"}
                    </Text>
                  </View>
                </View>

                {zoomLinks.length === 1 ? (
                  <Pressable
                    style={styles.joinBtn}
                    onPress={() => onJoin(zoomLinks[0])}
                  >
                    <Text style={styles.joinBtnText}>Join Class</Text>
                  </Pressable>
                ) : zoomLinks.length > 1 ? (
                  <View style={styles.multiBtnWrap}>
                    {zoomLinks.map((link, index) => (
                      <Pressable
                        key={`${item?._id || "live"}-${index}`}
                        style={styles.multiJoinBtn}
                        onPress={() => onJoin(link)}
                      >
                        <Text style={[styles.multiJoinBtnText, sinFont("bold")]}>
                          {joinLinkText} {index + 1}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noLinkWrap}>
                    <Text style={styles.noLinkText}>No join link available</Text>
                  </View>
                )}
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

  inlineErrorWrap: {
    marginBottom: 10,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  inlineErrorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#9A3412",
  },

  inlineRetryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDBA74",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  inlineRetryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C2410C",
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

  errorSubText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
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
    alignItems: "flex-start",
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

  multiBtnWrap: {
    marginTop: 2,
    gap: 8,
  },

  multiJoinBtn: {
    width: "100%",
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  multiJoinBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  noLinkWrap: {
    alignItems: "center",
    paddingVertical: 6,
  },

  noLinkText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
});