import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CrossWebView from "../components/CrossWebView";
import YoutubePlayerBox from "../components/YoutubePlayerBox";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getYouTubeId(url = "") {
  if (!url) return "";

  const cleanUrl = String(url).trim();

  const shortMatch = cleanUrl.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const watchMatch = cleanUrl.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shortsMatch?.[1]) return shortsMatch[1];

  return "";
}

function isDirectVideoFile(url = "") {
  const cleanUrl = String(url || "").trim().toLowerCase();
  return (
    /\.mp4(\?|#|$)/i.test(cleanUrl) ||
    /\.m3u8(\?|#|$)/i.test(cleanUrl) ||
    /\.mov(\?|#|$)/i.test(cleanUrl) ||
    /\.webm(\?|#|$)/i.test(cleanUrl)
  );
}

function getVideoHtml(url = "") {
  const safeUrl = String(url || "").trim();
  if (!safeUrl) return "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #000;
            overflow: hidden;
          }
          video {
            width: 100%;
            height: 100%;
            background: #000;
          }
        </style>
      </head>
      <body>
        <video controls playsinline preload="metadata">
          <source src="${escapeHtml(safeUrl)}" />
        </video>
      </body>
    </html>
  `;
}

function getYouTubeEmbedHtml(videoId = "") {
  if (!videoId) return "";

  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?playsinline=1&rel=0&modestbranding=1&controls=1`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #000;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
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
}

export default function RecordingViewLesson({ route }) {
  const { t, lang } = useT();
  const isSi = lang === "si";

  const title = route?.params?.title ?? "Recording Lesson";
  const recordingUrl = route?.params?.recordingUrl ?? "";

  const [fullOpen, setFullOpen] = useState(false);

  const cardWidth = width - 32;
  const normalHeight = Math.round(cardWidth * 0.56);
  const fullHeight = Math.round(height * 0.34);

  const youtubeId = useMemo(() => getYouTubeId(recordingUrl), [recordingUrl]);
  const isYoutube = !!youtubeId;
  const isDirectFile = useMemo(() => isDirectVideoFile(recordingUrl), [recordingUrl]);

  const playerHtml = useMemo(() => {
    if (isYoutube) return getYouTubeEmbedHtml(youtubeId);
    if (isDirectFile) return getVideoHtml(recordingUrl);
    return "";
  }, [isYoutube, youtubeId, isDirectFile, recordingUrl]);

  const renderPlayer = (playerHeight) => {
    if (!recordingUrl) {
      return (
        <View style={styles.playerFallback}>
          <Ionicons name="alert-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.fallbackText}>Missing recording link</Text>
        </View>
      );
    }

    if (isYoutube) {
      if (Platform.OS === "web") {
        return (
          <CrossWebView
            source={{ html: playerHtml }}
            style={[styles.webview, { height: playerHeight }]}
          />
        );
      }

      return <YoutubePlayerBox videoId={youtubeId} height={playerHeight} />;
    }

    if (isDirectFile) {
      return (
        <CrossWebView
          source={{ html: playerHtml }}
          style={[styles.webview, { height: playerHeight }]}
        />
      );
    }

    return (
      <View style={styles.playerFallback}>
        <Ionicons name="alert-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.fallbackText}>This link cannot play inside app</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrap}>
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>

          <View style={[styles.mainCard, { width: cardWidth }]}>
            <View style={[styles.playerBox, { height: normalHeight }]}>
              {renderPlayer(normalHeight)}
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.fullBtn,
                  pressed && styles.fullBtnPressed,
                ]}
                onPress={() => setFullOpen(true)}
              >
                <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                <Text style={styles.fullBtnText}>View</Text>
              </Pressable>
            </View>

            <Text
              style={[
                styles.helperText,
                isSi && styles.helperTextSi,
              ]}
            >
              {t("tapViewFullScreen")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={fullOpen} animationType="fade" transparent={false}>
        <SafeAreaView style={styles.fullScreenWrap}>
          <View style={styles.fullHeader}>
            <Text style={styles.fullHeaderText}>{title}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
              onPress={() => setFullOpen(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.fullPlayerArea}>
            <View style={[styles.fullPlayerBox, { height: fullHeight }]}>
              {renderPlayer(fullHeight)}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
    width: "100%",
    lineHeight: 26,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  playerBox: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0B1220",
  },

  webview: {
    width: "100%",
    backgroundColor: "#0B1220",
  },

  playerFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0B1220",
  },

  fallbackText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  actionRow: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  fullBtn: {
    height: 34,
    minWidth: 82,
    borderRadius: 10,
    backgroundColor: "#214294",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  fullBtnPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },

  fullBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  helperText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 17,
  },

  helperTextSi: {
    fontFamily: "AbhayaLibre_700Bold",
    fontWeight: "normal",
  },

  fullScreenWrap: {
    flex: 1,
    backgroundColor: "#020617",
  },

  fullHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  fullHeaderText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    paddingLeft: 38,
    paddingRight: 10,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeBtnPressed: {
    opacity: 0.9,
  },

  fullPlayerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  fullPlayerBox: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
});