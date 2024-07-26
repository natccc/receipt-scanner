import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ headerShown: true, title:"Home"}} />
      <Tabs.Screen
        name="history"
        options={{
          headerShown: true,
          title:"History",
        }}
      />
    </Tabs>
  );
}
