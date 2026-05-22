import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : 'An error occurred';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userName}>
              {profile?.full_name || 'User'}
            </Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email || user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {profile?.full_name || 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    color: '#f1f5f9',
    fontSize: 28,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 16,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
