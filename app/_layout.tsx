import { Stack, Tabs } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="date/[date]" options={{ title:"", headerBackTitleVisible:false }} />
    </Stack>
  );
}
