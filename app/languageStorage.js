import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "APP_LANGUAGE";

export async function loadStoredLanguage() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === "en" || v === "si") return v;
    return null;
  } catch {
    return null;
  }
}

export async function saveStoredLanguage(lang) {
  try {
    const v = lang === "en" ? "en" : "si";
    await AsyncStorage.setItem(KEY, v);
    return true;
  } catch {
    return false;
  }
}