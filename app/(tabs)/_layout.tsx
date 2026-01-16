import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, focused }) => (
          <Ionicons name="home-sharp" color={focused ? color : '#888'} size={24} />
        ) }}
        />
      <Tabs.Screen
        name="dice"
        options={{ title: 'Dice', tabBarIcon: ({ color, focused }) => (
          <Ionicons name="cube" color={focused ? color : '#888'} size={24} />
        ) }}
        />
      <Tabs.Screen
        name="physics"
        options={{ title: 'Physics', tabBarIcon: ({ color, focused }) => (
          <Ionicons name="analytics" color={focused ? color : '#888'} size={24} />
        ) }}
        />
    </Tabs>
  );
}
