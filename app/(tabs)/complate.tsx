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

export default function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

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

  // Streak & velocity mock (bisa dihitung dari data nyata)
  const streak = 12;
  const velocity =
    completedTasks.length > 0
      ? (completedTasks.length / Math.max(grouped.length, 1)).toFixed(1)
      : "0.0";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F0F5" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#c5c5d0",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a" }}>
            Kinetic Flow
          </Text>
        </View>
        <TouchableOpacity>
          <Settings size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

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
            You're 15% more productive than last week.
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
              <Text style={{ fontSize: 32, fontWeight: "800", color: "#fff" }}>
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
              <Text style={{ fontSize: 32, fontWeight: "800", color: "#fff" }}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
