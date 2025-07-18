import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PostDetailScreen({ route, navigation }) {
  const { postId, post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(!initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sendingComment, setSendingComment] = useState(false);

  const { user, API_BASE_URL } = useAuth();

  useEffect(() => {
    if (!initialPost) {
      loadPost();
    } else {
      setIsLiked(post?.user_reaction === "like");
      setLikesCount(post?.reactions_count || 0);
    }
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
        setIsLiked(data.user_reaction === "like");
        setLikesCount(data.reactions_count || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar post:", error);
      Alert.alert("Erro", "Não foi possível carregar o post");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || data);
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };

  const handleLike = async () => {
    const method = isLiked ? "DELETE" : "POST";
    const url = `${API_BASE_URL}/posts/${postId}/reactions`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body:
          method === "POST"
            ? JSON.stringify({ reaction_type: "like" })
            : undefined,
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (error) {
      console.error("Erro ao curtir/descurtir post:", error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || sendingComment) return;

    setSendingComment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        setNewComment("");
        await loadComments();
        // Atualizar contador de comentários no post
        if (post) {
          setPost((prev) => ({
            ...prev,
            comments_count: (prev.comments_count || 0) + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      Alert.alert("Erro", "Não foi possível enviar o comentário");
    } finally {
      setSendingComment(false);
    }
  };

  const getImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return { uri: url };
    return { uri: `${API_BASE_URL}${url}` };
  };

  const getAvatarSource = (avatar, name) => {
    if (avatar && avatar.startsWith("http")) {
      return { uri: avatar };
    } else if (avatar) {
      return { uri: `${API_BASE_URL}${avatar}` };
    }
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`,
    };
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post não encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Post */}
          <View style={styles.postContainer}>
            {/* Header do Post */}
            <View style={styles.postHeader}>
              <Image
                source={getAvatarSource(
                  post.author?.avatar,
                  `${post.author?.first_name} ${post.author?.last_name}`,
                )}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.author?.first_name} {post.author?.last_name}
                </Text>
                <Text style={styles.postTime}>
                  {formatTimeAgo(post.created_at)}
                </Text>
              </View>
            </View>

            {/* Conteúdo */}
            {post.content && (
              <Text style={styles.postContent}>{post.content}</Text>
            )}

            {/* Mídia */}
            {post.media_url && (
              <Image
                source={getImageSource(post.media_url)}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            {/* Ações */}
            <View style={styles.postActions}>
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
                  <Text
                    style={[styles.actionText, isLiked && styles.likedText]}
                  >
                    {likesCount}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
                {comments.length > 0 && (
                  <Text style={styles.actionText}>{comments.length}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons
                  name="paper-plane-outline"
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comentários */}
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsTitle}>
              Comentários ({comments.length})
            </Text>

            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image
                  source={getAvatarSource(
                    comment.author?.avatar,
                    `${comment.author?.first_name} ${comment.author?.last_name}`,
                  )}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>
                      {comment.author?.first_name} {comment.author?.last_name}
                    </Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                  <Text style={styles.commentTime}>
                    {formatTimeAgo(comment.created_at)}
                  </Text>
                </View>
              </View>
            ))}

            {comments.length === 0 && (
              <View style={styles.noComments}>
                <Ionicons name="chatbubble-outline" size={40} color="#9CA3AF" />
                <Text style={styles.noCommentsText}>
                  Seja o primeiro a comentar!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input de comentário */}
        <View style={styles.commentInputContainer}>
          <Image
            source={getAvatarSource(user.avatar, user.name)}
            style={styles.userAvatar}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva um comentário..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newComment.trim() || sendingComment) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendComment}
            disabled={!newComment.trim() || sendingComment}
          >
            <Ionicons
              name={sendingComment ? "hourglass" : "send"}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  postTime: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1F2937",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 300,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 8,
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
  commentsContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: "#6B7280",
    paddingLeft: 12,
  },
  noComments: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 8,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
