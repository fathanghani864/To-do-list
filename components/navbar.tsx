import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Settings } from "lucide-react-native";

interface TopAppBarProps {
  title?: string;
  userImage?: string;
  onPressSettings?: () => void;
}

export const TopAppBar = ({
  title = "Kinetic Flow",
  userImage = "https://via.placeholder.com/150", // Ganti dengan path lokal atau URL asli
  onPressSettings,
}: TopAppBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Avatar Image */}
        <Image source={{ uri: userImage }} style={styles.avatar} />
        {/* Title */}
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Settings Button */}
      <TouchableOpacity onPress={onPressSettings} activeOpacity={0.7}>
        <Settings size={28} color="#4A4A4A" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F8F9FA", // Background abu-abu tipis sesuai gambar
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#333",
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
});
