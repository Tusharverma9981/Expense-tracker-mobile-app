import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import Navbar from '../components/Navbar';
import api from '../services/api';

const TABS = [
  { key: 'create', label: '➕ Create' },
  { key: 'myRooms', label: '👤 My Rooms' },
  { key: 'allRooms', label: '🚪 All Rooms' },
];

export default function RoomsScreen() {
  const [activeTab, setActiveTab] = useState('create');
  const [form, setForm] = useState({ name: '', description: '', password: '' });
  const [allRooms, setAllRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const filteredAllRooms = useMemo(() =>
    search.trim() ? allRooms.filter(r => r?.name?.toLowerCase().includes(search.toLowerCase())) : allRooms,
    [allRooms, search]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.get('/rooms');
      setAllRooms(res.data.allRooms || []);
      setMyRooms(res.data.myRooms || []);
    } catch (err) {
      toast.show(err?.response?.data?.message || 'Failed to load rooms', { type: 'danger' });
    } finally { setLoadingRooms(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreateRoom = async () => {
    if (!form.name || !form.password) { toast.show('Room name and password required', { type: 'danger' }); return; }
    try {
      await api.post('/rooms', form);
      toast.show('Room created ✅', { type: 'success' });
      setForm({ name: '', description: '', password: '' });
      setActiveTab('myRooms');
      fetchRooms();
    } catch (err) {
      toast.show(err?.response?.data?.message || 'Create room failed', { type: 'danger' });
    }
  };

  const RoomCard = ({ room, showJoin }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomCardTop}>
        <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
        <View style={[styles.roomBadge, showJoin ? styles.roomBadgeGray : styles.roomBadgeBlue]}>
          <Text style={styles.roomBadgeText}>{showJoin ? '🌐 Public' : '✅ Active'}</Text>
        </View>
      </View>
      <Text style={styles.roomDesc} numberOfLines={2}>{room.description || 'No description'}</Text>
      <View style={styles.roomFooter}>
        <Text style={styles.roomMeta}>👥 {room.members?.length || 0} members</Text>
        {showJoin ? (
          <TouchableOpacity><Text style={styles.joinText}>Join →</Text></TouchableOpacity>
        ) : (
          <Text style={styles.roomMeta}>🔒 Protected</Text>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Navbar title="KhaataPro" subtitle="Rooms" />

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Room */}
      {activeTab === 'create' && (
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.createHero}>
            <View style={styles.createIcon}><Text style={styles.createIconText}>➕</Text></View>
            <Text style={styles.createTitle}>Create a Room</Text>
            <Text style={styles.createSub}>Add a shared room to track expenses together.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>🚪 Room Name</Text>
            <TextInput style={styles.input} placeholder="E.g. Flatmates Expenses" placeholderTextColor="#9ca3af"
              value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />

            <Text style={styles.label}>📄 Description (optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Short note about this room..."
              placeholderTextColor="#9ca3af" value={form.description} multiline numberOfLines={3}
              onChangeText={v => setForm(p => ({ ...p, description: v }))} />

            <Text style={styles.label}>🔒 Room Password</Text>
            <TextInput style={styles.input} placeholder="Set a secure password" placeholderTextColor="#9ca3af"
              value={form.password} onChangeText={v => setForm(p => ({ ...p, password: v }))} secureTextEntry />
            <Text style={styles.hint}>Share this with members to join the room</Text>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreateRoom}>
              <Text style={styles.createBtnText}>➕ Create Room</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* My Rooms */}
      {activeTab === 'myRooms' && (
        <ScrollView style={styles.scroll}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 My Rooms</Text>
            {loadingRooms ? <ActivityIndicator color="#3b82f6" /> :
              myRooms.length === 0 ? <Text style={styles.emptyText}>You haven't joined any room.</Text> :
                myRooms.map(room => <RoomCard key={room._id} room={room} showJoin={false} />)
            }
            <Text style={styles.totalText}>Total: {myRooms.length} rooms</Text>
          </View>
        </ScrollView>
      )}

      {/* All Rooms */}
      {activeTab === 'allRooms' && (
        <ScrollView style={styles.scroll}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚪 All Rooms</Text>
            <TextInput style={[styles.input, styles.searchInput]} placeholder="🔍 Search rooms..."
              placeholderTextColor="#9ca3af" value={search} onChangeText={setSearch} />
            {loadingRooms ? <ActivityIndicator color="#3b82f6" /> :
              filteredAllRooms.map(room => <RoomCard key={room._id} room={room} showJoin={true} />)
            }
            <TouchableOpacity onPress={fetchRooms} style={styles.refreshBtn}>
              <Text style={styles.refreshText}>↻ Refresh Rooms</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  createHero: { alignItems: 'center', padding: 28, backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  createIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  createIconText: { fontSize: 24 },
  createTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  createSub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  formCard: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827', marginBottom: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  searchInput: { marginBottom: 12 },
  hint: { fontSize: 12, color: '#6b7280', marginTop: -12, marginBottom: 18 },
  createBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  section: { padding: 16, paddingBottom: 60 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  roomCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12, elevation: 1 },
  roomCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  roomName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827', marginRight: 10 },
  roomBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  roomBadgeBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  roomBadgeGray: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  roomBadgeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  roomDesc: { fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 18 },
  roomFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomMeta: { fontSize: 12, color: '#6b7280' },
  joinText: { fontSize: 13, color: '#3b82f6', fontWeight: '700' },
  emptyText: { color: '#6b7280', fontSize: 14, marginBottom: 16 },
  totalText: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 12 },
  refreshBtn: { alignItems: 'center', marginTop: 16 },
  refreshText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },
});
