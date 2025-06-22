import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Star, MapPin, Bell, Shield, CircleHelp as HelpCircle, ChevronRight, CreditCard as Edit3, Settings, Moon, Globe, LogOut, Camera, Award, TrendingUp, Users, Clock, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole } from '@/components/RoleContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming
} from 'react-native-reanimated';

interface ProfileStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  color?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

const mockUser = {
  name: 'Vishal Seth',
  email: 'obsessionissin@gmail.com',
  phone: '80762-xx-xx',
  memberSince: 'March 2024',
  trustScore: 4.9,
  totalRides: 124,
  totalTokens: 840,
  carbonSaved: '45.2 kg',
  tier: 'Gold'
};

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Ride',
    description: 'Completed your first ride',
    icon: <Star size={16} color="#FFD700" strokeWidth={2} />,
    unlocked: true
  },
  {
    id: '2',
    title: 'Community Helper',
    description: 'Helped 50+ community members',
    icon: <Users size={16} color="#34C759" strokeWidth={2} />,
    unlocked: true
  },
  {
    id: '3',
    title: 'Eco Warrior',
    description: 'Saved 100kg of CO2',
    icon: <Award size={16} color="#007AFF" strokeWidth={2} />,
    unlocked: false,
    progress: 45,
    total: 100
  },
  {
    id: '4',
    title: 'Speed Demon',
    description: 'Complete 10 rides in a week',
    icon: <Zap size={16} color="#FF9500" strokeWidth={2} />,
    unlocked: false,
    progress: 7,
    total: 10
  }
];

export default function ProfileScreen() {
  const { role } = useRole();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const cardScale = useSharedValue(1);
  const achievementOpacity = useSharedValue(0);

  const profileStats: ProfileStat[] = [
    { 
      label: 'Rides', 
      value: mockUser.totalRides.toString(), 
      icon: <MapPin size={16} color="#007AFF" strokeWidth={2} />,
      color: '#007AFF'
    },
    { 
      label: 'Rating', 
      value: mockUser.trustScore.toString(), 
      icon: <Star size={16} color="#FFD700" strokeWidth={2} />,
      color: '#FFD700'
    },
    { 
      label: 'Tokens', 
      value: mockUser.totalTokens.toString(), 
      icon: <Award size={16} color="#34C759" strokeWidth={2} />,
      color: '#34C759'
    },
    { 
      label: 'CO₂ Saved', 
      value: mockUser.carbonSaved, 
      icon: <TrendingUp size={16} color="#00D4FF" strokeWidth={2} />,
      color: '#00D4FF'
    }
  ];

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: <Edit3 size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'action',
      onPress: () => setIsEditing(!isEditing)
    },
    {
      id: '2',
      title: 'Saved Places',
      icon: <MapPin size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'navigation',
      onPress: () => console.log('Saved places')
    },
    {
      id: '3',
      title: 'Notifications',
      icon: <Bell size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'toggle',
      value: notificationsEnabled,
      onPress: () => setNotificationsEnabled(!notificationsEnabled)
    },
    {
      id: '4',
      title: 'Location Services',
      icon: <Shield size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'toggle',
      value: locationEnabled,
      onPress: () => setLocationEnabled(!locationEnabled)
    },
    {
      id: '5',
      title: 'Dark Mode',
      icon: <Moon size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'toggle',
      value: darkModeEnabled,
      onPress: () => setDarkModeEnabled(!darkModeEnabled)
    },
    {
      id: '6',
      title: 'Language',
      icon: <Globe size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'navigation',
      onPress: () => console.log('Language settings')
    },
    {
      id: '7',
      title: 'App Settings',
      icon: <Settings size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'navigation',
      onPress: () => console.log('App settings')
    },
    {
      id: '8',
      title: 'Help & Support',
      icon: <HelpCircle size={20} color="#1D1D1F" strokeWidth={2} />,
      type: 'navigation',
      onPress: () => console.log('Help & support')
    },
    {
      id: '9',
      title: 'Sign Out',
      icon: <LogOut size={20} color="#FF3B30" strokeWidth={2} />,
      type: 'action',
      color: '#FF3B30',
      onPress: () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => console.log('Sign out') }
      ])
    }
  ];

  const handleAchievementToggle = () => {
    setShowAchievements(!showAchievements);
    achievementOpacity.value = withTiming(showAchievements ? 0 : 1, { duration: 300 });
  };

  const handleEditProfile = () => {
    cardScale.value = withSpring(isEditing ? 1 : 0.98);
  };

  React.useEffect(() => {
    handleEditProfile();
  }, [isEditing]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }]
  }));

  const achievementStyle = useAnimatedStyle(() => ({
    opacity: achievementOpacity.value,
    height: showAchievements ? 'auto' : 0
  }));

  const getTierGradient = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'silver': return ['#C0C0C0', '#E8E8E8'];
      case 'gold': return ['#FFD700', '#FFA500'];
      case 'platinum': return ['#E5E4E2', '#BCC6CC'];
      case 'diamond': return ['#B9F2FF', '#00D4FF'];
      default: return ['#667eea', '#764ba2'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View style={[styles.profileSection, cardStyle]}>
          <LinearGradient
            colors={getTierGradient(mockUser.tier)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={32} color="#FFFFFF" strokeWidth={2} />
                </View>
                <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                  <Camera size={16} color="#007AFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>{mockUser.name}</Text>
                  <View style={styles.tierBadge}>
                    <Text style={styles.tierText}>{mockUser.tier}</Text>
                  </View>
                </View>
                <Text style={styles.profileEmail}>{mockUser.email}</Text>
                <View style={styles.profileRating}>
                  <Star size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                  <Text style={styles.ratingText}>{mockUser.trustScore}</Text>
                  <Text style={styles.ratingLabel}>{role} rating</Text>
                </View>
                <Text style={styles.memberSince}>Member since {mockUser.memberSince}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <TouchableOpacity 
              style={styles.achievementToggle}
              onPress={handleAchievementToggle}
              activeOpacity={0.8}
            >
              <Award size={16} color="#007AFF" strokeWidth={2} />
              <Text style={styles.achievementToggleText}>Achievements</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <View key={stat.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  {stat.icon}
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        {showAchievements && (
          <Animated.View style={[styles.achievementsSection, achievementStyle]}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementCard,
                    achievement.unlocked && styles.unlockedAchievement
                  ]}
                >
                  <View style={styles.achievementIcon}>
                    {achievement.icon}
                  </View>
                  <Text style={[
                    styles.achievementTitle,
                    achievement.unlocked && styles.unlockedText
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    achievement.unlocked && styles.unlockedDescription
                  ]}>
                    {achievement.description}
                  </Text>
                  
                  {!achievement.unlocked && achievement.progress && achievement.total && (
                    <View style={styles.achievementProgress}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${(achievement.progress / achievement.total) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.progress}/{achievement.total}
                      </Text>
                    </View>
                  )}
                  
                  {achievement.unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  item.color === '#FF3B30' && styles.dangerMenuItem
                ]}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.menuLeft}>
                  <View style={[
                    styles.menuIcon,
                    item.color === '#FF3B30' && styles.dangerMenuIcon
                  ]}>
                    {item.icon}
                  </View>
                  <Text style={[
                    styles.menuTitle,
                    item.color === '#FF3B30' && styles.dangerMenuText
                  ]}>
                    {item.title}
                  </Text>
                </View>
                
                <View style={styles.menuRight}>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onPress}
                      trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#E5E5E7"
                    />
                  ) : item.type === 'navigation' ? (
                    <ChevronRight size={16} color="#6E6E73" strokeWidth={2} />
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>HICUT v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 HICUT Inc.</Text>
          <Text style={styles.appDescription}>
            Community-driven rides with reward tokens
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 32,
    marginRight: 12,
  },
  tierBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tierText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 8,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
    marginRight: 4,
    lineHeight: 22,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  memberSince: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.7,
    lineHeight: 20,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  achievementToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    gap: 6,
  },
  achievementToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    lineHeight: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
    textAlign: 'center',
  },
  achievementsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    position: 'relative',
    opacity: 0.6,
  },
  unlockedAchievement: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007AFF',
    opacity: 1,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6E6E73',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  unlockedText: {
    color: '#1D1D1F',
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  unlockedDescription: {
    color: '#6E6E73',
  },
  achievementProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6E6E73',
    lineHeight: 14,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  dangerMenuItem: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerMenuIcon: {
    backgroundColor: '#FEF2F2',
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  dangerMenuText: {
    color: '#FF3B30',
  },
  menuRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
    textAlign: 'center',
  },
});