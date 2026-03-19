import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import CrossWebView from "../components/CrossWebView";
import YoutubePlayerBox from "../components/YoutubePlayerBox";
import { useGetAllReviewsQuery } from "../app/reviewApi";

const { width } = Dimensions.get("window");

function getYouTubeId(url = "") {
  if (!url) return "";

  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const embedMatch = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortsMatch = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shortsMatch?.[1]) return shortsMatch[1];

  return "";
}

export default function ReviewComponent() {
  const {
    data: reviews = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllReviewsQuery();

  const CARD_GAP = 14;
  const CARD_W = Math.round(width * 0.88);
  const SIDE_PADDING = Math.round((width - CARD_W) / 2);

  if (isLoading || isFetching) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>
          {error?.data?.message || error?.error || "Failed to load reviews"}
        </Text>
      </View>
    );
  }

  if (!reviews || !reviews.length) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.emptyText}>No reviews found</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
      >
        {reviews.map((item, index) => {
          const videoId = getYouTubeId(item.youtubeUrl);
          const playerHeight = Math.round((CARD_W - 24) * 0.54);

          const playerHtml = (() => {
            if (!videoId) return "";

            const src =
              `https://www.youtube-nocookie.com/embed/${videoId}` +
              `?playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1&controls=1`;

            return `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
                  <style>
                    html, body {
                      margin:0;
                      padding:0;
                      width:100%;
                      height:100%;
                      background:#0B1220;
                      overflow:hidden;
                    }
                    iframe {
                      width:100%;
                      height:100%;
                      border:0;
                      display:block;
                      background:#0B1220;
                    }
                  </style>
                </head>
                <body>
                  <iframe
                    src="${src}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </body>
              </html>
            `;
          })();

          return (
            <View
              key={item._id || `review-${index}`}
              style={[
                styles.card,
                {
                  width: CARD_W,
                  marginRight: index === reviews.length - 1 ? 0 : CARD_GAP,
                },
              ]}
            >
              {!!item.title && (
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
              )}

              <View style={[styles.playerBox, { height: playerHeight }]}>
                {!videoId ? (
                  <View style={styles.playerFallback}>
                    <Text style={styles.fallbackText}>Invalid YouTube link</Text>
                  </View>
                ) : Platform.OS === "web" ? (
                  <CrossWebView
                    source={{ html: playerHtml }}
                    style={styles.webview}
                  />
                ) : (
                  <YoutubePlayerBox videoId={videoId} height={playerHeight} />
                )}
              </View>

              {!!item.description && (
                <Text style={styles.desc}>{item.description}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginTop: 8,
    marginBottom: 4,
  },

  loadingWrap: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontFamily: "AbhayaLibre_400Regular",
  },

  emptyText: {
    color: "#475569",
    fontSize: 14,
    fontFamily: "AbhayaLibre_400Regular",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "AbhayaLibre_700Bold",
  },

  playerBox: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0B1220",
    marginBottom: 8,
  },

  webview: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  playerFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  desc: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 18,
    textAlign: "left",
    fontFamily: "AbhayaLibre_700Bold",
  },
});