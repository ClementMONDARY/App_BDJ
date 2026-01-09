import { type Suggestion, SuggestionsAPI } from "@/api/suggestions";
import { UsersAPI } from "@/api/users";
import { icon } from "@/constants/icons";
import { useAuth } from "@/contexts/AuthContext";
import { colors, fontSize, fonts, shadows } from "@/styles";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

interface SuggestionItemProps {
  suggestion: Suggestion;
  onVote?: () => void;
}

export function SuggestionItem({ suggestion, onVote }: SuggestionItemProps) {
  const { user, getToken } = useAuth();
  const [voting, setVoting] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await UsersAPI.getUserPublicInfo(suggestion.user_id);
        setAvatar(userInfo.avatar);
      } catch {
        // Fallback or ignore
      }
    };
    fetchUser();
  }, [suggestion.user_id]);

  const formattedDate = new Date(
    new Date(suggestion.created_at).getTime() + 60 * 60 * 1000,
  ).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleVote = async (type: "up" | "down") => {
    if (!user) {
      Alert.alert("Connexion requise", "Connectez-vous pour voter.");
      return;
    }
    try {
      setVoting(true);
      const token = await getToken();
      if (!token) return;

      await SuggestionsAPI.voteSuggestion(suggestion.id, type, token);
      onVote?.();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de voter.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar + Title + Date */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              avatar ||
              `https://avatar.iran.liara.run/public?username=${suggestion.user_id}`,
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{suggestion.title}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{suggestion.content}</Text>

      {/* Votes */}
      <View style={styles.footer}>
        {/* Upvote */}
        <Pressable
          style={styles.voteButton}
          onPress={() => handleVote("up")}
          disabled={voting}
        >
          {icon["thumbs-up"](
            {
              size: 18,
              color:
                suggestion.user_vote === "up"
                  ? colors.primary
                  : colors.iconInactive,
            },
            suggestion.user_vote === "up",
          )}
          <Text
            style={[
              styles.voteText,
              {
                color:
                  suggestion.user_vote === "up"
                    ? colors.primary
                    : colors.iconInactive,
              },
            ]}
          >
            {suggestion.upvotes}
          </Text>
        </Pressable>

        {/* Downvote */}
        <Pressable
          style={styles.voteButton}
          onPress={() => handleVote("down")}
          disabled={voting}
        >
          {icon["thumbs-down"](
            {
              size: 18,
              color:
                suggestion.user_vote === "down"
                  ? colors.error
                  : colors.iconInactive,
            },
            suggestion.user_vote === "down",
          )}
          <Text
            style={[
              styles.voteText,
              {
                color:
                  suggestion.user_vote === "down"
                    ? colors.error
                    : colors.iconInactive,
              },
            ]}
          >
            {suggestion.downvotes}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 7,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    ...shadows.light,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSize.m,
    color: colors.black,
  },
  date: {
    fontFamily: fonts.primary,
    fontSize: 9,
    color: colors.iconInactive,
  },
  content: {
    fontFamily: fonts.primary,
    fontSize: fontSize.xs,
    color: colors.black,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 15,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  voteText: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSize.m,
  },
});
