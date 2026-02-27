import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Switch, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [label, setLabel] = useState('');
  const [encrypted, setEncrypted] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();

  const totalAmount = content.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

  const handleContentChange = (index, field, value) => {
    const updated = [...content];
    updated[index][field] = value;
    setContent(updated);
  };

  const addItem = () => setContent([...content, { key: '', value: '' }]);
  const removeItem = (index) => content.length > 1 && setContent(content.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!title || !label) { toast.show('Title and Category are required', { type: 'danger' }); return; }
    if (encrypted && !password) { toast.show('Password required for encrypted hisaab', { type: 'danger' }); return; }
    const validContent = content.filter(i => i.key && i.value);
    if (validContent.length === 0) { toast.show('Add at least one expense item', { type: 'danger' }); return; }
    try {
      setLoading(true);
      await api.post('/hisaabs', { title, label, content: validContent, encrypted, password: encrypted ? password : undefined });
      toast.show('Hisaab created successfully!', { type: 'success' });
      navigation.navigate('Home');
    } catch (err) {
      toast.show(err?.response?.data?.message || 'Failed to create hisaab', { type: 'danger' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Navbar title="KhaataPro" subtitle="Create Hisaab" />
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>➕</Text>
          <Text style={styles.heroTitle}>Create New Hisaab</Text>
          <Text style={styles.heroSub}>Track your expenses with detailed records</Text>
        </View>

        <View style={styles.formCard}>
          {/* Basic Info */}
          <Text style={styles.sectionTitle}>ℹ️ Basic Information</Text>

          <Text style={styles.label}>Title <Text style={styles.req}>*</Text></Text>
          <TextInput style={styles.input} placeholder="e.g., Grocery Shopping" placeholderTextColor="#9ca3af"
            value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Category <Text style={styles.req}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={[styles.catBtn, label === cat && styles.catBtnActive]}
                onPress={() => setLabel(cat)}>
                <Text style={[styles.catBtnText, label === cat && styles.catBtnTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Encryption */}
          <View style={styles.encryptRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.encryptTitle}>🔒 Password Protection</Text>
              <Text style={styles.encryptSub}>Keep this hisaab private</Text>
            </View>
            <Switch value={encrypted} onValueChange={setEncrypted} trackColor={{ true: '#3b82f6' }} />
          </View>
          {encrypted && (
            <TextInput style={styles.input} placeholder="Enter password" placeholderTextColor="#9ca3af"
              value={password} onChangeText={setPassword} secureTextEntry />
          )}

          {/* Expense Items */}
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>🧾 Expense Items</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
              <Text style={styles.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {content.map((item, index) => (
            <View key={index} style={styles.expenseItem}>
              <View style={styles.expenseInputs}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                  placeholder="Item name" placeholderTextColor="#9ca3af"
                  value={item.key} onChangeText={v => handleContentChange(index, 'key', v)} />
                <TextInput style={[styles.input, { width: 110, marginBottom: 0 }]}
                  placeholder="₹ 0.00" placeholderTextColor="#9ca3af"
                  value={item.value} onChangeText={v => handleContentChange(index, 'value', v)}
                  keyboardType="decimal-pad" />
              </View>
              {content.length > 1 && (
                <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>🗑</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.btns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>✓ Create Hisaab</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  hero: { backgroundColor: '#eff6ff', padding: 28, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  heroSub: { fontSize: 14, color: '#6b7280' },
  formCard: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1, marginBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  req: { color: '#ef4444' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827', marginBottom: 14 },
  catScroll: { marginBottom: 14 },
  catBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#f9fafb' },
  catBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  catBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  catBtnTextActive: { color: '#fff' },
  encryptRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, marginBottom: 14 },
  encryptTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  encryptSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addItemBtn: { backgroundColor: '#3b82f6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addItemBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  expenseItem: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 },
  expenseInputs: { flexDirection: 'row', alignItems: 'center' },
  removeBtn: { alignSelf: 'flex-end', marginTop: 6, padding: 4 },
  removeBtnText: { fontSize: 16 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 10, padding: 14, marginBottom: 20 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#3b82f6' },
  btns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#e5e7eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  submitBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
