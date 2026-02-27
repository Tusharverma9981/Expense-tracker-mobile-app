import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastProvider } from 'react-native-toast-notifications';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CreateScreen from '../screens/CreateScreen';
import ViewHisaabScreen from '../screens/ViewHisaabScreen';
import EditHisaabScreen from '../screens/EditHisaabScreen';
import RoomsScreen from '../screens/RoomsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ScannerScreen from '../screens/ScannerScreen';
import AboutScreen from '../screens/AboutScreen';
import UnlockHisaabScreen from '../screens/UnlockHisaabScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Create" component={CreateScreen} />
          <Stack.Screen name="ViewHisaab" component={ViewHisaabScreen} />
          <Stack.Screen name="EditHisaab" component={EditHisaabScreen} />
          <Stack.Screen name="Rooms" component={RoomsScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="UnlockHisaab" component={UnlockHisaabScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}
