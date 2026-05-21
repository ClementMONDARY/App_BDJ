# App BDJ

**App BDJ** is the mobile application of the BDJ (Bureau Des Jeunes), providing members with access to events, articles, a suggestion box, a forum, and a help center — all in a single cross-platform app (iOS, Android, Web).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native via [Expo SDK 54](https://expo.dev) |
| Language | TypeScript 5.9 |
| Routing | [Expo Router](https://expo.github.io/router) (file-based) |
| State — server | [TanStack Query v5](https://tanstack.com/query) |
| State — global | React Context API |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Styling | React Native `StyleSheet` + centralized design tokens |
| Linter / Formatter | [Biome](https://biomejs.dev) |
| Package manager | pnpm (recommended) or npm |

---

## Prerequisites

Make sure the following tools are installed on your machine before setting up the project.

| Tool | Version | Notes |
|---|---|---|
| Node.js | >= 18 | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| pnpm | >= 9 | `npm install -g pnpm` |
| Expo CLI | latest | Installed locally — no global install required |
| Android Studio | latest | Required for Android emulator |
| Xcode | >= 15 | macOS only — required for iOS simulator |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd AppBDJ
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the API URL to point to your local backend instance:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000
```

> Use your machine's local network IP (not `localhost`) so that the emulator or a physical device can reach the backend.

### 4. Start backend dependencies

The app requires a running backend API. Start your local API server (e.g. the BDJ backend) before launching the app:

```bash
# For using the API, clone and travel to backend route
git clone https://github.com/ClementMONDARY/App_BDJ-back.git
cd App_BDJ-back
# Start the database (if using Docker)
docker compose up -d
```

### 5. Start the development server

```bash
pnpm start
```

From the Expo CLI menu, press:

- `i` — open on iOS Simulator (macOS only)
- `a` — open on Android Emulator
- `w` — open in the web browser
- Scan the QR code with **Expo Go** on a physical device

---

## Project Structure

```
AppBDJ/
├── app/                    # Screens and navigation (Expo Router)
│   ├── (tabs)/             # Bottom-tab navigation group
│   ├── article/            # Article detail routes
│   ├── event/              # Event detail routes
│   ├── topic/              # Forum topic routes
│   ├── _layout.tsx         # Root layout and global providers
│   ├── login.tsx
│   ├── signup.tsx
│   ├── profile.tsx
│   ├── settings.tsx
│   ├── suggestion-box.tsx
│   ├── help-center.tsx
│   └── new-topic-form.tsx
│
├── api/                    # API layer — fetch calls per resource
│   ├── events.ts
│   ├── forum.ts
│   ├── users.ts
│   └── ...
│
├── components/             # Reusable UI components
│   ├── global/             # App-wide shared components
│   ├── articles/
│   ├── events/
│   ├── forum/
│   ├── form/               # Controlled form inputs
│   ├── Header.tsx
│   └── TabBar.tsx
│
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication state and helpers
│   └── ThemeContext.tsx    # Theme (dark/light) and font sizes
│
├── hooks/                  # Custom React hooks
│   └── useThemeStyles.ts   # Theme-aware StyleSheet factory
│
├── services/               # Business logic utilities
│   └── dateUtils.ts        # Date formatting helpers
│
├── styles/                 # Centralized design tokens
│   ├── constants.ts        # Colors, fonts, spacing, shadows
│   ├── globalStyles.ts     # Shared style patterns
│   └── index.ts            # Export entry point
│
├── assets/                 # Static files (images, fonts)
├── constants/              # App-wide constants
├── app.json                # Expo configuration
├── biome.json              # Linter / formatter configuration
├── tsconfig.json           # TypeScript configuration
└── .env.example            # Environment variable template
```

---

## Scripts

The following scripts are defined in `package.json`:

| Script | Command | Description |
|---|---|---|
| `start` | `expo start` | Start the Expo development server |
| `web` | `expo start --web` | Start the app in the browser only |
| `lint` | `expo lint` | Run ESLint across the project |
| `format` | `biome format --write` | Auto-format all files with Biome |
| `reset-project` | `node ./scripts/reset-project.js` | Reset to a blank project (moves starter code to `app-example/`) |
