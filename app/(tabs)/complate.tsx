import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings } from "lucide-react-native";
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
  duration?: string;
};

type GroupedTasks = {
  label: string;
  dateStr: string;
  tasks: Task[];
};

// ✅ Tambahkan komponen TopAppBar di sini
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
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#F0F0F5",
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

export default function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  // ✅ Fungsi handleSettings
  const handleSettings = () => {
    console.log("Settings pressed!");
    // Bisa ditambahkan navigasi ke halaman settings
    // router.push("/settings");
  };

  useFocusEffect(
    useCallback(() => {
      loadCompleted();
    }, []),
  );

  const loadCompleted = async () => {
    try {
      const data = await AsyncStorage.getItem("tasks");
      if (data) {
        const tasks: Task[] = JSON.parse(data);
        const done = tasks.filter((t) => t.done);
        setCompletedTasks(done);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const formatDateLabel = (dateStr: string): string => {
    const hariIni = new Date().toISOString().split("T")[0];
    const kemarin = new Date();
    kemarin.setDate(kemarin.getDate() - 1);
    const kemarinStr = kemarin.toISOString().split("T")[0];

    if (dateStr === hariIni) return "Today";
    if (dateStr === kemarinStr) return "Yesterday";

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDateFull = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group by date
  const grouped: GroupedTasks[] = [];
  const seen: Record<string, boolean> = {};
  completedTasks.forEach((t) => {
    if (!seen[t.date]) {
      seen[t.date] = true;
      grouped.push({
        label: formatDateLabel(t.date),
        dateStr: t.date,
        tasks: completedTasks.filter((x) => x.date === t.date),
      });
    }
  });
  grouped.sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  // Streak & velocity (dihitung dari data real)
  const streak = hitungStreak(completedTasks);
  const velocity =
    completedTasks.length > 0
      ? (completedTasks.length / Math.max(grouped.length, 1)).toFixed(1)
      : "0.0";

  // Fungsi hitung streak
  function hitungStreak(tasks: Task[]): number {
    if (tasks.length === 0) return 0;

    const uniqueDates = [...new Set(tasks.map((t) => t.date))];
    uniqueDates.sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let currentDate = new Date(today);

    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F0F5" }}>
      {/* Header */}
      <TopAppBar title="Kinetic Flow" onPressSettings={handleSettings} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 20 }}
      >
        {/* Title */}
        <View style={{ marginTop: 20, marginBottom: 6 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#6C63FF",
              letterSpacing: 1.5,
            }}
          >
            TASK HISTORY
          </Text>
          <Text
            style={{
              fontSize: 42,
              fontWeight: "800",
              color: "#1a1a1a",
              marginTop: 4,
            }}
          >
            Completed
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 2,
                backgroundColor: "#ddd",
                marginRight: 12,
              }}
            />
            <Text style={{ fontSize: 13, color: "#888", fontWeight: "500" }}>
              {completedTasks.length} Tasks Finished
            </Text>
          </View>
        </View>

        {/* Grouped Tasks */}
        {grouped.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 16, color: "#ccc" }}>
              Belum ada task selesai 🎯
            </Text>
          </View>
        )}

        {grouped.map((group) => (
          <View key={group.dateStr} style={{ marginBottom: 28 }}>
            {/* Group Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: "#1a1a1a" }}
              >
                {group.label}
              </Text>
              <Text style={{ fontSize: 13, color: "#aaa" }}>
                {formatDateFull(group.dateStr)}
              </Text>
            </View>

            {/* Task Cards */}
            {group.tasks.map((task, i) => (
              <TouchableOpacity
                key={task.id || i}
                onPress={() =>
                  router.push({
                    pathname: "/taks-detail" as any,
                    params: { id: task.id },
                  })
                }
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }}
              >
                {/* Done circle */}
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#6C63FF",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 14,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                  >
                    ✓
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#aaa",
                      textDecorationLine: "line-through",
                      marginBottom: 4,
                    }}
                  >
                    {task.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {task.category && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#bbb",
                          letterSpacing: 0.5,
                        }}
                      >
                        {task.category.toUpperCase()}
                      </Text>
                    )}
                    {task.duration && (
                      <>
                        <Text style={{ fontSize: 11, color: "#ccc" }}>•</Text>
                        <Text style={{ fontSize: 11, color: "#bbb" }}>
                          {task.duration}
                        </Text>
                      </>
                    )}
                    {/* High priority badge kecil */}
                    {task.priority === "high" && (
                      <View
                        style={{
                          backgroundColor: "#FFD6F5",
                          borderRadius: 20,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          marginLeft: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "700",
                            color: "#D63AF9",
                          }}
                        >
                          HIGH PRIORITY
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Efficiency Report Card */}
        {completedTasks.length > 0 && (
          <View
            style={{
              backgroundColor: "#5B52E8",
              borderRadius: 24,
              padding: 24,
              marginBottom: 40,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              EFFICIENCY REPORT
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: "#fff",
                lineHeight: 34,
                marginBottom: 20,
              }}
            >
              You're {Math.min(99, Math.floor(parseFloat(velocity) * 5))}% more
              productive than last week.
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Streak */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: 1.2,
                    marginBottom: 8,
                  }}
                >
                  STREAK
                </Text>
                <Text
                  style={{ fontSize: 32, fontWeight: "800", color: "#fff" }}
                >
                  {streak}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                    marginTop: 2,
                  }}
                >
                  Days
                </Text>
              </View>

              {/* Velocity */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: 1.2,
                    marginBottom: 8,
                  }}
                >
                  VELOCITY
                </Text>
                <Text
                  style={{ fontSize: 32, fontWeight: "800", color: "#fff" }}
                >
                  {velocity}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                    marginTop: 2,
                  }}
                >
                  Tasks/Day
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
