import React, { useState, useCallback } from "react";
import { View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export default function YoutubePlayerBox({ videoId, height }) {
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={{ width: "100%", height, backgroundColor: "#0B1220" }}>
      <YoutubePlayer
        height={height}
        play={playing}
        videoId={videoId}
        onChangeState={onStateChange}
        forceAndroidAutoplay={false}
        webViewStyle={{ opacity: 0.99, backgroundColor: "#0B1220" }}
        initialPlayerParams={{
          controls: true,
          modestbranding: true,
          rel: false,
          iv_load_policy: 3,
          playsinline: true,
          fullscreen: true,
        }}
      />
    </View>
  );
}