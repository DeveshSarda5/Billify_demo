import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScanScreen from '../screens/ScanScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ExitPassScreen from '../screens/ExitPassScreen';
import PreviousBillsScreen from '../screens/PreviousBillsScreen';
import BillDetailsScreen from '../screens/BillDetailsScreen';
import OffersScreen from '../screens/OffersScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  Scan: undefined;
  Cart: { barcode: string };
  Payment: { total: number };
  PaymentMethods: undefined;
  ExitPass: undefined;
  PreviousBills: undefined;
  BillDetails: { billId: string };
  Offers: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="ExitPass" component={ExitPassScreen} />
          <Stack.Screen name="PreviousBills" component={PreviousBillsScreen} />
          <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
          <Stack.Screen name="Offers" component={OffersScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}