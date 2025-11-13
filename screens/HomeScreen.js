import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚡ Global in-memory cache (super fast)
let memoryCache = {};

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeBottom, setActiveBottom] = useState('Home');

  // ⚡ 1️⃣ Show instant info from memory or auth
  useLayoutEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // 1. Try memory cache first (fastest)
    if (memoryCache[currentUser.uid]) {
      setUserData(memoryCache[currentUser.uid]);
      return;
    }

    // 2. Try AsyncStorage next (still fast)
    AsyncStorage.getItem(`user_${currentUser.uid}`).then((cachedData) => {
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        memoryCache[currentUser.uid] = parsed; // store in memory
        setUserData(parsed);
      } else {
        // 3. Fallback to Auth info immediately
        setUserData({
          name: currentUser.displayName || currentUser.email,
          course: '—',
          year: '—',
        });
      }
    });
  }, []);

  // ⚡ 2️⃣ Fetch latest Firestore data in background (refresh cache)
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);

          // Save both to cache and local storage
          memoryCache[currentUser.uid] = data;
          await AsyncStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(data));
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigation.replace('Login');
    });

    return unsubscribe;
  }, []);

  // ⚡ 3️⃣ Clear cache on logout
  const handleLogout = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      delete memoryCache[currentUser.uid];
      await AsyncStorage.removeItem(`user_${currentUser.uid}`);
    }
    await signOut(auth);
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Image source={require('../assets/logos.jpg')} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.university}>POLYTECHNIC UNIVERSITY</Text>
            <Text style={styles.university}>OF THE PHILIPPINES</Text>
            <Text style={styles.campus}>Unisan, Quezon</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowLogout(true)}>
          <Image source={require('../assets/logo.jpg')} style={styles.profilePic} />
        </TouchableOpacity>
      </View>

      {/* USER INFO */}
      {userData ? (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userDetails}>
            {userData.year || '—'} - {userData.course || '—'}
          </Text>
        </View>
      ) : (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Loading...</Text>
        </View>
      )}

      {/* MAIN CONTENT */}
      <View style={styles.cardsContainer}>
        {activeTab === 'Dashboard' ? (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AIAssistant')}
            >
              <Text style={styles.icon}>🤖</Text>
              <View>
                <Text style={styles.cardTitle}>AI Coding Assistant</Text>
                <Text style={styles.cardSubtitle}>AI Powered Coding Assistant</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Progress')}
            >
              <Text style={styles.icon}>📈</Text>
              <View>
                <Text style={styles.cardTitle}>My Quizzes</Text>
                <Text style={styles.cardSubtitle}>Track your Learning Progress</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.quizContainer}>
            <Text style={styles.quizText}>🧠 Quizzes Coming Soon!</Text>
          </View>
        )}
      </View>

      {/* LOGOUT MODAL */}
      <Modal transparent visible={showLogout} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPressOut={() => setShowLogout(false)}
        >
          <View style={styles.logoutBox}>
            <Text style={styles.logoutText}>Log out of your account?</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            setActiveBottom('Home');
            navigation.navigate('Home');
          }}
        >
          <Ionicons
            name="home"
            size={30}
            color={activeBottom === 'Home' ? '#FFD700' : '#fff'}
          />
          <Text
            style={[
              styles.navLabel,
              activeBottom === 'Home' && styles.activeLabel,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            setActiveBottom('Profile');
            navigation.navigate('Profile');
          }}
        >
          <Ionicons
            name="person-circle"
            size={30}
            color={activeBottom === 'Profile' ? '#FFD700' : '#fff'}
          />
          <Text
            style={[
              styles.navLabel,
              activeBottom === 'Profile' && styles.activeLabel,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#800000',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  leftHeader: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 45, height: 45, resizeMode: 'contain', marginRight: 10 },
  headerText: { flexDirection: 'column' },
  university: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
  campus: { color: '#FFD700', fontSize: 11 },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  userInfo: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userDetails: { color: '#fff', fontSize: 13 },
  cardsContainer: { flex: 1, padding: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#800000',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  icon: { fontSize: 30, color: '#FFD700', marginRight: 15 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { color: '#E8E8E8', fontSize: 13 },
  quizContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  quizText: { fontSize: 18, color: '#800000', fontWeight: 'bold' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#800000',
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomButton: { alignItems: 'center' },
  navLabel: { color: '#fff', fontSize: 14, marginTop: 3 },
  activeLabel: { color: '#FFD700', fontWeight: 'bold' },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  logoutBox: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, color: '#800000', marginBottom: 15 },
  logoutButton: {
    backgroundColor: '#800000',
    paddingVertical: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: { color: '#FFD700', fontWeight: 'bold' },
});
