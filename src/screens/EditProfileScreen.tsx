import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  EditProfile: undefined;
};

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditProfile'
>;

type Props = {
  navigation: EditProfileScreenNavigationProp;
};

export default function EditProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } else if (data) {
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } else {
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor="#94a3b8"
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
});
