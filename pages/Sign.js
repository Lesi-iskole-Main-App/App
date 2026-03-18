import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";

import lesiiskole_logo from "../assets/lesiiskole_logo.png";

import { useDispatch, useSelector } from "react-redux";
import {
  setToken,
  setPendingIdentity,
  setSignupDistrict,
  clearGradeSelection,
} from "../app/features/authSlice";
import { setUser, updateUserFields } from "../app/features/userSlice";

import { useSignupMutation, useSigninMutation } from "../app/authApi";
import { useSaveStudentGradeSelectionMutation } from "../app/userApi";
import { useSaveLanguageSelectionMutation } from "../app/languageApi";
import { loadStoredLanguage } from "../app/languageStorage";

import useT from "../app/i18n/useT";

const BG_INPUT = "#F1F5F9";
const PLACEHOLDER = "#97A4B8";
const PRIMARY = "#214294";

const SRI_LANKA_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "NuwaraEliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const parseGradeNumber = (gradeLabel) => {
  const raw = String(gradeLabel || "").trim().toLowerCase();

  if (raw === "a/l" || raw === "al") return 12;

  const m = raw.match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
};

const formatBirthday = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const makeSafeDate = (y, m, d) => {
  const yy = Number(y);
  const mm = Number(m);
  const dd = Number(d);
  if (!yy || !mm || !dd) return null;

  const dt = new Date(yy, mm - 1, dd);
  if (Number.isNaN(dt.getTime())) return null;

  if (
    dt.getFullYear() !== yy ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== dd
  ) {
    return null;
  }

  return dt;
};

export default function Sign({ navigation, route }) {
  const dispatch = useDispatch();
  const { t, sinFont } = useT();

  const [signup] = useSignupMutation();
  const [signin] = useSigninMutation();
  const [saveGradeSelection] = useSaveStudentGradeSelectionMutation();
  const [saveLanguageSelection] = useSaveLanguageSelectionMutation();

  const selectedLevel = useSelector((s) => s?.auth?.selectedLevel);
  const selectedGrade = useSelector((s) => s?.auth?.selectedGrade);
  const selectedStream = useSelector((s) => s?.auth?.selectedStream);

  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState(route?.params?.mode || "signup");
  const isSignUp = mode === "signup";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(route?.params?.phone || "");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [passwordUp, setPasswordUp] = useState("");
  const [confirmPasswordUp, setConfirmPasswordUp] = useState("");

  const [phoneIn, setPhoneIn] = useState(route?.params?.phone || "");
  const [passwordIn, setPasswordIn] = useState("");

  const [districtModal, setDistrictModal] = useState(false);
  const [birthdayPickerVisible, setBirthdayPickerVisible] = useState(false);
  const [birthdayWebModal, setBirthdayWebModal] = useState(false);

  const [webY, setWebY] = useState("");
  const [webM, setWebM] = useState("");
  const [webD, setWebD] = useState("");

  const toggleBtnStyle = useMemo(
    () => (active) => [
      styles.toggleBtn,
      active ? styles.toggleBtnActive : styles.toggleBtnInactive,
    ],
    []
  );

  const toggleTextStyle = useMemo(
    () => (active) => [
      styles.toggleText,
      active ? styles.toggleTextActive : styles.toggleTextInactive,
    ],
    []
  );

  const trySaveSelectionOnce = async (userFromLogin) => {
    if (userFromLogin?.role !== "student") return;

    if (!selectedLevel) return;

    const isAL = selectedLevel === "al";
    const gNum = isAL ? 12 : parseGradeNumber(selectedGrade);

    if (!gNum) return;
    if (isAL && !String(selectedStream || "").trim()) return;

    try {
      const resp = await saveGradeSelection({
        level: selectedLevel,
        gradeNumber: gNum,
        stream: isAL ? selectedStream : null,
      }).unwrap();

      if (resp?.user) dispatch(updateUserFields(resp.user));
      dispatch(clearGradeSelection());
    } catch (e) {
      console.log("save grade selection failed:", e);
    }
  };

  const trySaveLanguageOnce = async () => {
    try {
      const stored = await loadStoredLanguage();
      const lang = stored === "en" ? "en" : "si";
      await saveLanguageSelection({ language: lang }).unwrap();
    } catch (e) {
      console.log("save language failed:", e);
    }
  };

  const validateSignup = () => {
    const n = name.trim();
    const ph = phone.trim();
    const dis = district.trim();
    const tw = town.trim();
    const ad = address.trim();
    const bd = formatBirthday(birthday);
    const pw = String(passwordUp || "");
    const cpw = String(confirmPasswordUp || "");

    if (!n) return "Please enter your name";
    if (!ph) return "Please enter your phone number";
    if (!dis) return "Please select your district";
    if (!tw) return "Please enter your town";
    if (!ad) return "Please enter your address";
    if (!bd) return "Please select your birthday";
    if (!pw) return "Please enter your password";
    if (!cpw) return "Please enter confirm password";
    if (pw.length < 6) return "Password must be at least 6 characters";
    if (pw !== cpw) return "Password and confirm password do not match";
    return null;
  };

  const onContinue = async () => {
    try {
      setLoading(true);

      if (isSignUp) {
        const errMsg = validateSignup();
        if (errMsg) {
          Alert.alert("Required", errMsg);
          setLoading(false);
          return;
        }

        const payload = {
          name: name.trim(),
          whatsappnumber: phone.trim(),
          password: passwordUp,
          role: "student",
          district: district.trim(),
          town: town.trim(),
          address: address.trim(),
          birthday: formatBirthday(birthday),
        };

        dispatch(setSignupDistrict(payload.district));

        await signup(payload).unwrap();

        dispatch(
          setPendingIdentity({
            phone: payload.whatsappnumber,
          })
        );

        Alert.alert("OTP Sent", "We sent OTP to your WhatsApp.");

        navigation.navigate("OTP", {
          phone: payload.whatsappnumber,
          flow: "signup",
        });
        return;
      }

      const loginPayload = {
        whatsappnumber: phoneIn.trim(),
        password: passwordIn,
        clientType: "student_app",
      };

      const res = await signin(loginPayload).unwrap();

      dispatch(setToken(res?.token || null));
      dispatch(setUser(res?.user || null));

      await trySaveSelectionOnce(res?.user);
      await trySaveLanguageOnce();

      navigation.replace("Home");
    } catch (e) {
      const msg = e?.data?.message || e?.message || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const getDistrictLabel = (d) => {
    const dict = t("districts");
    if (dict && typeof dict === "object" && dict[d]) return dict[d];
    return d;
  };

  const onBirthdayChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setBirthdayPickerVisible(false);
    }
    if (selectedDate) setBirthday(selectedDate);
  };

  const openBirthdayPicker = () => {
    if (Platform.OS === "web") {
      const now = birthday || new Date(2005, 0, 1);
      setWebY(String(now.getFullYear()));
      setWebM(String(now.getMonth() + 1));
      setWebD(String(now.getDate()));
      setBirthdayWebModal(true);
      return;
    }

    setBirthdayPickerVisible(true);
  };

  const BirthdayWebPicker = () => {
    if (Platform.OS !== "web") return null;

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1950; y--) years.push(String(y));

    const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

    const Item = ({ value, setValue, list }) => (
      <View style={styles.webPickerCol}>
        <ScrollView
          style={{ maxHeight: 220 }}
          showsVerticalScrollIndicator={false}
        >
          {list.map((v) => {
            const active = String(value) === String(v);
            return (
              <Pressable
                key={v}
                style={[styles.webPickItem, active && styles.webPickItemActive]}
                onPress={() => setValue(v)}
              >
                <Text style={[styles.webPickText, sinFont("bold")]}>{v}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );

    return (
      <Modal visible={birthdayWebModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setBirthdayWebModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={[styles.modalTitle, sinFont("bold")]}>
              {t("birthday")}
            </Text>

            <View style={styles.webPickerRow}>
              <Item value={webY} setValue={setWebY} list={years} />
              <Item value={webM} setValue={setWebM} list={months} />
              <Item value={webD} setValue={setWebD} list={days} />
            </View>

            <View style={styles.webPickerActions}>
              <Pressable
                style={[styles.webBtn, styles.webBtnGhost]}
                onPress={() => setBirthdayWebModal(false)}
              >
                <Text style={[styles.webBtnTextGhost, sinFont("bold")]}>
                  {t("close")}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.webBtn, styles.webBtnPrimary]}
                onPress={() => {
                  const dt = makeSafeDate(webY, webM, webD);
                  if (!dt) {
                    Alert.alert(
                      "Invalid date",
                      "Please select a valid birthday."
                    );
                    return;
                  }
                  setBirthday(dt);
                  setBirthdayWebModal(false);
                }}
              >
                <Text style={[styles.webBtnText, sinFont("bold")]}>
                  {t("ok")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const DistrictPicker = () => (
    <Modal visible={districtModal} transparent animationType="fade">
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setDistrictModal(false)}
      >
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={[styles.modalTitle, sinFont("bold")]}>
            {t("selectDistrict")}
          </Text>

          <ScrollView
            style={{ maxHeight: 420 }}
            showsVerticalScrollIndicator={false}
          >
            {SRI_LANKA_DISTRICTS.map((d) => (
              <Pressable
                key={d}
                style={styles.modalItem}
                onPress={() => {
                  setDistrict(d);
                  setDistrictModal(false);
                }}
              >
                <Text style={[styles.modalItemText, sinFont("bold")]}>
                  {getDistrictLabel(d)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (!isSignUp) {
    return (
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.centerSignin}>
          <Image
            source={lesiiskole_logo}
            style={styles.logoSmall}
            resizeMode="contain"
          />

          <Text style={[styles.welcome, sinFont("bold")]}>{t("welcome")}</Text>

          <View style={styles.toggleContainer}>
            <Pressable
              onPress={() => setMode("signup")}
              style={toggleBtnStyle(false)}
            >
              <Text style={[...toggleTextStyle(false), sinFont()]}>
                {t("signUp")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("signin")}
              style={toggleBtnStyle(true)}
            >
              <Text style={[...toggleTextStyle(true), sinFont()]}>
                {t("signIn")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <Field
              placeholder={t("phoneNumber")}
              placeholderFont={sinFont()}
              value={phoneIn}
              onChangeText={setPhoneIn}
              keyboardType="phone-pad"
            />
            <Field
              placeholder={t("password")}
              placeholderFont={sinFont()}
              value={passwordIn}
              onChangeText={setPasswordIn}
              secureTextEntry
            />

            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotWrap}
            >
              <Text style={[styles.forgotText, sinFont("bold")]}>
                {t("forgotPassword")}
              </Text>
            </Pressable>

            <Pressable onPress={onContinue} style={styles.gradientBtnOuter}>
              <LinearGradient
                colors={[
                  "#086DFF",
                  "#5E9FFD",
                  "#7DB1FC",
                  "#62C4F6",
                  "#48D7F0",
                  "#C7F4F8",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.gradientBtnText, sinFont("bold")]}>
                    {t("continue")}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <DistrictPicker />
      <BirthdayWebPicker />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={lesiiskole_logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.welcome, sinFont("bold")]}>{t("welcome")}</Text>

        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setMode("signup")}
            style={toggleBtnStyle(true)}
          >
            <Text style={[...toggleTextStyle(true), sinFont()]}>
              {t("signUp")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("signin")}
            style={toggleBtnStyle(false)}
          >
            <Text style={[...toggleTextStyle(false), sinFont()]}>
              {t("signIn")}
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <Field
            placeholder={t("name")}
            placeholderFont={sinFont()}
            value={name}
            onChangeText={setName}
          />

          <Field
            placeholder={t("phoneNumber")}
            placeholderFont={sinFont()}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Pressable
            onPress={() => setDistrictModal(true)}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text
              style={[
                { color: district ? "#0F172A" : PLACEHOLDER, fontWeight: "700" },
                sinFont("bold"),
              ]}
            >
              {district ? getDistrictLabel(district) : t("district")}
            </Text>
          </Pressable>

          <Field
            placeholder={t("town")}
            placeholderFont={sinFont()}
            value={town}
            onChangeText={setTown}
          />

          <Field
            placeholder={t("address")}
            placeholderFont={sinFont()}
            value={address}
            onChangeText={setAddress}
            multiline
            style={{ minHeight: 90, textAlignVertical: "top", paddingTop: 12 }}
          />

          <Pressable
            onPress={openBirthdayPicker}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text
              style={[
                {
                  color: birthday ? "#0F172A" : PLACEHOLDER,
                  fontWeight: birthday ? "700" : "400",
                },
                sinFont(birthday ? "bold" : undefined),
              ]}
            >
              {birthday ? formatBirthday(birthday) : t("birthday")}
            </Text>
          </Pressable>

          {birthdayPickerVisible && Platform.OS !== "web" && (
            <DateTimePicker
              value={birthday || new Date(2005, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={onBirthdayChange}
            />
          )}

          <Field
            placeholder={t("password")}
            placeholderFont={sinFont()}
            value={passwordUp}
            onChangeText={setPasswordUp}
            secureTextEntry
          />

          <Field
            placeholder={t("confirmPassword") || "Confirm Password"}
            placeholderFont={sinFont()}
            value={confirmPasswordUp}
            onChangeText={setConfirmPasswordUp}
            secureTextEntry
          />

          <Pressable onPress={onContinue} style={styles.gradientBtnOuter}>
            <LinearGradient
              colors={[
                "#086DFF",
                "#5E9FFD",
                "#7DB1FC",
                "#62C4F6",
                "#48D7F0",
                "#C7F4F8",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.gradientBtnText, sinFont("bold")]}>
                  {t("continue")}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  placeholder,
  placeholderFont,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  multiline,
  style,
}) {
  const empty = !String(value || "").length;

  return (
    <View style={[styles.inputWrap, multiline ? { minHeight: 90 } : null]}>
      {empty ? (
        <Text
          pointerEvents="none"
          style={[
            styles.fakePlaceholder,
            placeholderFont,
            multiline ? { top: 12 } : null,
          ]}
          numberOfLines={multiline ? 2 : 1}
        >
          {placeholder}
        </Text>
      ) : null}

      <TextInput
        placeholder=""
        placeholderTextColor="transparent"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        allowFontScaling={false}
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          styles.realInputLayer,
          multiline ? { height: undefined } : null,
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    alignItems: "center",
  },

  logo: { width: 140, height: 140, marginBottom: 4 },
  logoSmall: { width: 120, height: 120, marginBottom: 20 },

  centerSignin: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  welcome: {
    fontSize: 26,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 12,
    marginTop: -25,
  },

  toggleContainer: {
    width: "100%",
    backgroundColor: BG_INPUT,
    borderRadius: 16,
    padding: 6,
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },

  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: { backgroundColor: "#FFFFFF" },
  toggleBtnInactive: { backgroundColor: "transparent" },

  toggleText: { fontSize: 14, fontWeight: "500" },
  toggleTextActive: { color: PRIMARY },
  toggleTextInactive: { color: "#64748B" },

  form: { width: "100%", gap: 10 },

  inputWrap: {
    width: "100%",
    position: "relative",
  },

  input: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    backgroundColor: BG_INPUT,
    paddingHorizontal: 14,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  realInputLayer: {
    zIndex: 1,
    elevation: 1,
  },

  fakePlaceholder: {
    position: "absolute",
    left: 14,
    right: 14,
    top: Platform.OS === "ios" ? 15 : 0,
    height: 48,
    color: PLACEHOLDER,
    fontSize: 14,
    fontWeight: "400",
    textAlignVertical: "center",
    zIndex: 5,
    elevation: 5,
  },

  forgotWrap: { alignSelf: "flex-end", marginTop: 2, marginBottom: 6 },
  forgotText: { color: PRIMARY, fontSize: 12, fontWeight: "700" },

  gradientBtnOuter: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
  },
  gradientBtn: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  gradientBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#214294",
  },

  webPickerRow: {
    flexDirection: "row",
    gap: 10,
  },
  webPickerCol: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 8,
  },
  webPickItem: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  webPickItemActive: {
    backgroundColor: "#E6F0FF",
  },
  webPickText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  webPickerActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  webBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  webBtnGhost: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  webBtnPrimary: {
    backgroundColor: PRIMARY,
  },
  webBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  webBtnTextGhost: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "900",
  },
});