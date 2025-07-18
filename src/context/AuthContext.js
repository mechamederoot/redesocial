import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext({});

const API_BASE_URL = "http://localhost:8000"; // Altere para o IP do seu backend

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const userData = await SecureStore.getItemAsync("userData");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });

        // Verificar se o token ainda é válido
        await validateToken(token);
      }
    } catch (error) {
      console.log("Erro ao verificar autenticação:", error);
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token inválido");
      }

      const userData = await response.json();
      const fullUserData = {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        avatar: userData.avatar,
        username: userData.username,
        bio: userData.bio,
        token,
      };

      setUser(fullUserData);
      await SecureStore.setItemAsync("userData", JSON.stringify(fullUserData));
    } catch (error) {
      console.log("Token inválido:", error);
      await signOut();
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          avatar: data.avatar,
          username: data.username,
          bio: data.bio,
          token: data.access_token,
        };

        setUser(userData);
        await SecureStore.setItemAsync("authToken", data.access_token);
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));

        return { success: true };
      } else {
        return { success: false, error: data.detail || "Erro ao fazer login" };
      }
    } catch (error) {
      console.log("Erro no login:", error);
      return { success: false, error: "Erro de conexão" };
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Após registro, fazer login automaticamente
        return await signIn(userData.email, userData.password);
      } else {
        return { success: false, error: data.detail || "Erro ao criar conta" };
      }
    } catch (error) {
      console.log("Erro no registro:", error);
      return { success: false, error: "Erro de conexão" };
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userData");
      setUser(null);
    } catch (error) {
      console.log("Erro ao fazer logout:", error);
    }
  };

  const updateUser = async (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    await SecureStore.setItemAsync("userData", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }
  return context;
};
