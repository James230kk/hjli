import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  EditProfile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;
