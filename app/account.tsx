import { ArticlesAPI } from "@/api/articles";
import { EventsAPI } from "@/api/events";
import { ForumAPI } from "@/api/forum";
import { getAvatarUri } from "@/api/users";
import { MiniArticleCard } from "@/components/articles/MiniArticleCard";
import { EventCard } from "@/components/events/EventCard";
import { MiniTopicCard } from "@/components/forum/MiniTopicCard";
import { CONFIG } from "@/constants/Config";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  palette,
  spacing,
  type ThemeColors,
} from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Carousel from "react-native-reanimated-carousel";

export default function AccountScreen() {
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { width } = useWindowDimensions();
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  const { data: userData } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await authenticatedFetch(`${CONFIG.API_URL}/auth/me`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: allEvents } = useQuery({
    queryKey: ["events", "account"],
    queryFn: () => EventsAPI.fetchEvents(authenticatedFetch),
    enabled: !!user,
  });

  const { data: allTopics } = useQuery({
    queryKey: ["forum", "topics", "account"],
    queryFn: () => ForumAPI.fetchTopics(authenticatedFetch),
    enabled: !!user,
  });

  const { data: allArticles } = useQuery({
    queryKey: ["articles", "account"],
    queryFn: () => ArticlesAPI.fetchArticles(authenticatedFetch),
    enabled: !!user,
  });

  const now = new Date();

  const registeredEvents = (allEvents ?? [])
    .filter((e) => e.is_registered && e.start_time > now)
    .sort((a, b) => a.start_time.getTime() - b.start_time.getTime());

  const followedTopics = (allTopics ?? [])
    .filter((t) => t.is_followed)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 3);

  const likedArticles = (allArticles ?? [])
    .filter((a) => a.is_liked)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 3);

  const markedDates = registeredEvents.reduce<
    Record<
      string,
      { selected: boolean; selectedColor: string; marked: boolean; dotColor: string }
    >
  >((acc, event) => {
    const dateStr = event.start_time.toISOString().split("T")[0];
    acc[dateStr] = {
      selected: true,
      selectedColor: colors.primary,
      marked: true,
      dotColor: colors.primary,
    };
    return acc;
  }, {});

  const handleDayPress = (day: { dateString: string }) => {
    const event = registeredEvents.find(
      (e) => e.start_time.toISOString().split("T")[0] === day.dateString,
    );
    if (event) router.push(`/event/${event.id}` as any);
  };

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: colors.background,
      calendarBackground: colors.background,
      textSectionTitleColor: colors.text,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: colors.textWhite,
      todayTextColor: colors.primary,
      dayTextColor: colors.text,
      textDisabledColor: colors.iconInactive,
      dotColor: colors.primary,
      selectedDotColor: colors.textWhite,
      arrowColor: colors.primary,
      monthTextColor: colors.primary,
      textMonthFontWeight: "bold" as const,
      textDayFontFamily: fonts.primary,
      textMonthFontFamily: fonts.primaryBold,
      textDayHeaderFontFamily: fonts.primary,
    }),
    [colors],
  );

  const avatarUri = userData?.avatar ? getAvatarUri(userData.avatar) : null;
  const carouselWidth = width - 24;
  const cardWidth = (width - 24) / 3;

  return (
    <>
      <Stack.Screen options={{ title: "Mon compte" }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── USER SECTION ─── */}
        <View style={styles.userSection}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={80}
              color={colors.iconInactive}
            />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {userData?.username || user?.username}
            </Text>
            {(userData?.firstname || userData?.lastname) && (
              <Text style={styles.userMeta}>
                {[userData?.firstname, userData?.lastname]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            )}
            <Text style={styles.userMeta}>
              {userData?.email || user?.email}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Éditer le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ─── CALENDAR SECTION ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textWhite}
            />
            <Text style={styles.sectionTitle}>Agenda d'évènements</Text>
          </View>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={calendarTheme}
            style={{
              borderRadius: borderRadius.s,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>

        <View style={styles.divider} />

        {/* ─── EVENTS SECTION ─── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.navigate("/(tabs)/events")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.textWhite}
            />
            <Text style={styles.sectionTitle}>Évènements inscrits</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.textWhite}
            />
          </TouchableOpacity>
          {registeredEvents.length > 0 ? (
            <View style={styles.carouselContainer}>
              <Carousel
                width={carouselWidth}
                height={160}
                data={registeredEvents}
                renderItem={({ item }) => <EventCard event={item} />}
                loop={false}
                scrollAnimationDuration={400}
                onSnapToItem={setActiveEventIndex}
              />
              {registeredEvents.length > 1 && (
                <View style={styles.dots}>
                  {registeredEvents.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            i === activeEventIndex
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Aucun évènement inscrit à venir
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* ─── TOPICS SECTION ─── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.navigate("/(tabs)/forum")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={colors.textWhite}
            />
            <Text style={styles.sectionTitle}>Topics suivis</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.textWhite}
            />
          </TouchableOpacity>
          {followedTopics.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardScroller}
            >
              {followedTopics.map((topic) => (
                <View key={topic.id} style={{ width: cardWidth }}>
                  <MiniTopicCard topic={topic} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Aucun topic suivi</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* ─── ARTICLES SECTION ─── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.navigate("/(tabs)/articles")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="newspaper-outline"
              size={20}
              color={colors.textWhite}
            />
            <Text style={styles.sectionTitle}>Articles aimés</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.textWhite}
            />
          </TouchableOpacity>
          {likedArticles.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardScroller}
            >
              {likedArticles.map((article) => (
                <View key={article.id} style={{ width: cardWidth }}>
                  <MiniArticleCard article={article} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Aucun article aimé</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: 12,
      paddingHorizontal: 12,
      paddingBottom: 100,
      gap: 15,
    },
    userSection: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.full,
    },
    userInfo: {
      flex: 1,
      justifyContent: "center",
      gap: 2,
    },
    username: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
    },
    userMeta: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    editButton: {
      alignSelf: "flex-start",
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.s,
      marginTop: 2,
    },
    editButtonText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.textWhite,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    section: {
      gap: spacing.xs,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 7,
      backgroundColor: palette.greyDark,
      borderRadius: borderRadius.s,
    },
    sectionTitle: {
      flex: 1,
      textAlign: "center",
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.textWhite,
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
    cardScroller: {
      gap: spacing.xs,
    },
    emptyText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: spacing.sm,
    },
  });
