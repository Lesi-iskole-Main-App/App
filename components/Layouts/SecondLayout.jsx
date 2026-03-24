// Layouts/SecondLayout.js
import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import BottomNavigationBar from "../components/BottomNavigationBar";
import TopBar from "../components/TopBar";

export default function SecondLayout({ children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TopBar />

        {/* Screen Content */}
        <View style={styles.content}>{children}</View>

        {/* Bottom Navigation */}
        <View style={styles.bottomBarWrap}>
          <BottomNavigationBar />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flex: 1,
    minHeight: 0,
  },

  bottomBarWrap: {
    backgroundColor: "#F8FAFC",
  },
});