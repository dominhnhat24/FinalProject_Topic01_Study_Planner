import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../Store/authStore';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('1923051143');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const signIn = useAuthStore((state) => state.signIn);
  const loadSession = useAuthStore((state) => state.loadSession);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (token) {
      router.replace('/(tabs)');
    }
  }, [token]);

  const handleLogin = async () => {
    setErrorText('');
    if (!username.trim() || !password) {
      setErrorText('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const res = await signIn(username.trim(), password);
    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setErrorText(res.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Planner</Text>
      <Text style={styles.subtitle}>Hệ thống Quản lý Tiến độ Học tập</Text>

      {errorText ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập / Mã SV"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Chưa có tài khoản? <Text style={styles.linkBold}>Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: '#007aff' },
  subtitle: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginBottom: 24 },
  errorBox: { backgroundColor: '#f8d7da', padding: 10, borderRadius: 6, marginBottom: 14 },
  errorText: { color: '#721c24', textAlign: 'center', fontWeight: 'bold' },
  input: { height: 48, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 14, marginBottom: 14, backgroundColor: '#fff' },
  button: { backgroundColor: '#007aff', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6c757d', fontSize: 14 },
  linkBold: { color: '#007aff', fontWeight: 'bold' },
});