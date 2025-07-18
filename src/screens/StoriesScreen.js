import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../components/LoadingSpinner";

const { width } = Dimensions.get("window");

export default function StoriesScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, API_BASE_URL } = useAuth();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || data);
      }
    } catch (error) {
      console.error("Erro ao carregar stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  };

  const getImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return { uri: url };
    return { uri: `http://localhost:8000${url}` };
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "agora";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate("StoryViewer", { story: item })}
    >
      <View style={styles.storyImageContainer}>
        {item.media_url ? (
          <Image
            source={getImageSource(item.media_url)}
            style={styles.storyImage}
          />
        ) : (
          <View
            style={[
              styles.storyImage,
              { backgroundColor: item.background_color || "#4F46E5" },
            ]}
          >
            <Text style={styles.storyText}>{item.content}</Text>
          </View>
        )}

        {/* Overlay com informações */}
        <View style={styles.storyOverlay}>
          <View style={styles.storyHeader}>
            <Image
              source={getAvatarSource(
                item.author?.avatar,
                `${item.author?.first_name} ${item.author?.last_name}`,
              )}
              style={styles.storyAvatar}
            />
            <View style={styles.storyUserInfo}>
              <Text style={styles.storyUserName}>
                {item.author?.first_name} {item.author?.last_name}
              </Text>
              <Text style={styles.storyTime}>
                {formatTimeAgo(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="play-circle-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum story ainda</Text>
      <Text style={styles.emptySubtitle}>
        Crie seu primeiro story ou siga pessoas para ver stories aqui!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("Camera")}
      >
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.createButtonText}>Criar Story</Text>
      </TouchableOpacity>
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
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
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
          stories.length === 0 ? styles.emptyList : styles.listContainer
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
  listContainer: {
    padding: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  storyCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 9 / 16, // Proporção de story
    maxWidth: (width - 24) / 2,
  },
  storyImageContainer: {
    flex: 1,
    position: "relative",
  },
  storyImage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  storyText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  storyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    padding: 12,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  storyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ffffff",
    marginRight: 8,
  },
  storyUserInfo: {
    flex: 1,
  },
  storyUserName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  storyTime: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
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
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
