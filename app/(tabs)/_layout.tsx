import { PlayerControlTabBar } from "@/components/PlayerControlTabBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="PlayerScreen"
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
        name="PlayerScreen"
        options={{
          title: "",
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
      {/* Removed old builder tab: InputCueScreen */}
    </Tabs>
  );
}
