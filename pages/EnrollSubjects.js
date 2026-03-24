import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useGetClassesByGradeAndSubjectQuery } from "../app/classApi";
import {
  useGetMyEnrollRequestsQuery,
  useRequestEnrollMutation,
} from "../app/enrollApi";
import ClassEnrollCard from "../components/ClassEnrollCard";
import useT from "../app/i18n/useT";

const SL_PHONE_REGEX = /^(?:\+94|0)?7\d{8}$/;

const numberFromGrade = (gradeLabel) => {
  if (!gradeLabel) return null;
  const match = String(gradeLabel).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

const normalizePhone = (value) => {
  const raw = String(value || "").replace(/\s+/g, "");
  if (!raw) return "";

  if (raw.startsWith("+94")) return raw;
  if (raw.startsWith("94")) return `+${raw}`;
  if (raw.startsWith("0")) return `+94${raw.slice(1)}`;
  return raw;
};

const digitsOnly = (value) => String(value || "").replace(/\D+/g, "");

const isValidSriLankaMobile = (value) => {
  const raw = String(value || "").replace(/\s+/g, "");
  return SL_PHONE_REGEX.test(raw);
};

export default function EnrollSubjects({ route }) {
  const navigation = useNavigation();
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [modalError, setModalError] = useState("");

  const gradeLabel = route?.params?.grade || "A/L";
  const gradeNumberParam = route?.params?.gradeNumber;
  const subjectName = route?.params?.subjectName || "";
  const streamName = route?.params?.streamName || "";

  const gradeNo = useMemo(
    () =>
      Number.isFinite(Number(gradeNumberParam))
        ? Number(gradeNumberParam)
        : numberFromGrade(gradeLabel),
    [gradeNumberParam, gradeLabel]
  );

  const {
    data: classes = [],
    isLoading,
    isError,
    refetch,
  } = useGetClassesByGradeAndSubjectQuery(
    {
      gradeNumber: gradeNo || "",
      subjectName,
      streamName,
    },
    { skip: !gradeNo && !streamName }
  );

  const {
    data: myReqData,
    isLoading: myReqLoading,
    refetch: refetchMyReq,
  } = useGetMyEnrollRequestsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch?.();
      refetchMyReq?.();
    }, [refetch, refetchMyReq])
  );

  const myReqMap = useMemo(() => {
    const map = {};
    const list = Array.isArray(myReqData?.requests) ? myReqData.requests : [];

    for (const r of list) {
      const classId = String(
        r?.classId || r?.classDetails?._id || r?.classDetails?.classId || ""
      );
      if (classId) map[classId] = r;
    }

    return map;
  }, [myReqData]);

  const [requestEnroll, { isLoading: submitting }] = useRequestEnrollMutation();

  const openModal = (cls) => {
    setSelectedClass(cls);
    setStudentName("");
    setStudentPhone("");
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClass(null);
    setStudentName("");
    setStudentPhone("");
    setModalError("");
  };

  const submitEnroll = async () => {
    try {
      setModalError("");

      if (!selectedClass?._id) return;

      if (!studentName.trim() || !studentPhone.trim()) {
        setModalError(t("pleaseEnterDataMsg"));
        return;
      }

      if (!isValidSriLankaMobile(studentPhone)) {
        setModalError(t("invalidPhoneNumberMsg"));
        return;
      }

      await requestEnroll({
        classId: selectedClass._id,
        studentName: studentName.trim(),
        studentPhone: normalizePhone(studentPhone),
      }).unwrap();

      closeModal();
      refetchMyReq?.();
      refetch?.();
    } catch (e) {
      setModalError(String(e?.data?.message || e?.error || "Request failed"));
    }
  };

  const goDemoLesson = (cls) => {
    const req = myReqMap[String(cls?._id)];
    const status = String(req?.status || "").toLowerCase();

    navigation.navigate("Lessons", {
      classId: cls._id,
      className: cls.className,
      grade: gradeLabel,
      gradeNumber: gradeNo || "",
      subject: cls?.subjectName || subjectName || "",
      teacher: Array.isArray(cls?.teachers)
        ? cls.teachers.map((t) => t?.name).filter(Boolean).join(", ")
        : "",
      streamName: streamName || cls?.streamName || "",
      batchNumber: cls?.batchNumber || cls?.batch || "",
      enrollStatus: status,
      demoOnly: true,
    });
  };

  const goFullLessons = (cls) => {
    const req = myReqMap[String(cls?._id)];
    const status = String(req?.status || "").toLowerCase();

    navigation.navigate("Lessons", {
      classId: cls._id,
      className: cls.className,
      grade: gradeLabel,
      gradeNumber: gradeNo || "",
      subject: cls?.subjectName || subjectName || "",
      teacher: Array.isArray(cls?.teachers)
        ? cls.teachers.map((t) => t?.name).filter(Boolean).join(", ")
        : "",
      streamName: streamName || cls?.streamName || "",
      batchNumber: cls?.batchNumber || cls?.batch || "",
      enrollStatus: status,
      demoOnly: false,
    });
  };

  return (
    <View style={styles.screen}>
      {isLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color="#214294" />
          <Text style={[styles.infoText, isSi ? sinFont("regular") : null]}>
            {t("loadingReviewLbl")}
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errTitle}>Failed to load classes</Text>
          <Pressable
            onPress={() => {
              refetch?.();
              refetchMyReq?.();
            }}
            style={styles.retryWrap}
          >
            <Text style={styles.tryAgain}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {classes.map((c, index) => {
            const req = myReqMap[String(c._id)];
            const status = String(req?.status || "").toLowerCase();

            const teacherNames = Array.isArray(c?.teachers)
              ? c.teachers.map((t) => t?.name).filter(Boolean).join(", ")
              : "";

            const normalizedItem = {
              ...c,
              className: c?.className || "Class",
              teacherName: teacherNames,
              teacher: teacherNames,
              image: c?.imageUrl || c?.image || "",
              imageUrl: c?.imageUrl || c?.image || "",
              batchNumber: c?.batchNumber || c?.batch || "",
            };

            return (
              <ClassEnrollCard
                key={c._id || String(index)}
                item={normalizedItem}
                status={
                  status === "approved"
                    ? "approved"
                    : status === "pending"
                    ? "pending"
                    : ""
                }
                onPressDemo={() => goDemoLesson(c)}
                onPressView={() => goFullLessons(c)}
                onPressEnroll={() => openModal(c)}
              />
            );
          })}

          {classes.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No classes available</Text>
              <Text style={styles.centerInfo}>
                No classes available for this selection.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enroll Request</Text>

            {!!selectedClass?.className && (
              <Text style={styles.modalClassText}>{selectedClass.className}</Text>
            )}

            {!!selectedClass?.batchNumber && (
              <Text style={styles.modalBatchText}>
                {`Batch ${selectedClass.batchNumber}`}
              </Text>
            )}

            <Text style={[styles.helpText, isSi ? sinFont("regular") : null]}>
              {t("enrollHelpText")}
            </Text>

            {!!modalError && (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, isSi ? sinFont("regular") : null]}>
                  {modalError}
                </Text>
              </View>
            )}

            <Text style={[styles.fieldLabel, isSi ? sinFont("regular") : null]}>
              {t("studentNamePlaceholder")}
            </Text>
            <TextInput
              value={studentName}
              onChangeText={(value) => {
                setStudentName(value);
                if (modalError) setModalError("");
              }}
              placeholder=""
              placeholderTextColor="#94A3B8"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={[styles.fieldLabel, isSi ? sinFont("regular") : null]}>
              {t("mobileNumberPlaceholder")}
            </Text>
            <TextInput
              value={studentPhone}
              onChangeText={(value) => {
                setStudentPhone(digitsOnly(value));
                if (modalError) setModalError("");
              }}
              placeholder=""
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              style={styles.input}
              maxLength={12}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                onPress={closeModal}
                style={[styles.modalBtn, styles.cancelBtn]}
                activeOpacity={0.9}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitEnroll}
                style={[styles.modalBtn, styles.submitBtn]}
                activeOpacity={0.9}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>

            {myReqLoading && (
              <Text style={[styles.syncText, isSi ? sinFont("regular") : null]}>
                {t("loadingReviewLbl")}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },

  retryWrap: {
    marginTop: 12,
    backgroundColor: "#EAF1FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E5FF",
  },

  scrollContent: {
    paddingBottom: 22,
  },

  infoText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "700",
    fontSize: 13,
  },

  errTitle: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 15,
  },

  tryAgain: {
    color: "#214294",
    fontWeight: "800",
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  centerInfo: {
    textAlign: "center",
    color: "#64748B",
    fontWeight: "500",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.34)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  modalClassText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#214294",
    textAlign: "center",
  },

  modalBatchText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  helpText: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  errorBox: {
    marginTop: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D6DEE8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontWeight: "500",
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },

  modalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },

  modalBtn: {
    minWidth: 104,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  submitBtn: {
    backgroundColor: "#214294",
  },

  cancelBtnText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 14,
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  syncText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "500",
    fontSize: 12,
    textAlign: "center",
  },
});