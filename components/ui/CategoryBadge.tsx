import { Text, View } from "react-native";
import type { DomainCategory } from "@/lib/db/types";

// Mono micro-cap with a 6px hue chip. No pill fill — keeps the editorial
// system intact while still letting the eye locate categories quickly.
const hue: Record<DomainCategory, string> = {
  fitness: "#C7B8FF",
  nutrition: "#E2A53C",
  study: "#9CC9D6",
  bjj: "#C01F26",
  recovery: "#7DA67A",
  social: "#E2A6BB",
  hobby: "#B6AE9F",
  work: "#8C8474",
  sleep: "#9395C7",
};

const labels: Record<DomainCategory, string> = {
  fitness: "FITNESS",
  nutrition: "FUEL",
  study: "STUDY",
  bjj: "BJJ",
  recovery: "RECOVERY",
  social: "SOCIAL",
  hobby: "HOBBY",
  work: "WORK",
  sleep: "SLEEP",
};

export function CategoryBadge({ category }: { category: DomainCategory }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 6, height: 6, backgroundColor: hue[category] }} />
      <Text
        className="font-mono uppercase text-bone-300"
        style={{ fontSize: 10, letterSpacing: 2.5 }}
      >
        {labels[category]}
      </Text>
    </View>
  );
}

export function categoryColor(c: DomainCategory) {
  return hue[c];
}
