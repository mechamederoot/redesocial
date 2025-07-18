import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function StoriesBar({
  stories = [],
  onStoryPress,
  onCreateStory,
  userAvatar,
}) {
  const getAvatarSource = (avatar, name = "User") => {
    if (avatar && avatar.startsWith("http")) {
      return { uri: avatar };
    } else if (avatar) {
      return { uri: `http://localhost:8000${avatar}` };
    }
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`,
    };
  };

  const CreateStoryItem = () => (
    <TouchableOpacity style={styles.storyItem} onPress={onCreateStory}>
      <View style={styles.createStoryContainer}>
        <Image
          source={getAvatarSource(userAvatar, "You")}
          style={styles.createStoryAvatar}
        />
        <View style={styles.addButton}>
          <Ionicons name="add" size={16} color="#ffffff" />
        </View>
      </View>
      <Text style={styles.storyLabel} numberOfLines={1}>
        Seu story
      </Text>
    </TouchableOpacity>
  );

  const StoryItem = ({ story }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => onStoryPress(story)}
    >
      <LinearGradient
        colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]}
        style={styles.storyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.storyImageContainer}>
          <Image
            source={getAvatarSource(
              story.author?.avatar,
              `${story.author?.first_name} ${story.author?.last_name}`,
            )}
            style={styles.storyAvatar}
          />
        </View>
      </LinearGradient>
      <Text style={styles.storyLabel} numberOfLines={1}>
        {story.author?.first_name || "Usuário"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {/* Criar Story */}
        <CreateStoryItem />

        {/* Stories dos usuários */}
        {stories.map((story, index) => (
          <StoryItem key={story.id || index} story={story} />
        ))}

        {/* Placeholder caso não haja stories */}
        {stories.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum story ainda</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  storyItem: {
    alignItems: "center",
    marginRight: 12,
    width: 70,
  },
  createStoryContainer: {
    position: "relative",
    marginBottom: 8,
  },
  createStoryAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  addButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  storyGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  storyImageContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  storyLabel: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: width - 120, // Espaço para o botão de criar story
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
