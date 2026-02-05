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
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ManageUPIScreen from '../screens/UpiManagementScreen';
import ManageCardsScreen from '../screens/CardsScreen';

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
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  ManageUPI: undefined;
  ManageCards: undefined;
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
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="ManageUPI" component={ManageUPIScreen} />
          <Stack.Screen name="ManageCards" component={ManageCardsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}