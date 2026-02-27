import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import Navbar from '../components/Navbar';

const FEATURES = [
  { icon: '➕', title: 'Add Your Hisaab', desc: 'Create an expense quickly for any transaction with just a few clicks.' },
  { icon: '👥', title: 'Create Rooms', desc: 'Manage shared group expenses with friends, family, and roommates.' },
  { icon: '💰', title: 'Add Payment Apps', desc: 'Link UPI apps like GPay, PhonePe, or Paytm for seamless payments.' },
  { icon: '📊', title: 'Track Expenses', desc: 'Filter, sort, and manage all your transaction history easily.' },
  { icon: '📷', title: 'QR Code Scanning', desc: 'Scan receipts and QR codes to automatically add expenses.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your financial data is encrypted and completely secure.' },
];

const STATS = [
  { val: '10K+', label: 'Active Users' },
  { val: '50K+', label: 'Expenses Tracked' },
  { val: '99.9%', label: 'Uptime' },
  { val: '24/7', label: 'Support' },
];

export default function AboutScreen() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    Alert.alert('Success', 'Message sent successfully!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Navbar title="KhaataPro" subtitle="Info Center" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>ℹ️</Text>
          <Text style={styles.heroTitle}>About KhaataPro</Text>
          <Text style={styles.heroSub}>Your modern companion for tracking expenses and managing finances</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            KhaataPro is a modern expense tracking tool designed for individuals, groups, and roommates.
            We believe managing money shouldn't be complicated.
          </Text>
          <Text style={styles.sectionText}>
            Our simple UI, fast performance, and UPI integration make it the easiest way to stay organized financially.
          </Text>

          {/* Stats */}
          <View style={styles.statsGrid}>
            {STATS.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ How It Works</Text>
          <Text style={styles.sectionSubtitle}>Everything you need to manage your expenses efficiently</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIcon}><Text style={styles.featureIconText}>{f.icon}</Text></View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <View style={[styles.section, styles.contactSection]}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.sectionTitle}>Get In Touch</Text>
            <Text style={styles.sectionSubtitle}>Have a question? We'd love to hear from you</Text>
          </View>

          <Text style={styles.label}>Your Name</Text>
          <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#9ca3af"
            value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#9ca3af"
            value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))}
            keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Message</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Write your message here..."
            placeholderTextColor="#9ca3af" value={form.message}
            onChangeText={v => setForm(p => ({ ...p, message: v }))} multiline numberOfLines={5}
            textAlignVertical="top" />

          <TouchableOpacity style={[styles.submitBtn, submitting && styles.btnDisabled]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>✈️ Send Message</Text>}
          </TouchableOpacity>

          <Text style={styles.emailText}>support@khaatapro.com</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  hero: { backgroundColor: '#eff6ff', padding: 32, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  section: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1, marginBottom: 8 },
  contactSection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  sectionText: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  statBox: { flex: 1, minWidth: '44%', backgroundColor: '#eff6ff', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' },
  statVal: { fontSize: 26, fontWeight: '800', color: '#3b82f6', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  featuresGrid: { gap: 10 },
  featureCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  featureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureIconText: { fontSize: 22 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  contactHeader: { alignItems: 'center', marginBottom: 20 },
  contactIcon: { fontSize: 36, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', marginBottom: 16 },
  textArea: { height: 120 },
  submitBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emailText: { textAlign: 'center', fontSize: 14, color: '#3b82f6', fontWeight: '500' },
});
