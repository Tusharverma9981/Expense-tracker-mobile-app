import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Navbar';
import api from '../services/api';

function StatCard({ title, value, emoji, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [hisaabTotals, setHisaabTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        setExpensesByCategory(res.data.expensesByCategory || []);
        setHisaabTotals(res.data.hisaabTotals || []);
        setLoading(false);
      })
      .catch(() => navigation.replace('Login'));
  }, []);

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#3b82f6" size="large" />
    </View>
  );

  const totalExpenses = expensesByCategory.reduce((s, i) => s + i.totalAmount, 0);
  const totalHisaabs = hisaabTotals.length;
  const avgPerHisaab = totalHisaabs > 0 ? totalExpenses / totalHisaabs : 0;
  const sorted = [...expensesByCategory].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);
  const maxAmount = sorted[0]?.totalAmount || 1;
  const colors = ['#3b82f6', '#60a5fa', '#2563eb', '#93c5fd', '#bfdbfe'];
  const empty = expensesByCategory.length === 0 && hisaabTotals.length === 0;

  return (
    <View style={styles.container}>
      <Navbar title="KhaataPro" subtitle="Analytics Dashboard" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Expense Dashboard</Text>
          <Text style={styles.pageSub}>Visual breakdown of your spending patterns</Text>
          <View style={styles.headerBtns}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Create')}>
              <Text style={styles.primaryBtnText}>+ Add Hisaab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Scanner')}>
              <Text style={styles.secondaryBtnText}>📷 Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {empty ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Analytics Yet</Text>
            <Text style={styles.emptyText}>Create a hisaab and add expenses to unlock charts.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Create')}>
              <Text style={styles.primaryBtnText}>+ Create First Hisaab</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stat Cards */}
            <View style={styles.statsGrid}>
              <StatCard title="Total Expenses" value={`₹${totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} emoji="💰" color="#3b82f6" />
              <StatCard title="Total Hisaabs" value={`${totalHisaabs}`} emoji="📒" color="#8b5cf6" />
              <StatCard title="Avg per Hisaab" value={`₹${Math.round(avgPerHisaab).toLocaleString('en-IN')}`} emoji="📊" color="#f59e0b" />
              <StatCard title="Categories" value={`${expensesByCategory.length}`} emoji="🏷" color="#10b981" />
            </View>

            {/* Category Bar Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏆 Expenses by Category</Text>
              {sorted.map((cat, index) => {
                const pct = ((cat.totalAmount / maxAmount) * 100).toFixed(0);
                return (
                  <View key={cat._id} style={styles.barRow}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barIndex}>{index + 1}</Text>
                      <Text style={styles.barCatName} numberOfLines={1}>{cat._id}</Text>
                      <Text style={styles.barAmount}>₹{cat.totalAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors[index] }]} />
                    </View>
                    <Text style={styles.barPct}>{((cat.totalAmount / totalExpenses) * 100).toFixed(1)}% of total</Text>
                  </View>
                );
              })}
            </View>

            {/* Recent Hisaabs */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🕐 Recent Activity</Text>
              {hisaabTotals.slice(0, 5).map(h => (
                <View key={h._id} style={styles.activityRow}>
                  <View style={styles.activityIcon}><Text style={styles.activityIconEmoji}>🧾</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{h.title}</Text>
                    <Text style={styles.activitySub}>Added recently</Text>
                  </View>
                  <Text style={styles.activityAmount}>₹{h.totalValue.toLocaleString('en-IN')}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  pageHeader: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pageSub: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  headerBtns: { flexDirection: 'row', gap: 10 },
  primaryBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryBtn: { flex: 1, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, gap: 8, marginBottom: 8 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', width: '47%', elevation: 1 },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  statTitle: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  card: { margin: 16, marginTop: 8, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  barRow: { marginBottom: 14 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barIndex: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#eff6ff', textAlign: 'center', lineHeight: 22, fontSize: 12, fontWeight: '700', color: '#1e40af', marginRight: 8 },
  barCatName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  barAmount: { fontSize: 14, fontWeight: '700', color: '#3b82f6' },
  barTrack: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: 10, borderRadius: 5 },
  barPct: { fontSize: 11, color: '#6b7280' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityIconEmoji: { fontSize: 18 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  activitySub: { fontSize: 12, color: '#6b7280' },
  activityAmount: { fontSize: 15, fontWeight: '700', color: '#111827' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
});
