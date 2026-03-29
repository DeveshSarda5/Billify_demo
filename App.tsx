import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import IntroSplash from './app/components/IntroSplash';
import { AuthProvider } from './app/context/AuthContext';
import { CartProvider } from './app/context/CartContext';
import { LocationProvider } from './app/context/LocationContext';
import { ThemeProvider, useAppTheme } from './app/context/ThemeContext';

function AppShell() {
  const { navigationTheme } = useAppTheme();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <View style={styles.root}>
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
      {showIntro ? <IntroSplash onAnimationComplete={() => setShowIntro(false)} /> : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});