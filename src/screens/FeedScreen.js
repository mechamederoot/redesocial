import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import StoriesBar from "../components/StoriesBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { user, API_BASE_URL } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadPosts(1, true), loadStories()]);
    setLoading(false);
  };

  const loadPosts = async (pageNum = 1, isInitial = false) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/posts?page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (isInitial) {
          setPosts(data.posts || data);
          setPage(1);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || data)]);
        }

        setHasNextPage((data.posts || data).length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar os posts. Tente novamente.",
      );
    }
  };

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
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    await loadPosts(page + 1, false);
    setLoadingMore(false);
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/reactions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reaction_type: "like" }),
        },
      );

      if (response.ok) {
        // Atualizar o post localmente
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  reactions_count: post.reactions_count + 1,
                  user_reaction: "like",
                }
              : post,
          ),
        );
      }
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  const handleCommentPress = (post) => {
    navigation.navigate("PostDetail", {
      postId: post.id,
      post: post,
    });
  };

  const handleSharePress = (post) => {
    // Implementar compartilhamento
    Alert.alert("Compartilhar", "Funcionalidade em desenvolvimento");
  };

  const handleStoryPress = (story) => {
    // Navegar para visualização de story
    navigation.navigate("StoryViewer", { story });
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={() => handleLikePost(item.id)}
      onComment={() => handleCommentPress(item)}
      onShare={() => handleSharePress(item)}
      userToken={user.token}
      currentUserId={user.id}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <StoriesBar
        stories={stories}
        onStoryPress={handleStoryPress}
        onCreateStory={() => navigation.navigate("Camera")}
        userAvatar={user.avatar}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
      <Text style={styles.emptySubtitle}>
        Comece seguindo pessoas ou criando seu primeiro post!
      </Text>
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => navigation.navigate("Camera")}
      >
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.createPostText}>Criar Post</Text>
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
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyList : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingBottom: 10,
    marginBottom: 5,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyList: {
    flexGrow: 1,
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
  createPostButton: {
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
  createPostText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
