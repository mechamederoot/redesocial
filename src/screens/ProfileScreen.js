import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const { user, signOut, API_BASE_URL } = useAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Carregar posts do usuário
      const postsResponse = await fetch(
        `${API_BASE_URL}/users/${user.id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setUserPosts(postsData.posts || postsData);
      }

      // Carregar estatísticas
      const statsResponse = await fetch(
        `${API_BASE_URL}/users/${user.id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do perfil:", error);
    }
  };

  const getAvatarSource = () => {
    if (user.avatar && user.avatar.startsWith("http")) {
      return { uri: user.avatar };
    } else if (user.avatar) {
      return { uri: `${API_BASE_URL}${user.avatar}` };
    }
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff&size=256`,
    };
  };

  const getImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return { uri: url };
    return { uri: `${API_BASE_URL}${url}` };
  };

  const handleSignOut = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const renderPost = (post, index) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postItem}
      onPress={() =>
        navigation.navigate("PostDetail", { postId: post.id, post })
      }
    >
      {post.media_url ? (
        <Image
          source={getImageSource(post.media_url)}
          style={styles.postImage}
        />
      ) : (
        <View style={styles.textPost}>
          <Text style={styles.textPostContent} numberOfLines={3}>
            {post.content}
          </Text>
        </View>
      )}

      {/* Overlay com informações */}
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={16} color="#ffffff" />
            <Text style={styles.postStatText}>{post.reactions_count || 0}</Text>
          </View>
          {post.comments_count > 0 && (
            <View style={styles.postStat}>
              <Ionicons name="chatbubble" size={16} color="#ffffff" />
              <Text style={styles.postStatText}>{post.comments_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header do Perfil */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.profileHeader}
        >
          <View style={styles.headerContent}>
            {/* Avatar */}
            <Image source={getAvatarSource()} style={styles.avatar} />

            {/* Info do usuário */}
            <Text style={styles.userName}>{user.name}</Text>
            {user.username && (
              <Text style={styles.username}>@{user.username}</Text>
            )}
            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

            {/* Estatísticas */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.followers}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.following}</Text>
                <Text style={styles.statLabel}>Seguindo</Text>
              </View>
            </View>

            {/* Botões de ação */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons name="pencil" size={16} color="#4F46E5" />
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
              >
                <Ionicons name="settings" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Menu de opções */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
            <Text style={styles.menuText}>Salvos</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.menuText}>Arquivo</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="heart-outline" size={20} color="#6B7280" />
            <Text style={styles.menuText}>Curtidas</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.menuText, { color: "#EF4444" }]}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Posts */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meus Posts</Text>
            <Text style={styles.postsCount}>{userPosts.length}</Text>
          </View>

          {userPosts.length > 0 ? (
            <View style={styles.postsGrid}>
              {userPosts.map((post, index) => renderPost(post, index))}
            </View>
          ) : (
            <View style={styles.emptyPosts}>
              <Ionicons name="camera-outline" size={60} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
              <Text style={styles.emptySubtitle}>
                Comece compartilhando seus momentos!
              </Text>
              <TouchableOpacity
                style={styles.createFirstPost}
                onPress={() => navigation.navigate("Camera")}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.createFirstPostText}>
                  Criar primeiro post
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  profileHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#ffffff",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    marginTop: 8,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  postsSection: {
    backgroundColor: "#ffffff",
    marginTop: 8,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  postsCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  postItem: {
    width: (width - 24) / 3,
    height: (width - 24) / 3,
    margin: 2,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  textPost: {
    width: "100%",
    height: "100%",
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  textPostContent: {
    color: "#ffffff",
    fontSize: 12,
    textAlign: "center",
  },
  postOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    padding: 8,
  },
  postStats: {
    flexDirection: "row",
    gap: 8,
  },
  postStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postStatText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyPosts: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  createFirstPost: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  createFirstPostText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
