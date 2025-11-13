import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, 
  ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseconfig';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!fullName || !email || !course || !year || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // 🔹 Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔹 Update display name (optional)
      await updateProfile(user, { displayName: fullName });

      // 🔹 Save extra user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: fullName,
        email,
        course,
        year,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Login');
    } catch (error) {
      console.log(error);
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.topArea}>
            <Image
              source={require('../assets/logos.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formArea}>
            <Text style={styles.headerText}>Create Account</Text>

            <Text style={styles.label}>Full Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Course:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your course"
              placeholderTextColor="#666"
              value={course}
              onChangeText={setCourse}
            />

            <Text style={styles.label}>Year Level:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your year level (e.g., 3rd Year)"
              placeholderTextColor="#666"
              value={year}
              onChangeText={setYear}
            />

            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.text}>
              Already have an account?{' '}
              <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                Log In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#800000',
  },
  topArea: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  logo: {
    width: 90,
    height: 90,
  },
  formArea: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#800000',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    color: '#800000',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    color: '#000',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#800000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 15,
    textAlign: 'center',
  },
  link: {
    color: '#800000',
    textDecorationLine: 'underline',
  },
});
