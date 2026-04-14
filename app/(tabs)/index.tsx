import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Calendar, Plus, Settings } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

type Task = {
  id: string;
  title: string;
  description?: string;
  time: string;
  category?: string;
  priority: "high" | "steady" | "low";
  done: boolean;
  date: string;
};

// Komponen TopAppBar sederhana (karena module tidak ditemukan)
const TopAppBar = ({
  title,
  onPressSettings,
}: {
  title: string;
  onPressSettings: () => void;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1a1a1a" }}>
        {title}
      </Text>
      <TouchableOpacity onPress={onPressSettings}>
        <Settings size={24} color="#1a1a1a" />
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalSelesaiHariIni, setTotalSelesaiHariIni] = useState(0);

  const handleSettings = () => {
    console.log("Settings pressed!");
  };

  useFocusEffect(
    useCallback(() => {
      ambilData();
    }, []),
  );

  const ambilData = async () => {
    try {
      const data = await AsyncStorage.getItem("tasks");
      if (data) {
        const semua = JSON.parse(data) as Task[];
        const hariIni = new Date().toISOString().split("T")[0];
        // Hitung yang selesai dari data asli sebelum difilter
        const selesaiHariIni = semua.filter(
          (t) => t.date === hariIni && t.done,
        ).length;
        setTotalSelesaiHariIni(selesaiHariIni);
        // Index hanya tampilkan task yang belum selesai
        setTasks(semua.filter((t) => !t.done));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hariIni = new Date().toISOString().split("T")[0];
  const taskHariIni = tasks.filter((t) => t.date === hariIni);
  const totalTask = taskHariIni.length + totalSelesaiHariIni; // total asli termasuk yang done
  const taskSelesai = totalSelesaiHariIni; // dari state terpisah
  const persen =
    totalTask === 0 ? 0 : Math.round((taskSelesai / totalTask) * 100);
  const taskUpcoming = tasks.filter((t) => t.date > hariIni);

  const formatTanggal = (dateStr: string) => {
    const besok = new Date();
    besok.setDate(besok.getDate() + 1);
    const besokStr = besok.toISOString().split("T")[0];
    if (dateStr === besokStr) return "BESOK";
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .toUpperCase();
  };

  const bukaDetail = (id: string) => {
    router.push(`/taks-detail?id=${id}` as any);
  };

  const tandaiSelesai = async (id: string) => {
    // Ambil data terbaru dari storage
    const data = await AsyncStorage.getItem("tasks");
    if (data) {
      const semuaTasks: Task[] = JSON.parse(data);
      const taskBaru = semuaTasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      );
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(taskBaru));
        // Update counter selesai hari ini
        const selesaiHariIni = taskBaru.filter(
          (t) => t.date === hariIni && t.done,
        ).length;
        setTotalSelesaiHariIni(selesaiHariIni);
        // Tampilan index hanya yang belum selesai
        setTasks(taskBaru.filter((t) => !t.done));
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 20 }}
      >
        <TopAppBar title="Kinetic Flow" onPressSettings={handleSettings} />

        {/* Daily Momentum */}
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text style={{ color: "#aaa", fontSize: 12, letterSpacing: 1.5 }}>
            DAILY MOMENTUM
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
          >
            <Text style={{ fontSize: 64, fontWeight: "800", color: "#1a1a1a" }}>
              {persen}%
            </Text>
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#6C63FF" }}
              >
                {persen === 100
                  ? "Selesai!"
                  : persen > 0
                    ? "Focusing"
                    : "Belum Ada Task"}
              </Text>
              <Text style={{ fontSize: 13, color: "#888" }}>
                {totalTask === 0
                  ? "Tidak ada task hari ini"
                  : `${taskSelesai} dari ${totalTask} task selesai`}
              </Text>
            </View>
          </View>
        </View>

        {/* Today Section */}
        {taskHariIni.length > 0 && (
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "600", color: "#888" }}>
                Today
              </Text>
              <View
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#555" }}
                >
                  {totalTask} TASKS
                </Text>
              </View>
            </View>

            {taskHariIni.map((task, i) => (
              <TouchableOpacity
                key={task.id || i}
                onPress={() => bukaDetail(task.id)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                {task.priority === "high" && (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "#FFD6F5",
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: "#D63AF9",
                      }}
                    >
                      HIGH PRIORITY
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      tandaiSelesai(task.id);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: task.done ? "#6C63FF" : "#ccc",
                        backgroundColor: task.done ? "#6C63FF" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {task.done && (
                        <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: task.done ? "#aaa" : "#1a1a1a",
                        textDecorationLine: task.done ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 4,
                        gap: 4,
                      }}
                    >
                      <Clock size={12} color="#888" />
                      <Text style={{ fontSize: 12, color: "#888" }}>
                        {task.time}
                      </Text>
                      {task.category && (
                        <>
                          <View
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "#ccc",
                              marginHorizontal: 4,
                            }}
                          />
                          <Text style={{ fontSize: 12, color: "#888" }}>
                            {task.category}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Section */}
        {taskUpcoming.length > 0 && (
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#888",
                marginBottom: 12,
                marginTop: 10,
              }}
            >
              Upcoming
            </Text>

            {taskUpcoming.map((task, i) => (
              <TouchableOpacity
                key={task.id || i}
                onPress={() => bukaDetail(task.id)}
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#888",
                      letterSpacing: 1,
                    }}
                  >
                    {formatTanggal(task.date)}
                  </Text>
                  <Calendar size={18} color="#6C63FF" />
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: "#1a1a1a",
                    marginBottom: 4,
                  }}
                >
                  {task.title}
                </Text>
                {task.description && (
                  <Text style={{ fontSize: 13, color: "#888" }}>
                    {task.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {totalTask === 0 && taskUpcoming.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Text style={{ fontSize: 16, color: "#ccc" }}>
              Belum ada task 😴
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push("./explore")}
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          backgroundColor: "#6C63FF",
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
          shadowColor: "#6C63FF",
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
