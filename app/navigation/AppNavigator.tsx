import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LocationPermissionScreen from '../screens/LocationPermissionScreen';
import ScanScreen from '../screens/ScanScreen';
import StoreSelectionScreen from '../screens/StoreSelectionScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ExitPassScreen from '../screens/ExitPassScreen';
import PreviousBillsScreen from '../screens/PreviousBillsScreen';
import BillDetailsScreen from '../screens/BillDetailsScreen';
import OffersScreen from '../screens/OffersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import TicketDetailsScreen from '../screens/TicketDetailsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ManageUPIScreen from '../screens/UpiManagementScreen';
import ManageCardsScreen from '../screens/CardsScreen';
import RazorpayCheckoutScreen from '../screens/RazorpayCheckoutScreen';
import { useLocation } from '../context/LocationContext';

export type RazorpayCheckoutParams = {
  requestId: string;
  keyId: string;
  orderId: string;
  amount: number;
  amountRupees: number;
  currency: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  LocationPermission: undefined;
  StoreSelection: { mode?: 'manual' | 'nearby'; returnTo?: 'root' | 'back' } | undefined;
  Dashboard: undefined;
  Scan: undefined;
  Cart: { barcode: string };
  Payment: { total: number };
  PaymentMethods: undefined;
  ExitPass: { billId?: string; amountPaid?: number; issuedAt?: string };
  PreviousBills: undefined;
  BillDetails: { bill: any };
  Offers: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  TicketDetails: { ticketId: string };
  PrivacyPolicy: undefined;
  ManageUPI: undefined;
  ManageCards: undefined;
  RazorpayCheckout: RazorpayCheckoutParams;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuth();
  const { hasSelectedStore, isHydratingSelection } = useLocation();
  const { colors } = useAppTheme();

  if (loading || isHydratingSelection) {
    return (
      <>
        <StatusBar style={colors.statusBar} />
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          hasSelectedStore ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="StoreSelection" component={StoreSelectionScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Scan" component={ScanScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
              <Stack.Screen name="ExitPass" component={ExitPassScreen} />
              <Stack.Screen name="PreviousBills" component={PreviousBillsScreen} />
              <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
              <Stack.Screen name="Offers" component={OffersScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
              <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
              <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="ManageUPI" component={ManageUPIScreen} />
              <Stack.Screen name="ManageCards" component={ManageCardsScreen} />
              <Stack.Screen name="RazorpayCheckout" component={RazorpayCheckoutScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} options={{ animation: 'fade_from_bottom' }} />
              <Stack.Screen name="StoreSelection" component={StoreSelectionScreen} options={{ animation: 'slide_from_right' }} />
            </>
          )
        )}
      </Stack.Navigator>
    </>
  );
}