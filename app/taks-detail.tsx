import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCheck,
  Paperclip,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

type SubTask = {
  id: string;
  title: string;
  done: boolean;
  hasAttachment?: boolean;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  time: string;
  category?: string;
  priority: "high" | "steady" | "low";
  done: boolean;
  date: string;
  projectScope?: string;
  subtasks?: SubTask[];
  collaborators?: string[];
  imageUri?: string;
};

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTask();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        loadTask();
      }
    }, [id]),
  );

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const data = await AsyncStorage.getItem("tasks");
      console.log("📦 Data from storage:", data);

      if (data) {
        const tasks: Task[] = JSON.parse(data);
        console.log("📋 All tasks:", tasks);
        console.log("🔍 Looking for task with id:", id);

        const found = tasks.find((t) => t.id === id);
        console.log("✅ Found task:", found);

        if (found) {
          setTask(found);
          setSubtasks(
            found.subtasks && found.subtasks.length > 0
              ? found.subtasks
              : [
                  {
                    id: "st1",
                    title: "Audit existing color palette tokens",
                    done: true,
                  },
                  {
                    id: "st2",
                    title: 'Draft "No-Line" rule documentation',
                    done: false,
                    hasAttachment: true,
                  },
                  {
                    id: "st3",
                    title: "Test typography scale in mobile viewports",
                    done: false,
                  },
                ],
          );
        } else {
          console.log("❌ Task not found with id:", id);
        }
      } else {
        console.log("📭 No data in storage");
      }
    } catch (e) {
      console.log("loadTask error:", e);
      Alert.alert("Error", "Gagal memuat task");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubtask = async (stId: string) => {
    const updated = subtasks.map((s) =>
      s.id === stId ? { ...s, done: !s.done } : s,
    );
    setSubtasks(updated);
    try {
      const data = await AsyncStorage.getItem("tasks");
      if (data && task) {
        const tasks: Task[] = JSON.parse(data);
        const newTasks = tasks.map((t) =>
          t.id === task.id ? { ...t, subtasks: updated } : t,
        );
        await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
      }
    } catch (e) {
      console.log("toggleSubtask error:", e);
    }
  };

  const markComplete = async () => {
    if (!task) return;
    try {
      const data = await AsyncStorage.getItem("tasks");
      if (data) {
        const tasks: Task[] = JSON.parse(data);
        const newTasks = tasks.map((t) =>
          t.id === task.id ? { ...t, done: true, subtasks: subtasks } : t,
        );
        await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
        setTask({ ...task, done: true });
        router.back();
      }
    } catch (e) {
      console.log("markComplete error:", e);
      Alert.alert("Error", "Gagal menyimpan task");
    }
  };

  // ✅ FUNGSI DELETE TASK - FIXED TypeScript error
  const deleteTask = () => {
    if (!task) {
      Alert.alert("Error", "Task tidak ditemukan");
      return;
    }

    if (isDeleting) return;

    Alert.alert("Hapus Task", `Hapus "${task.title}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            const data = await AsyncStorage.getItem("tasks");

            if (data) {
              const semuaTasks: Task[] = JSON.parse(data);
              const tasksSetelahHapus = semuaTasks.filter(
                (t) => t.id !== task.id,
              );
              await AsyncStorage.setItem(
                "tasks",
                JSON.stringify(tasksSetelahHapus),
              );
              router.back();
            } else {
              router.back();
            }
          } catch (error: any) {
            // ✅ Perbaikan: menggunakan type 'any'
            console.error("Error detail:", error);
            Alert.alert(
              "Error",
              `Gagal menghapus: ${error?.message || "Terjadi kesalahan"}`,
            );
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBack = () => {
    if (!isDeleting) router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F5F5F7",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 12, color: "#888" }}>Memuat task...</Text>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F5F5F7",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
        <Text
          style={{
            color: "#1a1a1a",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Task tidak ditemukan
        </Text>
        <Text
          style={{
            color: "#aaa",
            fontSize: 13,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          ID: {id ?? "tidak ada"}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          style={{
            backgroundColor: "#6C63FF",
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            ← Kembali
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: "#F5F5F7",
          borderBottomWidth: 1,
          borderBottomColor: "#E8E8F0",
        }}
      >
        <TouchableOpacity onPress={handleBack} disabled={isDeleting}>
          <ArrowLeft size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a1a1a" }}>
          Kinetic Flow
        </Text>
        <TouchableOpacity>
          <Pencil size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          {/* Badges */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {task.priority === "high" && (
              <View
                style={{
                  backgroundColor: "#FFD6F5",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#D63AF9" }}
                >
                  HIGH PRIORITY
                </Text>
              </View>
            )}
            {task.category && (
              <View
                style={{
                  backgroundColor: "#E8E8F0",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#555" }}
                >
                  {task.category.toUpperCase()}
                </Text>
              </View>
            )}
            {task.done && (
              <View
                style={{
                  backgroundColor: "#D6FFE8",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#1A9E5A" }}
                >
                  SELESAI ✓
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: "#1a1a1a",
              lineHeight: 36,
              marginBottom: 16,
              textDecorationLine: task.done ? "line-through" : "none",
            }}
          >
            {task.title}
          </Text>

          {/* Date & Time */}
          <View style={{ flexDirection: "row", gap: 20, marginBottom: 28 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Calendar size={15} color="#888" />
              <Text style={{ fontSize: 13, color: "#888" }}>
                {formatDate(task.date)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Clock size={15} color="#888" />
              <Text style={{ fontSize: 13, color: "#888" }}>{task.time}</Text>
            </View>
          </View>

          {/* Description */}
          {task.description && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#aaa",
                  letterSpacing: 1.5,
                  marginBottom: 10,
                }}
              >
                PROJECT SCOPE
              </Text>
              <Text style={{ fontSize: 15, color: "#444", lineHeight: 24 }}>
                {task.description}
              </Text>
            </View>
          )}

          {/* Subtasks */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#aaa",
                letterSpacing: 1.5,
                marginBottom: 14,
              }}
            >
              EXECUTION ROADMAP
            </Text>
            {subtasks.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                onPress={() => toggleSubtask(sub.id)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: sub.done ? "#6C63FF" : "#ccc",
                      backgroundColor: sub.done ? "#6C63FF" : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    {sub.done && (
                      <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: sub.done ? "#aaa" : "#1a1a1a",
                      textDecorationLine: sub.done ? "line-through" : "none",
                      flex: 1,
                    }}
                  >
                    {sub.title}
                  </Text>
                </View>
                {sub.hasAttachment && <Paperclip size={16} color="#6C63FF" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <Plus size={16} color="#6C63FF" />
              <Text
                style={{ fontSize: 14, color: "#6C63FF", fontWeight: "600" }}
              >
                Add Subtask
              </Text>
            </TouchableOpacity>
          </View>

          {/* Collaborators */}
          <View
            style={{
              backgroundColor: "#EBEBF0",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#aaa",
                letterSpacing: 1.5,
                marginBottom: 12,
              }}
            >
              COLLABORATORS
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#c5c5d0",
                    borderWidth: 2,
                    borderColor: "#EBEBF0",
                    marginRight: -8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
              ))}
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#6C63FF",
                  borderWidth: 2,
                  borderColor: "#EBEBF0",
                  marginLeft: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 12, color: "#fff", fontWeight: "700" }}
                >
                  +4
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 32,
          paddingTop: 16,
          backgroundColor: "#F5F5F7",
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: "#E8E8F0",
        }}
      >
        {/* Mark Complete */}
        <TouchableOpacity
          onPress={markComplete}
          disabled={task.done || isDeleting}
          style={{
            flex: 1,
            backgroundColor: task.done ? "#4CAF50" : "#6C63FF",
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            shadowColor: task.done ? "#4CAF50" : "#6C63FF",
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            opacity: task.done || isDeleting ? 0.75 : 1,
          }}
        >
          <CheckCheck size={20} color="#fff" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
            {task.done ? "Selesai ✓" : "Mark as Complete"}
          </Text>
        </TouchableOpacity>

        {/* Tombol Hapus */}
        <TouchableOpacity
          onPress={deleteTask}
          disabled={isDeleting}
          activeOpacity={0.7}
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#FF5252",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
            opacity: isDeleting ? 0.5 : 1,
            borderWidth: 1,
            borderColor: "#FFE5E5",
          }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FF5252" />
          ) : (
            <Trash2 size={20} color="#FF5252" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
