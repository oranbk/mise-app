import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import RecipeViewScreen from './src/screens/RecipeViewScreen';
import VoiceModeScreen from './src/screens/VoiceModeScreen';
import SavedRecipesScreen from './src/screens/SavedRecipesScreen';

import { preloadAllAds, showAppOpenAd } from './src/services/admob';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Preload all ads on startup
    preloadAllAds();
    // Show App Open ad after short delay (let app render first)
    const timer = setTimeout(() => {
      showAppOpenAd();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#0a0a0a' },
              headerTintColor: '#E8C547',
              headerTitleStyle: { fontWeight: 'bold' },
              contentStyle: { backgroundColor: '#0a0a0a' },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Mise' }}
            />
            <Stack.Screen
              name="RecipeView"
              component={RecipeViewScreen}
              options={{ title: 'Recipe' }}
            />
            <Stack.Screen
              name="VoiceMode"
              component={VoiceModeScreen}
              options={{ title: 'Voice Mode', headerShown: false }}
            />
            <Stack.Screen
              name="SavedRecipes"
              component={SavedRecipesScreen}
              options={{ title: 'Saved Recipes' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
