import { PlayerControlTabBar } from "@/components/PlayerControlTabBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="InputDurationScreen"
      tabBar={(props) => <PlayerControlTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#25292e",
        },
      }}
    >
      <Tabs.Screen
        name="InputDurationScreen"
        options={{
          title: "InputDuration",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "timer" : "timer-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="PlayerScreen"
        options={{
          title: "Player",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "caret-forward-circle"
                  : "caret-forward-circle-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="InputCueScreen"
        options={{
          title: "InputCue",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cog" : "cog-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
