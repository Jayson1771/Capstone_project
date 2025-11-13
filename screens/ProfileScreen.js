import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseconfig';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBottom, setActiveBottom] = useState('Profile'); // <- track active tab

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData({ uid: user.uid, ...docSnap.data() });
          }
        } catch (error) {
          console.log('Error getting user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#800000', fontSize: 16 }}>No user data found.</Text>
      </View>
    );
  }

  const joinedDate = userData.createdAt?.toDate
    ? userData.createdAt.toDate().toLocaleDateString()
    : 'N/A';

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        {/* Top Area */}
        <View style={styles.topArea}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Image
              source={require('../assets/logo.jpg')} // Add a proper logout icon
              style={styles.logoutIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={require('../assets/logo.jpg')} // placeholder profile picture
            style={styles.profilePic}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Course:</Text>
            <Text style={styles.infoValue}>{userData.course}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Year Level:</Text>
            <Text style={styles.infoValue}>{userData.year}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Joined:</Text>
            <Text style={styles.infoValue}>{joinedDate}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
          <Text style={[styles.navLabel, activeBottom === 'Home' && styles.activeLabel]}>
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
          <Text style={[styles.navLabel, activeBottom === 'Profile' && styles.activeLabel]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  topArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  logoutIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFD700',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#800000',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#800000',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  infoSection: {
    marginHorizontal: 25,
    marginTop: 20,
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 80, // leave space for bottom nav
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#800000',
  },
  infoValue: {
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#800000',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomButton: { alignItems: 'center' },
  navLabel: { color: '#fff', fontSize: 14, marginTop: 3 },
  activeLabel: { color: '#FFD700', fontWeight: 'bold' },
});
