import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { ArticlesAPI } from "@/api/articles";
import { EventsAPI } from "@/api/events";
import { ForumAPI } from "@/api/forum";
import { MiniArticleCard } from "@/components/articles/MiniArticleCard";
import { EventCard } from "@/components/events/EventCard";
import { MiniTopicCard } from "@/components/forum/MiniTopicCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  shadows,
  spacing,
  type ThemeColors,
} from "@/styles";

const LOGO = require("../../assets/images/app-icon_primary.png");

const MODULE_CTAS = [
  {
    id: "events",
    icon: "calendar-outline" as const,
    label: "Onglet des\névènements",
    href: "/(tabs)/events" as const,
  },
  {
    id: "forum",
    icon: "chatbubbles-outline" as const,
    label: "Forum de\ndiscussion",
    href: "/(tabs)/forum" as const,
  },
  {
    id: "articles",
    icon: "newspaper-outline" as const,
    label: "Articles de\nl'association",
    href: "/(tabs)/articles" as const,
  },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => EventsAPI.fetchEvents(),
  });

  const { data: topics } = useQuery({
    queryKey: ["forum", "topics", null],
    queryFn: () => ForumAPI.fetchTopics(),
  });

  const { data: articles } = useQuery({
    queryKey: ["articles"],
    queryFn: () => ArticlesAPI.fetchArticles(),
  });

  const now = new Date();
  const previewEvents = (events ?? [])
    .filter((event) => new Date(event.start_time) > now)
    .slice(0, 3);
  const previewTopics = (topics ?? []).slice(0, 3);
  const previewArticles = (articles ?? []).slice(0, 3);

  const carouselWidth = width - spacing.md * 2;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── TOP SECTION ─── */}
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />

      <Text style={styles.catchphrase}>Bienvenue sur l'appli du BDJ!</Text>

      <View style={styles.ctaRow}>
        {MODULE_CTAS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.ctaItem}
            onPress={() => router.navigate(item.href)}
            activeOpacity={0.8}
          >
            <View style={styles.ctaCircle}>
              <Ionicons name={item.icon} size={24} color={colors.white} />
            </View>
            <Text style={styles.ctaLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      {/* ─── EVENTS SECTION ─── */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => router.navigate("/(tabs)/events")}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>Évenements à venir</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.sectionSubtitle}>
        Découvre les évenements à ne pas manquer
      </Text>

      {previewEvents.length > 0 && (
        <View style={styles.carouselContainer}>
          <Carousel
            width={carouselWidth}
            height={160}
            data={previewEvents}
            renderItem={({ item }) => <EventCard event={item} />}
            loop={false}
            scrollAnimationDuration={400}
            onSnapToItem={setActiveIndex}
          />
          {previewEvents.length > 1 && (
            <View style={styles.dots}>
              {previewEvents.map((event, i) => (
                <View
                  key={event.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeIndex ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {/* ─── FORUM SECTION ─── */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => router.navigate("/(tabs)/forum")}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>Dernières discussions</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.sectionSubtitle}>
        Les récentes discussions de la page forum
      </Text>

      {previewTopics.length > 0 && (
        <View style={styles.cardGrid}>
          {previewTopics.map((topic) => (
            <MiniTopicCard key={topic.id} topic={topic} />
          ))}
        </View>
      )}

      <View style={styles.divider} />

      {/* ─── ARTICLES SECTION ─── */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => router.navigate("/(tabs)/articles")}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>Articles récents</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.sectionSubtitle}>Les derniers articles publiés</Text>

      {previewArticles.length > 0 && (
        <View style={styles.cardGrid}>
          {previewArticles.map((article) => (
            <MiniArticleCard key={article.id} article={article} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: 20,
      paddingHorizontal: spacing.md,
      paddingBottom: 150,
      gap: spacing.md,
    },
    logo: {
      width: 154,
      height: 162,
      alignSelf: "center",
    },
    catchphrase: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.l,
      color: colors.text,
      textAlign: "center",
    },
    ctaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
    },
    ctaItem: {
      padding: spacing.sm,
      alignItems: "center",
      gap: spacing.sm,
    },
    ctaCircle: {
      width: 58,
      height: 58,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.medium,
      shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    ctaLabel: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
      textAlign: "center",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
    },
    sectionSubtitle: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
      marginTop: -spacing.sm,
    },
    carouselContainer: {
      gap: spacing.sm,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    cardGrid: {
      flexDirection: "row",
      gap: spacing.sm,
    },
  });
