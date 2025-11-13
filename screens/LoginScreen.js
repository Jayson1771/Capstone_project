import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { auth } from '../firebaseconfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
    if (user) {
        navigation.replace('Home'); 
        }
 });
 return unsubscribe;
 }, [navigation]);
// In LoginScreen
const handleLogin = async () => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, 'users', userCredential.user.uid);
  const userSnap = await getDoc(userRef);

  const data = userSnap.exists() ? userSnap.data() : {};
  navigation.replace('Home', { userData: data });
};

    

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        {/* Replace with your logo image */}
        <Image
          source={require('../assets/logos.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formArea}>
        <Text style={styles.label}>Email:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Password:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {/* Optionally an icon to toggle show/hide */}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <Text style = {styles.text}>Don't have an account? <Text style = {styles.link} onPress={() => navigation.navigate('SignUp')}>
            SignUp
        </Text></Text>

        <TouchableOpacity onPress={() => {/* remember password logic */}}>
          <Text style={styles.rememberText}>Forget Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#800000', // maroon for top area background (adjust)  
  },
  topArea: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    // maybe some padding
  },
  logo: {
    width: 150,
    height: 150,
    // optional margin
  },
  formArea: {
    flex: 0.6,
    backgroundColor: '#FFF8F0', // light cream / off white  
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#800000',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#D3D3D3', // light grey  
    borderRadius: 10,
    marginTop: 5,
    padding: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#800000', // same maroon  
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFD700', // gold/yellow text  
    fontSize: 18,
    fontWeight: 'bold',
  },
  rememberText: {
    marginTop: 15,
    alignSelf: 'center',
    color: '#800000',
    textDecorationLine: 'underline',
  },
  text: {
    marginTop: 15,
    alignSelf: 'center',
  },
  link: {
    alignSelf: 'center',
    color: '#800000',
    textDecorationLine: 'underline',
  },
});