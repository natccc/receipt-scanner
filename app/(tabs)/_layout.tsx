import { Tabs, Redirect } from 'expo-router';
import React from 'react';


export default function TabLayout() {
  const { isFirstTime, isLoading } = useFirstTimeOpen()
  if (isLoading) return <></>
  if (isFirstTime) return <Redirect href={"/onboarding"} />
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
  
        }}
      />
    </Tabs>
  );
}
