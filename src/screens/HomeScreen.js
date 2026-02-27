import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ScrollView, ActivityIndicator, Modal, Alert,
  Platform, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import api from '../services/api';

export default function HomeScreen() {
  const [hisaabs, setHisaabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const navigation = useNavigation();
  const toast = useToast();

  useEffect(() => {
    fetchHisaabs();
  }, []);

  const fetchHisaabs = () => {
    setLoading(true);
    api.get('/hisaabs')
      .then(res => setHisaabs(res.data?.hisaabs || res.data))
      .catch(() => navigation.replace('Login'))
      .finally(() => setLoading(false));
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      toast.show('Logged out successfully!', { type: 'success' });
      navigation.replace('Login');
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  const filteredList = () => {
    let filtered = [...hisaabs];
    if (searchTerm) {
      filtered = filtered.filter(h => h.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.date) - new Date(a.date);
        case 'date_asc': return new Date(a.date) - new Date(b.date);
        case 'title_asc': return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
    return filtered;
  };

  const list = filteredList();

  const renderHisaabCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.encrypted ? 'UnlockHisaab' : 'ViewHisaab', { id: item._id })}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDate}>📅 {new Date(item.date).toDateString()}</Text>
        </View>
        <View style={[styles.badge, item.encrypted ? styles.badgeLocked : styles.badgeOpen]}>
          <Text style={[styles.badgeText, item.encrypted ? styles.badgeTextLocked : styles.badgeTextOpen]}>
            {item.encrypted ? '🔒 Locked' : '🔓 Open'}
          </Text>
        </View>
      </View>
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>🏷 {item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navBrand}>KhaataPro</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuModal}>
            {[
              { label: '📊 Dashboard', screen: 'Dashboard' },
              { label: '📷 Scanner', screen: 'Scanner' },
              { label: '💰 Payment Apps', screen: 'Payment' },
              { label: '👥 Rooms', screen: 'Rooms' },
              { label: 'ℹ️ Info Center', screen: 'About' },
            ].map(item => (
              <TouchableOpacity key={item.screen} style={styles.menuItem}
                onPress={() => { setShowMenu(false); navigation.navigate(item.screen); }}>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); handleLogout(); }}>
              <Text style={[styles.menuItemText, styles.menuItemRed]}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🟢 Track expenses. Lock sensitive ledgers.</Text>
          </View>
          <Text style={styles.heroTitle}>Track money{'\n'}<Text style={styles.heroHighlight}>like a pro</Text>.</Text>
          <Text style={styles.heroSub}>A smart Khata Book for personal + shared tracking.</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Hisaabs</Text>
              <Text style={styles.statValue}>{hisaabs.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Locked</Text>
              <Text style={styles.statValue}>{hisaabs.filter(h => h.encrypted).length}</Text>
            </View>
          </View>

          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Create')}>
              <Text style={styles.primaryBtnText}>+ Add New Hisaab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowFilter(!showFilter)}>
              <Text style={styles.secondaryBtnText}>🔽 Filter & Sort</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        {showFilter && (
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>Filters & Sorting</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search by title..."
              placeholderTextColor="#9ca3af"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <Text style={styles.sortLabel}>Sort by:</Text>
            <View style={styles.sortBtns}>
              {[
                { key: 'date_desc', label: 'Newest' },
                { key: 'date_asc', label: 'Oldest' },
                { key: 'title_asc', label: 'A→Z' },
                { key: 'title_desc', label: 'Z→A' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortBtn, sortBy === opt.key && styles.sortBtnActive]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Text style={[styles.sortBtnText, sortBy === opt.key && styles.sortBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => { setSearchTerm(''); setSortBy('date_desc'); }}>
              <Text style={styles.resetText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hisaab List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Your Hisaabs</Text>
            <Text style={styles.listCount}>{list.length} records</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#3b82f6" size="large" style={{ marginTop: 40 }} />
          ) : list.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No Hisaabs Yet</Text>
              <Text style={styles.emptyText}>Start tracking by creating your first hisaab.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Create')}>
                <Text style={styles.primaryBtnText}>+ Create First Hisaab</Text>
              </TouchableOpacity>
            </View>
          ) : (
            list.map(item => <View key={item._id}>{renderHisaabCard({ item })}</View>)
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Create')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  navbar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52,
    paddingBottom: 12,
    elevation: 2,
  },
  navBrand: { fontSize: 26, fontWeight: '800', color: '#3b82f6' },
  menuBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 18, color: '#2563eb' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  menuItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  menuItemRed: { color: '#ef4444' },
  menuDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  scroll: { flex: 1 },
  hero: { padding: 20, paddingTop: 24 },
  heroBadge: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 14 },
  heroBadgeText: { fontSize: 12, color: '#1e40af', fontWeight: '500' },
  heroTitle: { fontSize: 38, fontWeight: '800', color: '#111827', lineHeight: 46, marginBottom: 10 },
  heroHighlight: { color: '#3b82f6' },
  heroSub: { fontSize: 15, color: '#6b7280', marginBottom: 20, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  heroBtns: { gap: 12 },
  primaryBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#111827', fontSize: 15, fontWeight: '600' },
  filterBox: { margin: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  filterTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  searchInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', marginBottom: 12 },
  sortLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  sortBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  sortBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f9fafb' },
  sortBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sortBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  sortBtnTextActive: { color: '#fff' },
  resetText: { color: '#6b7280', fontSize: 13, textAlign: 'right', textDecorationLine: 'underline' },
  listSection: { padding: 16, paddingBottom: 100 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  listTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  listCount: { fontSize: 13, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#6b7280' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeLocked: { backgroundColor: '#fef9c3', borderColor: '#fde68a' },
  badgeOpen: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextLocked: { color: '#854d0e' },
  badgeTextOpen: { color: '#15803d' },
  labelPill: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  labelText: { fontSize: 13, fontWeight: '600', color: '#1e40af' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
