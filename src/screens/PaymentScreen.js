import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Navbar';
import api from '../services/api';

const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'];

export default function PaymentScreen() {
  const [appName, setAppName] = useState('Google Pay');
  const [upiId, setUpiId] = useState('');
  const [nickname, setNickname] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!upiId.trim()) { Alert.alert('Error', 'UPI ID is required'); return; }
    try {
      await api.post('/payment-app/add', { appName, upiId, nickname });
      Alert.alert('Success', 'Payment app added ✅');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add payment app');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Navbar title="KhaataPro" subtitle="Payment App" />
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Add Payment App</Text>
          <Text style={styles.heroSub}>Connect your UPI app for faster transactions.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Select UPI App</Text>
          <View style={styles.appGrid}>
            {UPI_APPS.map(app => (
              <TouchableOpacity key={app} style={[styles.appBtn, appName === app && styles.appBtnActive]}
                onPress={() => setAppName(app)}>
                <Text style={[styles.appBtnText, appName === app && styles.appBtnTextActive]}>{app}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>UPI ID</Text>
          <TextInput style={styles.input} placeholder="yourname@upi" placeholderTextColor="#9ca3af"
            value={upiId} onChangeText={setUpiId} autoCapitalize="none" />

          <Text style={styles.label}>Nickname (optional)</Text>
          <TextInput style={styles.input} placeholder="E.g. My GPay" placeholderTextColor="#9ca3af"
            value={nickname} onChangeText={setNickname} />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>➕ Add Payment App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  hero: { padding: 28, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  heroSub: { fontSize: 14, color: '#6b7280' },
  formCard: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  appBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f9fafb' },
  appBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  appBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  appBtnTextActive: { color: '#fff' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', marginBottom: 18 },
  submitBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
