import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "steady" | "low">("steady");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fungsi format date yang benar (pakai local time)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // generate hari dalam bulan
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startIndex = firstDay === 0 ? 6 : firstDay - 1; // Senin = 0
    const days: (number | null)[] = Array(startIndex).fill(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const monthName = currentMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // simpan task ke AsyncStorage
  const simpanTask = async () => {
    if (!title.trim()) {
      alert("Judul task tidak boleh kosong!");
      return;
    }

    const taskBaru: Task = {
      id: Date.now().toString(),
      title,
      description,
      time: selectedDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      priority,
      done: false,
      date: formatDate(selectedDate),
    };

    try {
      const existing = await AsyncStorage.getItem("tasks");
      const tasks: Task[] = existing ? JSON.parse(existing) : [];
      tasks.push(taskBaru);
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      router.back(); // balik ke halaman Main
    } catch (error) {
      console.log(error);
      alert("Gagal menyimpan task");
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f8" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}>
          New Task
        </Text>
        <TouchableOpacity onPress={simpanTask}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#6C63FF" }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#6C63FF",
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            TASK CREATION
          </Text>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: "#1a1a1a",
              lineHeight: 44,
            }}
          >
            Define your{"\n"}next move.
          </Text>
        </View>

        {/* Input Judul */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#aaa",
              letterSpacing: 1.2,
              marginBottom: 8,
            }}
          >
            THE OBJECTIVE
          </Text>
          <TextInput
            style={{
              backgroundColor: "#e8eaf0",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              color: "#1a1a1a",
            }}
            placeholder="What needs to be done?"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Input Deskripsi */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#aaa",
              letterSpacing: 1.2,
              marginBottom: 8,
            }}
          >
            CONTEXT & DETAILS
          </Text>
          <TextInput
            style={{
              backgroundColor: "#e8eaf0",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              color: "#1a1a1a",
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="Add any specific requirements or links..."
            placeholderTextColor="#bbb"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Kalender */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            marginHorizontal: 20,
            marginBottom: 16,
          }}
        >
          {/* header kalender */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: "#e8e6ff",
                borderRadius: 10,
                padding: 8,
              }}
            >
              <Calendar size={18} color="#6C63FF" />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#aaa",
                letterSpacing: 1.5,
              }}
            >
              TIMELINE
            </Text>
          </View>

          {/* navigasi bulan */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity onPress={prevMonth}>
              <ChevronLeft size={20} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1a1a1a" }}>
              {monthName}
            </Text>
            <TouchableOpacity onPress={nextMonth}>
              <ChevronRight size={20} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {/* label hari */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {DAYS.map((d, i) => (
              <Text
                key={i}
                style={{
                  width: "14.28%",
                  textAlign: "center",
                  fontSize: 12,
                  color: "#aaa",
                  fontWeight: "600",
                  marginBottom: 6,
                }}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* angka hari */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {days.map((day, i) => {
              if (!day)
                return (
                  <View
                    key={i}
                    style={{ width: "14.28%", paddingVertical: 6 }}
                  />
                );

              const dateObj = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day,
              );
              const isSelected =
                formatDate(dateObj) === formatDate(selectedDate);

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedDate(dateObj)}
                  style={{
                    width: "14.28%",
                    alignItems: "center",
                    paddingVertical: 6,
                    backgroundColor: isSelected ? "#6C63FF" : "transparent",
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isSelected ? "#fff" : "#1a1a1a",
                      fontWeight: isSelected ? "700" : "400",
                    }}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Intensity / Priority */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            marginHorizontal: 20,
            marginBottom: 16,
          }}
        >
          {/* header intensity */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: "#FFD6F5",
                borderRadius: 10,
                padding: 8,
              }}
            >
              <AlertCircle size={18} color="#D63AF9" />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#aaa",
                letterSpacing: 1.5,
              }}
            >
              INTENSITY
            </Text>
          </View>

          {/* pilihan priority */}
          {[
            { key: "high", label: "High Priority" },
            { key: "steady", label: "Steady Pace" },
            { key: "low", label: "Low Focus" },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setPriority(item.key as "high" | "steady" | "low")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: priority === item.key ? "#f0eeff" : "#f5f5f5",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                gap: 12,
                borderWidth: priority === item.key ? 1.5 : 0,
                borderColor: priority === item.key ? "#6C63FF" : "transparent",
              }}
            >
              {/* radio button */}
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: priority === item.key ? "#6C63FF" : "#ccc",
                  backgroundColor:
                    priority === item.key ? "#6C63FF" : "transparent",
                }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: priority === item.key ? "700" : "500",
                  color: priority === item.key ? "#6C63FF" : "#1a1a1a",
                }}
              >
                {item.label}
              </Text>
              {priority === item.key && (
                <TrendingUp
                  size={18}
                  color="#6C63FF"
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Tombol bawah */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 12,
          backgroundColor: "#f0f2f8",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#888" }}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={simpanTask}
          style={{
            flex: 2,
            backgroundColor: "#6C63FF",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
            Save Task
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
