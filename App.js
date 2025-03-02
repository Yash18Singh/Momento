import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StackNavigator from './StackNavigator';

import * as Font from 'expo-font';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_900Black } from '@expo-google-fonts/poppins';
import { DeliusSwashCaps_400Regular } from '@expo-google-fonts/delius-swash-caps';
import { ChakraPetch_700Bold, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { AuthProvider } from './AuthContext';
import { DynaPuff_400Regular, DynaPuff_500Medium, DynaPuff_600SemiBold, DynaPuff_700Bold } from '@expo-google-fonts/dynapuff';
import { Truculenta_400Regular, Truculenta_500Medium, Truculenta_700Bold, Truculenta_900Black } from '@expo-google-fonts/truculenta';
import { Jost_400Regular, Jost_500Medium, Jost_700Bold, Jost_800ExtraBold } from '@expo-google-fonts/jost';
import { Candal_400Regular } from '@expo-google-fonts/candal';

export default function App() {
  const [fontsLoaded] = Font.useFonts({
    'font-reg':Jost_400Regular,
    'font-med':Jost_500Medium,
    'font-bold':Jost_700Bold,
    'font-extra':Jost_800ExtraBold,
    'font-logo':DeliusSwashCaps_400Regular,
    'font-head-bold':Candal_400Regular,
    'font-head-semi':Candal_400Regular
  });

  if (!fontsLoaded) {
    return null; // Show loading screen while fonts load
  }


  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
}

