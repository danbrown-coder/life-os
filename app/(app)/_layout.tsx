import { Tabs } from "expo-router";
import { View } from "react-native";

// Hairline tab bar with mono caps labels. Active = lacquer 2px underline
// drawn just under the label. No symbol icons, no rounded chips, no
// platform-default chrome.
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0E0D0B",
          borderTopColor: "#2A2722",
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#F1ECE2",
        tabBarInactiveTintColor: "#6E665A",
        tabBarLabelStyle: {
          fontFamily: "Geist Mono",
          fontSize: 10,
          fontWeight: "500",
          letterSpacing: 2.5,
          textTransform: "uppercase",
        },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarIconStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => <ActiveUnderline active={focused} />,
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: "Week",
          tabBarIcon: ({ focused }) => <ActiveUnderline active={focused} />,
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: "Memory",
          tabBarIcon: ({ focused }) => <ActiveUnderline active={focused} />,
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: "Reflect",
          tabBarIcon: ({ focused }) => <ActiveUnderline active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ focused }) => <ActiveUnderline active={focused} />,
        }}
      />
      <Tabs.Screen name="block/[id]" options={{ href: null }} />
      <Tabs.Screen name="adjust" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
    </Tabs>
  );
}

// Underline rendered into the icon slot (which we hide via iconStyle).
// We can't easily add a child below the label with the default Tabs API,
// so we use a near-zero-height view that still emits a 2px lacquer rule
// on focus. This relies on tabBarIconStyle:none to not consume space.
function ActiveUnderline({ active }: { active: boolean }) {
  return (
    <View
      style={{
        position: "absolute",
        top: 4,
        height: 2,
        width: 28,
        backgroundColor: active ? "#C01F26" : "transparent",
      }}
    />
  );
}
