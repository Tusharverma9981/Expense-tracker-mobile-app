import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function ViewHisaabScreen() {
  const [hisaab, setHisaab] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const { id, hisaabData } = route.params || {};

  useEffect(() => {
    if (hisaabData) {
      setHisaab(hisaabData);
      setLoading(false);
      return;
    }
    if (id) {
      api.get(`/hisaabs/${id}`)
        .then(res => { setHisaab(res.data); setLoading(false); })
        .catch(() => { Alert.alert('Error', 'Failed to load hisaab'); navigation.navigate('Home'); });
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Hisaab', 'Are you sure you want to delete this hisaab?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/hisaabs/${hisaab._id || id}`);
            toast.show('Hisaab deleted!', { type: 'success' });
            navigation.navigate('Home');
          } catch { toast.show('Failed to delete hisaab', { type: 'danger' }); }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#3b82f6" size="large" />
        <Text style={styles.loadingText}>Loading hisaab...</Text>
      </View>
    );
  }
  if (!hisaab) return null;

  const total = hisaab.content.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);

  return (
    <View style={styles.container}>
      <Navbar title="KhaataPro" subtitle="View Hisaab" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.hisaabTitle}>{hisaab.title}</Text>
            <Text style={styles.hisaabDate}>📅 {new Date(hisaab.date).toDateString()}</Text>
            <View style={styles.labelPill}>
              <Text style={styles.labelText}>🏷 {hisaab.label}</Text>
            </View>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.editBtn}
              onPress={() => navigation.navigate('EditHisaab', { id: hisaab._id })}>
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expense Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expense Details</Text>
          {hisaab.content.map((item, index) => (
            <View key={index} style={styles.expenseRow}>
              <Text style={styles.expenseKey}>{item.key}</Text>
              <Text style={styles.expenseValue}>₹ {item.value}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹ {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Distribution Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expense Analytics</Text>
          <Text style={styles.analyticsNote}>Distribution of expenses by item</Text>
          {hisaab.content.map((item, index) => {
            const pct = ((parseFloat(item.value) / total) * 100).toFixed(1);
            const colors = ['#3b82f6', '#60a5fa', '#2563eb', '#93c5fd', '#dbeafe', '#1e40af'];
            const color = colors[index % colors.length];
            return (
              <View key={index} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>{item.key}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(4, parseFloat(pct))}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.barPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backBtnText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 15 },
  header: { backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 20 },
  headerLeft: { marginBottom: 14 },
  hisaabTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6 },
  hisaabDate: { fontSize: 14, color: '#6b7280', marginBottom: 10 },
  labelPill: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  labelText: { fontSize: 13, color: '#1e40af', fontWeight: '600' },
  actionBtns: { flexDirection: 'row', gap: 10 },
  editBtn: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff' },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  deleteBtn: { flex: 1, borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff' },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', padding: 16, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  expenseKey: { fontSize: 15, fontWeight: '500', color: '#111827', flex: 1 },
  expenseValue: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderTopWidth: 2, borderTopColor: '#d1d5db' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#3b82f6' },
  analyticsNote: { fontSize: 13, color: '#6b7280', paddingHorizontal: 16, paddingBottom: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  barLabel: { width: 90, fontSize: 12, color: '#374151', fontWeight: '500' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: 8, borderRadius: 4 },
  barPct: { width: 40, fontSize: 12, color: '#6b7280', textAlign: 'right' },
  backBtn: { margin: 16, marginBottom: 40, backgroundColor: '#f3f4f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
});
