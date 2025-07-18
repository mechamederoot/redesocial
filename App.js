import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { Provider as PaperProvider } from "react-native-paper";

// Screens
import AuthScreen from "./src/screens/AuthScreen";
import MainTabNavigator from "./src/navigation/MainTabNavigator";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CameraScreen from "./src/screens/CameraScreen";

// Context
import { AuthProvider, useAuth } from "./src/context/AuthContext";

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Ou um loading screen personalizado
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#ffffff" },
        }}
      >
        {user ? (
          // Usuário logado
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{
                headerShown: true,
                title: "Post",
                headerStyle: { backgroundColor: "#ffffff" },
                headerTintColor: "#000000",
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: "Perfil",
                headerStyle: { backgroundColor: "#ffffff" },
                headerTintColor: "#000000",
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
          </>
        ) : (
          // Usuário não logado
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
