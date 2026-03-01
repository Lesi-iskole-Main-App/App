// app/api/baseUrl.js
import { Platform } from "react-native";

// ✅ Change this to YOUR PC IPv4 (same WiFi as phone)
const LOCAL_PC_IP = "192.168.8.107";

// ✅ Android emulator uses 10.0.2.2 to reach your PC localhost
const ANDROID_EMULATOR_HOST = "10.0.2.2";

// ✅ iOS simulator uses localhost
const IOS_SIMULATOR_HOST = "localhost";

export const getApiHost = () => {
  // If you set EXPO_PUBLIC_API_HOST in .env, it will override everything.
  // Example: EXPO_PUBLIC_API_HOST=192.168.1.59
  const envHost =
    process.env.EXPO_PUBLIC_API_HOST ||
    process.env.REACT_APP_API_HOST ||
    "";

  if (envHost) return envHost;

  // Web
  if (Platform.OS === "web") return "localhost";

  // Android (device OR emulator)
  if (Platform.OS === "android") {
    // If you are using emulator -> use 10.0.2.2
    // If you are using real device -> use LOCAL_PC_IP
    // ✅ safest default for YOUR case: real device
    return LOCAL_PC_IP;
  }

  // iOS
  return IOS_SIMULATOR_HOST;
};

export const BASE_URL = `http://${getApiHost()}:8080`;
