import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { AuthProvider } from './app/context/AuthContext';
import { CartProvider } from './app/context/CartContext';
import { LocationProvider } from './app/context/LocationContext';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}