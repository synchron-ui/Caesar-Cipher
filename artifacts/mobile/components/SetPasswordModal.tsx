import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface SetPasswordModalProps {
  visible: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export function SetPasswordModal({
  visible,
  onConfirm,
  onCancel,
}: SetPasswordModalProps) {
  const colors = useColors();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  };

  const handleConfirm = () => {
    if (password.length < 3) {
      setError("Password must be at least 3 characters.");
      shake();
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      shake();
      return;
    }
    setError("");
    setPassword("");
    setConfirm("");
    onConfirm(password);
  };

  const handleCancel = () => {
    setPassword("");
    setConfirm("");
    setError("");
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          <View style={styles.iconRow}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.secondary, borderColor: colors.primary },
              ]}
            >
              <Feather name="lock" size={22} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            Set Decode Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Only users who know this password will be able to reveal the decoded
            message.
          </Text>

          <View style={styles.fields}>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Feather name="key" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Enter password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPass((p) => !p)}>
                <Feather
                  name={showPass ? "eye-off" : "eye"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Feather name="check-circle" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={(t) => { setConfirm(t); setError(""); }}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                <Feather
                  name={showConfirm ? "eye-off" : "eye"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            {error.length > 0 && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Feather name="lock" size={14} color={colors.primaryForeground} />
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                Set Password
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  iconRow: {
    alignItems: "center",
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
  fields: {
    gap: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
