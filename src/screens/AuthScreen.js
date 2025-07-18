import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const { signIn, signUp } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    // Validações básicas
    if (!formData.email || !formData.password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!isLogin) {
      if (!formData.first_name || !formData.last_name) {
        Alert.alert("Erro", "Por favor, preencha seu nome completo.");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        Alert.alert("Erro", "As senhas não coincidem.");
        return;
      }
      if (formData.password.length < 6) {
        Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData);
      }

      if (!result.success) {
        Alert.alert(
          "Erro",
          result.error || "Ocorreu um erro. Tente novamente.",
        );
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão. Verifique sua internet.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo/Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="sparkles" size={50} color="#ffffff" />
              </View>
              <Text style={styles.appName}>Vibe</Text>
              <Text style={styles.tagline}>
                {isLogin
                  ? "Bem-vindo de volta!"
                  : "Junte-se à nossa comunidade"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {!isLogin && (
                <View style={styles.nameRow}>
                  <View style={styles.nameInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nome"
                      value={formData.first_name}
                      onChangeText={(text) =>
                        handleInputChange("first_name", text)
                      }
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.nameInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Sobrenome"
                      value={formData.last_name}
                      onChangeText={(text) =>
                        handleInputChange("last_name", text)
                      }
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Senha"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Confirmar Senha"
                    value={formData.confirm_password}
                    onChangeText={(text) =>
                      handleInputChange("confirm_password", text)
                    }
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading
                    ? "Processando..."
                    : isLogin
                      ? "Entrar"
                      : "Criar Conta"}
                </Text>
                {!isLoading && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#ffffff"
                    style={styles.submitIcon}
                  />
                )}
              </TouchableOpacity>

              {/* Toggle Mode */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.toggleButton}>
                    {isLogin ? "Criar conta" : "Fazer login"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  nameRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  inputWithIcon: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 50,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingRight: 50,
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    top: 18,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 18,
    zIndex: 1,
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  submitIcon: {
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  toggleText: {
    color: "#6B7280",
    fontSize: 16,
  },
  toggleButton: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
});
