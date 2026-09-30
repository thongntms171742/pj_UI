import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, ShoppingCart, Bell, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { ProductDetailScreen } from '../screens/product/ProductDetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { ReviewScreen } from '../screens/orders/ReviewScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { T, COFFEE, MUTED, LINEN } from '../theme/colors';
import type {
  HomeStackParamList,
  CartStackParamList,
  NotificationStackParamList,
  AccountStackParamList,
  RootTabParamList,
} from './types';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const NotifStack = createNativeStackNavigator<NotificationStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="SearchMain" component={SearchScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </HomeStack.Navigator>
  );
}

function CartStackNav() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="CartMain" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
      <CartStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <CartStack.Screen name="Review" component={ReviewScreen} />
    </CartStack.Navigator>
  );
}

function NotifStackNav() {
  return (
    <NotifStack.Navigator screenOptions={{ headerShown: false }}>
      <NotifStack.Screen name="NotificationsMain" component={NotificationsScreen} />
      <NotifStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </NotifStack.Navigator>
  );
}

function AccountStackNav() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountMain" component={AccountScreen} />
      <AccountStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <AccountStack.Screen name="Review" component={ReviewScreen} />
    </AccountStack.Navigator>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: T,
        tabBarInactiveTintColor: COFFEE,
        tabBarStyle: {
          backgroundColor: LINEN,
          borderTopColor: MUTED,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'HomeTab':
              return <HomeIcon size={size} color={color} />;
            case 'CartTab':
              return <ShoppingCart size={size} color={color} />;
            case 'NotificationsTab':
              return <Bell size={size} color={color} />;
            case 'AccountTab':
              return <User size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="CartTab" component={CartStackNav} options={{ title: 'Giỏ hàng' }} />
      <Tab.Screen name="NotificationsTab" component={NotifStackNav} options={{ title: 'Thông báo' }} />
      <Tab.Screen name="AccountTab" component={AccountStackNav} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}