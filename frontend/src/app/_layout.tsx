import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { mode, colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inProtectedGroup = segments[0] === "tabs" || segments[0] === "assignments";
    const inAuthScreen = segments[0] === "login" || segments[0] === "register";

    if (!user && inProtectedGroup) {
      router.replace("/login");
    } else if (user && inAuthScreen) {
      router.replace("/tabs");
    }
  }, [user, loading, segments, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} backgroundColor={colors.bg} />
      <Slot key={user?.id ?? "unauthenticated"} />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
