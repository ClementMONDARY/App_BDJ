import { useThemeStyles } from "@/hooks/useThemeStyles";
import { borderRadius, fonts, spacing } from "@/styles";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSliderProps {
  options: FilterOption[];
  selectedOption: string;
  onSelect: (value: string) => void;
}

export function FilterSlider({
  options,
  selectedOption,
  onSelect,
}: FilterSliderProps) {
  const styles = useThemeStyles((themeColors, themeFontSizes) =>
    StyleSheet.create({
      contentContainer: {
        gap: spacing.sm,
      },
      filterItem: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        borderColor: themeColors.border,
        backgroundColor: themeColors.surface,
      },
      filterItemActive: {
        backgroundColor: themeColors.primary,
        borderColor: themeColors.primary,
      },
      filterText: {
        fontFamily: fonts.primaryMedium,
        fontSize: themeFontSizes.s,
        color: themeColors.text,
      },
      filterTextActive: {
        color: themeColors.textWhite,
      },
    }),
  );

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {options.map((option) => {
          const isActive = selectedOption === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterItem, isActive && styles.filterItemActive]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
