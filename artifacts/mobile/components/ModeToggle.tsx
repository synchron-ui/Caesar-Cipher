import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface ModeToggleProps {
  mode: "encode" | "decode";
  onToggle: (mode: "encode" | "decode") => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          mode === "encode" && { backgroundColor: colors.primary },
        ]}
        onPress={() => onToggle("encode")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            { color: mode === "encode" ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          ENCODE
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          mode === "decode" && { backgroundColor: colors.primary },
        ]}
        onPress={() => onToggle("decode")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            { color: mode === "decode" ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          DECODE
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
});
