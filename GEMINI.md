# 🚀 App BDJ - Project Configuration & Guidelines

This document serves as the single source of truth for the **App BDJ** project. It defines the architecture, design patterns, coding standards, and workflows to ensure a consistent and scalable codebase.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: React Native (via Expo SDK 54)
- **Platform**: iOS, Android, Web
- **Language**: TypeScript
- **Routing**: File-based routing with `expo-router`
- **State Management**: React Context API (e.g., `AuthContext`) for global state.
- **Styling**: Native `StyleSheet` with centralized design tokens in `@/styles`.
- **Package Manager**: pnpm (recommended) or npm.

### Directory Structure
```
/app                # Application source code (Expo Router)
  ├── (tabs)        # Tab navigation group
  ├── _layout.tsx   # Root layout and providers
  └── [route].tsx   # Screens/Pages
/api                # API interactions and fetch calls
/components         # Reusable UI components
  ├── buttons       # Reusable buttons
  └── inputs        # Reusable inputs
/constants          # App-wide constants (Config, Strings)
/contexts           # React Contexts (Auth, Theme, etc.)
/hooks              # Custom React Hooks
/services           # Business logic (not directly API or UI)
/styles             # Centralized Styling System (Design Tokens)
  ├── constants.ts  # Colors, Fonts, Spacing, Shadows
  ├── globalStyles.ts # Shared styles (containers, buttons)
  └── index.ts      # Export entry point
/assets             # Images, fonts, and other static files
```

---

## 🎨 Design Patterns

### 1. Component Structure
- Use **Functional Components** with Hooks.
- Prefer **Named Exports** for components.
- Props interface should be named `[ComponentName]Props`.
- Destructure props in the function signature.

```tsx
interface MyComponentProps {
  title: string;
  isActive?: boolean;
}

export function MyComponent({ title, isActive = false }: MyComponentProps) {
  return (
    <View style={isActive ? styles.active : styles.inactive}>
      <Text>{title}</Text>
    </View>
  );
}
```

### 2. Styling System
- **Do not hardcode colors or magic numbers** in components.
- Import design tokens from `@/styles`.
- Use `StyleSheet.create` for performance.
- Common UI patterns (buttons, containers) should use `commonStyles` from `@/styles`.

```tsx
import { colors, spacing } from "@/styles";

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
});
```

### 3. Theming (Dark Mode)
- **Context**: Use `useTheme()` hook to access current theme colors (`colors`) and mode (`isDark`).
- **Dynamic Styles**: Use `useThemeStyles` hook for styles that need to react to theme changes.
- **Root Layout**: Ensure the root view uses `colors.background` to handle rounded corners properly.

```tsx
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";

export function MyComponent() {
  const { colors, isDark } = useTheme();
  // Creates styles that automatically update when theme changes
  const styles = useThemeStyles((themeColors) => 
    StyleSheet.create({
      container: {
        backgroundColor: themeColors.background,
      },
      text: {
        color: themeColors.text,
      }
    })
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed Content</Text>
    </View>
  );
  );
}
```

### 4. Dynamic Text Sizing
- **Context**: Access `fontSizes` from `useTheme()` for scalable text sizes (small/medium/large).
- **Style Factory**: The `styleFactory` in `useThemeStyles` receives both `colors` and `fontSizes`.
- **Global Styles**: Use `useGlobalStyles()` hook for standardized, responsive typography.

```tsx
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts } from "@/styles";

export function MyTextComponent() {
  const styles = useThemeStyles((colors, fontSizes) => 
    StyleSheet.create({
      text: {
        color: colors.text,
        fontSize: fontSizes.m, // Dynamic size
        fontFamily: fonts.primary,
      }
    })
  );

  return <Text style={styles.text}>Resizable Text</Text>;
}
```

### 5. Authentication & State
- Use `useAuth()` hook to access user session and auth methods (`signIn`, `signOut`).
- Secure storage keys should be managed within the Context, not exposed to components.

### 6. Form Handling
- **Library**: Use `react-hook-form` for state management and `zod` for validation.
- **Pattern**:
    - Define a Zod schema for validation.
    - Infer the type from the schema.
    - Use `useForm` with `zodResolver`.
    - Use `Controller` to wrap `ThemedTextInput` or other controlled inputs.
- **Validation**: Ensure `zod` version compatibility (v3.24.1 recommended for now) to avoid type errors with `@hookform/resolvers`.

```tsx
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars"),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <ThemedTextInput
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />
      <Button onPress={handleSubmit(onSubmit)} title="Submit" />
    </View>
  );
}
```

---

## 🛠️ Workflows & Checklists

### 🆕 Adding a New Feature
1. **Plan**: Define the feature requirements and where it fits in the architecture.
2. **Components**: Create reusable components in `/components` if needed.
3. **Logic**: Add necessary hooks or Context updates.
4. **Route**: Create the page in `/app` (use `_layout.tsx` if it needs a specific wrapper).
5. **Style**: Apply standard styles from `@/styles`.
6. **Test**: Verify on both iOS/Android simulators if possible.

### 📄 Adding a New Page
- [ ] Create `[page-name].tsx` in `/app`.
- [ ] Export a default component.
- [ ] Use `Screen` components/options for header configuration if needed.
- [ ] Import `Screen` wrapper or `Layout` if applicable.
- [ ] Apply `commonStyles.mainContentContainer` to the main content container.

### 📦 Component Creation Checklist
- [ ] Is it generic? -> Put in `/components`.
- [ ] Could it be used in multiple pages? -> Put in `/components` and configure if for cover a wide range of options.
- [ ] Is it page-specific? -> Keep it near the page or in a `components` sub-folder if complex.
- [ ] Define accurate TypeScript interfaces.
- [ ] Use `colors` and `spacing` constants.

---

## 📝 Coding Standards
- **Naming**: PascalCase for Components, camelCase for variables/functions.
- **Imports**: Use absolute imports `@/...` where possible (configured in `tsconfig.json`).
- **Formatting**: strict usage of **Biome** or **Prettier** (check `biome.json`).
- **Commits**: Clear and descriptive messages.

## 🚀 Environment Setup
- **Run**: `npx expo start` or `pnpm start`.
- **Reset**: `npm run reset-project` (if needed to clean state).
