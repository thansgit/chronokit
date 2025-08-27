import { useTimer } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlayerControlTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export function PlayerControlTabBar({
  state,
  descriptors,
  navigation,
}: PlayerControlTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isRunning, toggleTimer, stopTimer } = useTimer();

  const navigateToPlayerScreen = () => {
    const currentRoute = state.routes[state.index];
    const currentRouteName = currentRoute?.name || "";

    if (currentRouteName === "PlayerScreen") {
      toggleTimer();
    } else {
      navigation.navigate("PlayerScreen");
    }
  };

  const handlePlayPausePress = () => {
    navigateToPlayerScreen();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          // Not using label directly in render, but if needed it should be wrapped in Text component
          const isFocused = state.index === index;

          // Skip the middle tab as we'll render our custom button there
          if (index === 1) return null;

          // Adjust the index for the right side tabs
          const adjustedIndex = index > 1 ? index - 1 : index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // If currently on player screen (index 1) and timer is running, pause it when navigating away
              // Only do this when navigating to a different tab, not during every render
              const isLeavingPlayerScreen =
                state.index === 1 && isRunning && route.name !== "PlayerScreen";
              if (isLeavingPlayerScreen) {
                stopTimer();
              }

              // Use setTimeout to break the potential update cycle
              setTimeout(() => {
                navigation.navigate(route.name);
              }, 0);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? "#ffd33d" : "#888",
                  size: 24,
                })}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Center Play/Pause Button */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handlePlayPausePress}
        >
          <Ionicons
            name={state.index === 1 && isRunning ? "pause" : "play"}
            size={32}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
  },
  content: {
    flexDirection: "row",
    height: 60,
    position: "relative",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonContainer: {
    position: "absolute",
    top: -30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
