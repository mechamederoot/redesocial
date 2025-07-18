import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  userToken,
  currentUserId,
}) {
  const [isLiked, setIsLiked] = useState(post.user_reaction === "like");
  const [likesCount, setLikesCount] = useState(post.reactions_count || 0);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      onLike();
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
    // Avatar padrão baseado no nome
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4F46E5&color=fff&size=128`,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header do Post */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={getAvatarSource(
              post.author?.avatar,
              `${post.author?.first_name} ${post.author?.last_name}`,
            )}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {post.author?.first_name} {post.author?.last_name}
            </Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo do Post */}
      {post.content && (
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{post.content}</Text>
        </View>
      )}

      {/* Mídia do Post */}
      {post.media_url && (
        <View style={styles.mediaContainer}>
          {post.media_type === "photo" && (
            <Image
              source={getImageSource(post.media_url)}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
          {post.media_type === "video" && (
            <View style={styles.videoContainer}>
              {/* Placeholder para vídeo - pode ser implementado com expo-av */}
              <View style={styles.videoPlaceholder}>
                <Ionicons name="play-circle" size={60} color="#ffffff" />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Indicador de atualização de perfil */}
      {post.is_profile_update && (
        <View style={styles.profileUpdateBadge}>
          <Ionicons name="person" size={12} color="#4F46E5" />
          <Text style={styles.profileUpdateText}>
            atualizou a foto do perfil
          </Text>
        </View>
      )}

      {/* Ações do Post */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, isLiked && styles.likedButton]}
          onPress={handleLike}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#EF4444" : "#6B7280"}
          />
          {likesCount > 0 && (
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {likesCount}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
          {post.comments_count > 0 && (
            <Text style={styles.actionText}>{post.comments_count}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="paper-plane-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Curtidas */}
      {likesCount > 0 && (
        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>
            {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  timeAgo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    color: "#1F2937",
  },
  mediaContainer: {
    width: "100%",
  },
  postImage: {
    width: "100%",
    height: width * 0.8, // Proporção 4:5 como Instagram
    backgroundColor: "#F3F4F6",
  },
  videoContainer: {
    width: "100%",
    height: width * 0.8,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileUpdateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F9FF",
  },
  profileUpdateText: {
    fontSize: 13,
    color: "#4F46E5",
    marginLeft: 4,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 8,
  },
  likedButton: {
    // Estilo especial para botão curtido
  },
  actionText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  likedText: {
    color: "#EF4444",
  },
  likesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  likesText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
});
