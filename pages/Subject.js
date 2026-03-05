import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetGradeDetailQuery } from "../app/gradeApi";

import useT from "../app/i18n/useT";

const PRIMARY = "#214294";
const BG = "#F3F4F6";

const numberToWord = (num) => {
  const map = {
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
    10: "Ten",
    11: "Eleven",
    12: "Twelve",
    13: "Thirteen",
  };
  return map[num] || String(num);
};

const parseGradeNumber = (gradeLabel) => {
  const match = String(gradeLabel || "").match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

const getVariant = (index) => {
  const variants = [
    {
      shell: "#F6F3FF",
      bubble1: "#E9D5FF",
      bubble2: "#F5D0FE",
      iconBg: "#FFFFFF",
      icon: "calculator-variant-outline",
      iconType: "mci",
      iconColor: "#7C3AED",
    },
    {
      shell: "#F0F9FF",
      bubble1: "#DBEAFE",
      bubble2: "#CFFAFE",
      iconBg: "#FFFFFF",
      icon: "school-outline",
      iconType: "ion",
      iconColor: "#0284C7",
    },
    {
      shell: "#FFF7ED",
      bubble1: "#FDE68A",
      bubble2: "#FECACA",
      iconBg: "#FFFFFF",
      icon: "book-education-outline",
      iconType: "mci",
      iconColor: "#D97706",
    },
    {
      shell: "#F0FDF4",
      bubble1: "#BBF7D0",
      bubble2: "#DDD6FE",
      iconBg: "#FFFFFF",
      icon: "flask-outline",
      iconType: "ion",
      iconColor: "#16A34A",
    },
  ];

  return variants[index % variants.length];
};

const SubjectArt = ({ index }) => {
  const v = getVariant(index);

  return (
    <View style={[styles.artWrap, { backgroundColor: v.shell }]}>
      <View style={[styles.blobA, { backgroundColor: v.bubble1 }]} />
      <View style={[styles.blobB, { backgroundColor: v.bubble2 }]} />
      <View style={[styles.mainIconCircle, { backgroundColor: v.iconBg }]}>
        {v.iconType === "mci" ? (
          <MaterialCommunityIcons name={v.icon} size={20} color={v.iconColor} />
        ) : (
          <Ionicons name={v.icon} size={20} color={v.iconColor} />
        )}
      </View>
      <View style={styles.dotPurple} />
      <View style={styles.dotYellow} />
    </View>
  );
};

export default function Subjects({ route }) {
  const navigation = useNavigation();
  const { t, lang, sinFont } = useT();

  const gradeLabel = route?.params?.grade || "Grade 4";

  const gradeNumber = useMemo(() => parseGradeNumber(gradeLabel), [gradeLabel]);

  const gradeTitle = useMemo(() => {
    const g = Number(gradeNumber);

    const en = {
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Eleven",
      12: "Twelve",
      13: "Thirteen",
    };

    const si = {
      1: t("grade1"),
      2: t("grade2"),
      3: t("grade3"),
      4: t("grade4"),
      5: t("grade5"),
      6: t("grade6"),
      7: t("grade7"),
      8: t("grade8"),
      9: t("grade9"),
      10: t("grade10"),
      11: t("grade11"),
      12: t("grade12"),
      13: t("grade13"),
    };

    if (!g) return "";

    if (lang === "si") {
      return si[g] || `${g} ${t("grade")}`;
    }

    return `Grade ${en[g] || numberToWord(g)}`;
  }, [gradeNumber, lang, t]);

  const {
    data: gradeDoc,
    isLoading,
    isError,
    refetch,
  } = useGetGradeDetailQuery(gradeNumber, {
    skip: !gradeNumber,
  });

  const subjects = useMemo(() => {
    if (!gradeDoc) return [];

    if (gradeNumber >= 1 && gradeNumber <= 11) {
      const list = Array.isArray(gradeDoc?.subjects) ? gradeDoc.subjects : [];
      return list.map((s, index) => ({
        key: s?._id || `${s?.subject || "subject"}-${index}`,
        label: s?.subject || "—",
      }));
    }

    return [];
  }, [gradeDoc, gradeNumber]);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="small" color={PRIMARY} />
        <Text style={styles.stateText}>Loading subjects...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
        <Text style={styles.stateTitle}>Failed to load subjects</Text>
        <Pressable onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        subjects.length <= 4 && styles.contentCentered,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {subjects.map((item, index) => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [
            styles.subjectCard,
            pressed && styles.subjectCardPressed,
          ]}
          onPress={() =>
            navigation.navigate("EnrollSubjects", {
              grade: gradeLabel,
              gradeNumber,
              subjectName: item.label,
            })
          }
        >
          <SubjectArt index={index} />

          <View style={styles.textSection}>
            <Text style={[styles.gradeText, lang === "si" && sinFont("bold")]}>
              {gradeTitle}
            </Text>
            <Text style={styles.subjectText} numberOfLines={2}>
              {item.label}
            </Text>
          </View>

          <View style={styles.arrowWrap}>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </Pressable>
      ))}

      {subjects.length === 0 && (
        <View style={styles.centerState}>
          <Ionicons name="folder-open-outline" size={34} color="#64748B" />
          <Text style={styles.stateTitle}>No subjects found</Text>
          <Text style={styles.stateText}>
            No subjects are available for this grade yet.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },

  contentCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },

  subjectCard: {
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  subjectCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.97,
  },

  artWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },

  blobA: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 12,
    top: 8,
    left: 8,
    opacity: 0.9,
  },

  blobB: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 10,
    bottom: 8,
    right: 8,
    opacity: 0.9,
  },

  mainIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  dotPurple: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#A855F7",
  },

  dotYellow: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
  },

  textSection: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 8,
  },

  gradeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },

  subjectText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
  },

  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: BG,
  },

  stateTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  stateText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },

  retryBtn: {
    marginTop: 14,
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});