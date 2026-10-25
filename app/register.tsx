import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../Store/authStore';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const registerUser = useAuthStore((state) => state.registerUser);
  const router = useRouter();

  const handleRegister = async () => {
    setMessage(null);

    if (!username.trim() || !password || !confirmPassword) {
      setMessage({ text: 'Vui lòng nhập đầy đủ các trường bắt buộc!', isError: true });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Mật khẩu xác nhận không trùng khớp!', isError: true });
      return;
    }

    const res = await registerUser(username.trim(), password, fullName.trim());

    if (res.success) {
      setMessage({ text: '🎉 ' + res.message + ' Đang chuyển hướng...', isError: false });
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } else {
      setMessage({ text: res.message, isError: true });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký Tài Khoản</Text>

      {message && (
        <View style={[styles.alertBox, message.isError ? styles.alertError : styles.alertSuccess]}>
          <Text style={message.isError ? styles.errorText : styles.successText}>{message.text}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập / Mã sinh viên (*)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Họ và tên người dùng"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu (*)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu (*)"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#007aff' },
  alertBox: { padding: 10, borderRadius: 6, marginBottom: 16 },
  alertError: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', borderWidth: 1 },
  alertSuccess: { backgroundColor: '#d4edda', borderColor: '#c3e6cb', borderWidth: 1 },
  errorText: { color: '#721c24', textAlign: 'center', fontWeight: 'bold' },
  successText: { color: '#155724', textAlign: 'center', fontWeight: 'bold' },
  input: { height: 48, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 14, marginBottom: 14, backgroundColor: '#fff' },
  button: { backgroundColor: '#007aff', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6c757d', fontSize: 14 },
  linkBold: { color: '#007aff', fontWeight: 'bold' },
});