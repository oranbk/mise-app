import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import RecipeViewScreen from '../screens/RecipeViewScreen';
import VoiceModeScreen from '../screens/VoiceModeScreen';
import SavedRecipesScreen from '../screens/SavedRecipesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: '#E8C547',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'New Recipe',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🍳</Text>,
        }}
      />
      <Tab.Screen
        name="SavedRecipes"
        component={SavedRecipesScreen}
        options={{
          tabBarLabel: 'My Recipes',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📚</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RecipeView" component={RecipeViewScreen} />
        <Stack.Screen name="VoiceMode" component={VoiceModeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
