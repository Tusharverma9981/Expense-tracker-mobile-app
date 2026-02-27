import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Clipboard, Platform, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Navbar';

// NOTE: QR scanning requires a native module.
// Install: npm install react-native-qrcode-scanner react-native-camera
// For modern setups use: npm install react-native-vision-camera vision-camera-code-scanner
// This screen shows a placeholder with instructions when the native module is not available.

let QRCodeScanner = null;
try {
  QRCodeScanner = require('react-native-qrcode-scanner').default;
} catch (e) {
  // Native module not available
}

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('Tap "Start Scanning" to begin');
  const navigation = useNavigation();

  const onSuccess = (e) => {
    const data = e?.data || e;
    setResult(data);
    setStatus('QR Code scanned successfully! ✅');
    setIsScanning(false);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await Clipboard.setString(result);
    setStatus('Copied to clipboard ✅');
  };

  const useData = () => {
    if (!result) return;
    try {
      const parsed = JSON.parse(result);
      Alert.alert('QR Data Parsed', 'JSON data detected. Check console.', [
        { text: 'OK' }
      ]);
    } catch (e) {
      Alert.alert('QR Data', result);
    }
  };

  const clearResult = () => {
    setResult('');
    setStatus('Tap "Start Scanning" to begin');
  };

  // If QRCodeScanner native module is available, show real scanner
  if (isScanning && QRCodeScanner) {
    return (
      <View style={{ flex: 1 }}>
        <QRCodeScanner
          onRead={onSuccess}
          topContent={
            <Text style={styles.scanTopText}>Point camera at a QR code</Text>
          }
          bottomContent={
            <TouchableOpacity style={[styles.btn, styles.dangerBtn]} onPress={() => setIsScanning(false)}>
              <Text style={styles.btnText}>⬛ Stop Scanning</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar title="KhaataPro" subtitle="QR Scanner" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>📷 QR Code Scanner</Text>
          <Text style={styles.heroSub}>Scan QR codes to quickly add expense data</Text>
        </View>

        {/* Scanner Area */}
        <View style={styles.card}>
          <View style={styles.scannerBox}>
            {isScanning && !QRCodeScanner ? (
              // Fallback UI when no native QR module
              <View style={styles.scannerPlaceholder}>
                <Text style={styles.scannerPlaceholderText}>📷</Text>
                <Text style={styles.scannerNote}>
                  Camera scanning requires the native module.{'\n'}
                  Install: react-native-qrcode-scanner
                </Text>
              </View>
            ) : (
              <View style={styles.scannerPlaceholder}>
                <Text style={styles.scannerPlaceholderText}>📷</Text>
                <Text style={styles.scannerNote}>Camera view will appear here</Text>
              </View>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {!isScanning ? (
              <TouchableOpacity style={styles.btn} onPress={() => setIsScanning(true)}>
                <Text style={styles.btnText}>📷 Start Scanning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.dangerBtn]} onPress={() => { setIsScanning(false); setStatus('Scanning stopped'); }}>
                <Text style={styles.btnText}>⬛ Stop Scanning</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, styles.secondaryBtn]}
              onPress={() => Alert.alert('Upload', 'Image upload requires a file picker library like react-native-image-picker')}>
              <Text style={[styles.btnText, styles.secondaryBtnText]}>⬆ Upload QR Image</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.statusText}>{status}</Text>
        </View>

        {/* Result Card */}
        {result ? (
          <View style={styles.card}>
            <View style={styles.resultHeader}>
              <Text style={styles.cardTitle}>Scanned Result</Text>
              <TouchableOpacity onPress={clearResult}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
            <View style={styles.resultBtns}>
              <TouchableOpacity style={styles.btn} onPress={copyToClipboard}>
                <Text style={styles.btnText}>📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.greenBtn]} onPress={useData}>
                <Text style={styles.btnText}>✓ Use Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* How to Use */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ How to Use</Text>
          {[
            'Tap "Start Scanning" to activate your camera',
            'Point your camera at a QR code',
            'Or upload a QR code image from your device',
            'The scanned data will appear below for you to use',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>✔</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  hero: { padding: 24, alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  heroSub: { fontSize: 14, color: '#6b7280' },
  card: { margin: 16, marginTop: 4, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },
  scannerBox: { height: 220, backgroundColor: '#f3f4f6', borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', overflow: 'hidden', marginBottom: 16, justifyContent: 'center', alignItems: 'center' },
  scannerPlaceholder: { alignItems: 'center', padding: 20 },
  scannerPlaceholderText: { fontSize: 56, marginBottom: 12 },
  scannerNote: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  scanTopText: { fontSize: 16, color: '#fff', marginBottom: 10 },
  controls: { gap: 10, marginBottom: 14 },
  btn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  dangerBtn: { backgroundColor: '#ef4444' },
  greenBtn: { backgroundColor: '#10b981' },
  secondaryBtn: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryBtnText: { color: '#374151' },
  statusText: { textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#6b7280' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeBtn: { fontSize: 16, color: '#6b7280', padding: 4 },
  resultBox: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8, padding: 12, marginBottom: 14 },
  resultText: { color: '#15803d', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 },
  resultBtns: { flexDirection: 'row', gap: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipDot: { color: '#3b82f6', fontSize: 14, marginRight: 10, marginTop: 1 },
  tipText: { flex: 1, fontSize: 14, color: '#4b5563', lineHeight: 20 },
});
