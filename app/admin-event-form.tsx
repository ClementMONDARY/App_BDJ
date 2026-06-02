import { EventsAPI, type NewEvent } from "@/api/events";
import { FormField } from "@/components/form/FormField";
import { FormSingleImageField } from "@/components/form/FormSingleImageField";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { formatEventDateRange } from "@/services/dateUtils";
import { type baseFontSize, borderRadius, fonts, spacing, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  cover_image: z.string().optional(),
  start_time: z.date(),
  end_time: z.date(),
  location: z.string().min(1),
  price: z.string().optional(),
  max_capacity: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

function DateTimeField({ label, value, onChange }: DateTimeFieldProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createDateFieldStyles);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date>(value);

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) {
      setShowPicker(false);
      setPickerMode("date");
      return;
    }

    if (Platform.OS === "android") {
      if (pickerMode === "date") {
        setTempDate(selected);
        setPickerMode("time");
      } else {
        const combined = new Date(tempDate);
        combined.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        onChange(combined);
        setShowPicker(false);
        setPickerMode("date");
      }
    } else {
      setTempDate(selected);
    }
  };

  const handleIOSOpen = () => {
    setTempDate(value);
    setShowPicker(true);
  };

  const handleIOSDone = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
          if (Platform.OS === "android") {
            setTempDate(value);
            setPickerMode("date");
          }
          setShowPicker(true);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.iconInactive} />
        <Text style={styles.dateText}>{formatDateTime(value)}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.iconInactive} />
      </TouchableOpacity>

      {Platform.OS === "ios" ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.iosOverlay}>
            <View style={styles.iosContainer}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.iosCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIOSDone}>
                  <Text style={styles.iosDoneText}>Valider</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={handleChange}
                locale="fr-FR"
              />
            </View>
          </View>
        </Modal>
      ) : showPicker ? (
        <DateTimePicker
          value={pickerMode === "date" ? value : tempDate}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
          is24Hour
        />
      ) : null}
    </View>
  );
}

export default function AdminEventForm() {
  const { authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = id ? Number(id) : undefined;
  const isEdit = eventId !== undefined;

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 2 * 3600 * 1000);

  const { control, handleSubmit, watch, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cover_image: "",
      start_time: defaultStart,
      end_time: defaultEnd,
      location: "",
      price: "",
      max_capacity: "",
    },
  });

  const { data: existingEvent } = useQuery({
    queryKey: ["events", eventId],
    queryFn: () => EventsAPI.fetchEventById(eventId!, authenticatedFetch),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingEvent) {
      reset({
        title: existingEvent.title,
        description: existingEvent.description,
        cover_image: existingEvent.cover_image ?? "",
        start_time: existingEvent.start_time,
        end_time: existingEvent.end_time,
        location: existingEvent.location,
        price: existingEvent.price != null ? String(existingEvent.price) : "",
        max_capacity:
          existingEvent.max_capacity != null
            ? String(existingEvent.max_capacity)
            : "",
      });
    }
  }, [existingEvent, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: NewEvent = {
        title: data.title,
        description: data.description,
        cover_image: data.cover_image || undefined,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        location: data.location,
        price: data.price ? Number(data.price) : undefined,
        max_capacity: data.max_capacity ? Number(data.max_capacity) : undefined,
      };
      return isEdit
        ? EventsAPI.updateEvent(eventId!, payload, authenticatedFetch)
        : EventsAPI.createEvent(payload, authenticatedFetch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      setConfirmVisible(false);
      Alert.alert(
        "Succès",
        isEdit
          ? "Événement modifié avec succès."
          : "Événement créé avec succès.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
    onError: () => {
      setConfirmVisible(false);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder l'événement. Veuillez réessayer.",
      );
    },
  });

  const titleValue = watch("title", "");
  const descriptionValue = watch("description", "");
  const locationValue = watch("location", "");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const priceValue = watch("price", "");
  const maxCapacityValue = watch("max_capacity", "");

  const isFormReady =
    titleValue.trim().length > 0 &&
    descriptionValue.trim().length > 0 &&
    locationValue.trim().length > 0;

  const onSubmit = (data: FormData) => {
    setPendingData(data);
    setConfirmVisible(true);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{ title: isEdit ? "Modifier l'événement" : "Nouvel événement" }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <FormField
          label="Titre"
          counter={{ current: titleValue.length, max: 200 }}
        >
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Titre de l'événement"
                maxLength={200}
              />
            )}
          />
        </FormField>

        <FormField
          label="Description"
          counter={{ current: descriptionValue.length, max: 2000 }}
        >
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Description de l'événement"
                multiline
                numberOfLines={6}
                maxLength={2000}
              />
            )}
          />
        </FormField>

        <Controller
          control={control}
          name="start_time"
          render={({ field: { value } }) => (
            <DateTimeField
              label="Début"
              value={value}
              onChange={(date) => setValue("start_time", date)}
            />
          )}
        />

        <Controller
          control={control}
          name="end_time"
          render={({ field: { value } }) => (
            <DateTimeField
              label="Fin"
              value={value}
              onChange={(date) => setValue("end_time", date)}
            />
          )}
        />

        <FormField label="Lieu">
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Lieu de l'événement"
              />
            )}
          />
        </FormField>

        <FormField label="Prix (optionnel, en €)">
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="ex: 5.50"
                keyboardType="decimal-pad"
              />
            )}
          />
        </FormField>

        <FormField label="Capacité maximale (optionnel)">
          <Controller
            control={control}
            name="max_capacity"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="ex: 100"
                keyboardType="number-pad"
              />
            )}
          />
        </FormField>

        <Controller
          control={control}
          name="cover_image"
          render={({ field: { onChange, value } }) => (
            <FormSingleImageField
              label="Image de couverture (optionnel)"
              value={value}
              onChange={onChange}
            />
          )}
        />
      </ScrollView>

      <View style={styles.footer}>
        <ThemedButton
          title={
            isEdit ? "Enregistrer les modifications" : "Créer l'événement"
          }
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormReady}
        />
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Confirmer la modification" : "Confirmer la création"}
            </Text>

            <ScrollView
              style={styles.previewScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewCard}>
                <PreviewRow label="TITRE" value={pendingData?.title} />
                <PreviewRow
                  label="DESCRIPTION"
                  value={pendingData?.description}
                  numberOfLines={4}
                />
                <PreviewRow
                  label="DATES"
                  value={
                    pendingData
                      ? formatEventDateRange(
                          pendingData.start_time,
                          pendingData.end_time,
                        )
                      : ""
                  }
                />
                <PreviewRow label="LIEU" value={pendingData?.location} />
                {priceValue ? (
                  <PreviewRow label="PRIX" value={`${priceValue} €`} />
                ) : null}
                {maxCapacityValue ? (
                  <PreviewRow
                    label="CAPACITÉ MAX"
                    value={`${maxCapacityValue} personnes`}
                  />
                ) : null}
                {pendingData?.cover_image ? (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>IMAGE</Text>
                    <Image
                      source={{ uri: pendingData.cover_image }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <View style={styles.confirmButtonWrapper}>
                <ThemedButton
                  title="Confirmer"
                  onPress={() => pendingData && mutation.mutate(pendingData)}
                  loading={mutation.isPending}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PreviewRow({
  label,
  value,
  numberOfLines,
}: {
  label: string;
  value?: string;
  numberOfLines?: number;
}) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue} numberOfLines={numberOfLines}>
        {value}
      </Text>
    </View>
  );
}

const createDateFieldStyles = (
  colors: ThemeColors,
  fontSizes: typeof baseFontSize,
) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      fontFamily: fonts.primaryBold,
      marginBottom: 5,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.inputBackground,
      borderRadius: borderRadius.m,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    dateText: {
      flex: 1,
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    iosOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    iosContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: spacing.xl,
    },
    iosHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iosCancelText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.m,
      color: colors.error,
    },
    iosDoneText: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.primary,
    },
  });

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      maxHeight: "85%",
    },
    modalTitle: {
      fontSize: fontSizes.l,
      fontFamily: fonts.primaryBold,
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: "center",
    },
    previewScroll: {
      flexGrow: 0,
    },
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
      gap: spacing.md,
    },
    previewRow: {
      gap: spacing.xs,
    },
    previewLabel: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.iconInactive,
    },
    previewValue: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.text,
    },
    previewImage: {
      width: "100%",
      height: 120,
      borderRadius: 6,
      marginTop: spacing.xs,
    },
    modalButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryBold,
      color: colors.text,
    },
    confirmButtonWrapper: {
      flex: 1,
    },
  });
