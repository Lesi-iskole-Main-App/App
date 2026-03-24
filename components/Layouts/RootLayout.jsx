import React from "react";
import { View, StyleSheet } from "react-native";

const RootLayout = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // ✅ white background
  },
});

export default RootLayout;
