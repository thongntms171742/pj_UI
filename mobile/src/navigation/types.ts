/**
 * Param list definitions for React Navigation.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
  SearchMain: undefined;
  ProductDetail: { productId: string };
};

export type CartStackParamList = {
  CartMain: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
  /** Open review for a specific product within an order. */
  Review: { orderId: string; productId: string; productName: string };
};

export type NotificationStackParamList = {
  NotificationsMain: undefined;
  OrderDetail: { orderId: string };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  OrderDetail: { orderId: string };
  /** Open review for a specific product within an order. */
  Review: { orderId: string; productId: string; productName: string };
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
  NotificationsTab: NavigatorScreenParams<NotificationStackParamList>;
  AccountTab: NavigatorScreenParams<AccountStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<RootTabParamList>;
};