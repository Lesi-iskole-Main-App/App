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

const numberFromGrade = (gradeLabel) => {
  if (!gradeLabel) return null;
  const match = String(gradeLabel).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

export default function EnrollSubjects({ route }) {
  const navigation = useNavigation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

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

  const shouldSkipClasses = !gradeNo && !String(streamName || "").trim();

  const {
    data: classes = [],
    isLoading,
    isError,
    refetch,
  } = useGetClassesByGradeAndSubjectQuery(
    {
      gradeNumber: gradeNo || null,
      subjectName,
      streamName,
    },
    { skip: shouldSkipClasses }
  );

  const {
    data: myReqData,
    isLoading: myReqLoading,
    refetch: refetchMyReq,
  } = useGetMyEnrollRequestsQuery();

  useFocusEffect(
    useCallback(() => {
      if (!shouldSkipClasses) refetch?.();
      refetchMyReq?.();
    }, [shouldSkipClasses, refetch, refetchMyReq])
  );

  const myReqMap = useMemo(() => {
    const map = {};
    const list = myReqData?.requests || [];
    for (const r of list) {
      const classId = String(r?.classId || r?.classDetails?.classId || "");
      if (classId) map[classId] = r;
    }
    return map;
  }, [myReqData]);

  const [requestEnroll, { isLoading: submitting }] = useRequestEnrollMutation();

  const openModal = (cls) => {
    setSelectedClass(cls);
    setStudentName("");
    setStudentPhone("");
    setModalOpen(true);
  };

  const submitEnroll = async () => {
    try {
      if (!selectedClass?._id) return;
      if (!studentName.trim()) return alert("Enter student name");
      if (!studentPhone.trim()) return alert("Enter phone number");

      await requestEnroll({
        classId: selectedClass._id,
        studentName: studentName.trim(),
        studentPhone: studentPhone.trim(),
      }).unwrap();

      setModalOpen(false);
      setSelectedClass(null);
      refetchMyReq?.();
      refetch?.();
      alert("Request sent!");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Request failed"));
    }
  };

  const goDemoLesson = (cls) => {
    const req = myReqMap[String(cls?._id)];
    const status = String(req?.status || "").toLowerCase();

    navigation.navigate("Lessons", {
      classId: cls._id,
      className: cls.className,
      grade: gradeLabel,
      subject: cls?.subjectName || subjectName || "",
      teacher: "",
      streamName: streamName || "",
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
      subject: cls?.subjectName || subjectName || "",
      teacher: "",
      streamName: streamName || "",
      enrollStatus: status,
      demoOnly: false,
    });
  };

  const shouldCenterCards =
    Array.isArray(classes) && classes.length > 0 && classes.length <= 3;

  return (
    <View style={styles.screen}>
      {isLoading ? (
        <View style={styles.stateWrap}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color="#214294" />
          </View>
          <Text style={styles.infoText}>Loading classes...</Text>
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
          contentContainerStyle={[
            styles.scrollContent,
            shouldCenterCards && styles.scrollCentered,
          ]}
        >
          {classes.map((c, index) => {
            const req = myReqMap[String(c._id)];
            const status = req?.status || "";

            const normalizedItem = {
              ...c,
              className: c?.className || "Class",
              teacherName: "",
              teacher: "",
              image: c?.imageUrl || "",
              imageUrl: c?.imageUrl || "",
            };

            return (
              <ClassEnrollCard
                key={c._id}
                item={normalizedItem}
                index={index}
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
                {streamName
                  ? `No classes available for ${streamName}.`
                  : gradeNo
                  ? "No classes available for this grade."
                  : "No classes available."}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>Enroll</Text>
            </View>

            <Text style={styles.modalTitle}>Enroll Request</Text>

            <Text style={styles.modalText}>
              Send a request to join this class.
            </Text>

            {!!selectedClass?.className && (
              <Text style={styles.modalClassText}>{selectedClass.className}</Text>
            )}

            <TextInput
              value={studentName}
              onChangeText={setStudentName}
              placeholder="Student Name"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <TextInput
              value={studentPhone}
              onChangeText={setStudentPhone}
              placeholder="Phone Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                onPress={() => setModalOpen(false)}
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
              <Text style={styles.syncText}>Syncing status...</Text>
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

  loaderBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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

  scrollCentered: {
    flexGrow: 1,
    justifyContent: "center",
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
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  modalBadge: {
    alignSelf: "center",
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },

  modalBadgeText: {
    color: "#214294",
    fontSize: 11,
    fontWeight: "700",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  modalText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  modalClassText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#214294",
    textAlign: "center",
    lineHeight: 20,
  },

  input: {
    marginTop: 12,
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