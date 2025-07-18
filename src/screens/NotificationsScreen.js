import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, API_BASE_URL } = useAuth();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || data);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getAvatarSource = (avatar, name) => {
    if (avatar && avatar.startsWith("http")) {
      return { uri: avatar };
    } else if (avatar) {
      return { uri: `http://localhost:8000${avatar}` };
    }
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`,
    };
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return { name: "heart", color: "#EF4444" };
      case "comment":
        return { name: "chatbubble", color: "#3B82F6" };
      case "follow":
        return { name: "person-add", color: "#10B981" };
      case "mention":
        return { name: "at", color: "#8B5CF6" };
      default:
        return { name: "notifications", color: "#6B7280" };
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => {
          // Navegar para o contexto da notificação
          if (item.post_id) {
            navigation.navigate("PostDetail", { postId: item.post_id });
          }
        }}
      >
        <View style={styles.notificationContent}>
          <Image
            source={getAvatarSource(
              item.sender?.avatar,
              `${item.sender?.first_name} ${item.sender?.last_name}`,
            )}
            style={styles.senderAvatar}
          />

          <View style={styles.notificationDetails}>
            <Text style={styles.notificationText}>
              <Text style={styles.senderName}>
                {item.sender?.first_name} {item.sender?.last_name}
              </Text>
              {" " + item.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>

          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: icon.color + "20" },
            ]}
          >
            <Ionicons name={icon.name} size={16} color={icon.color} />
          </View>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
      <Text style={styles.emptySubtitle}>
        Quando alguém curtir ou comentar em suas publicações, você verá aqui!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  emptyList: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    position: "relative",
  },
  unreadNotification: {
    backgroundColor: "#F0F9FF",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  senderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  notificationDetails: {
    flex: 1,
    marginRight: 12,
  },
  notificationText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  senderName: {
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
