import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { X, Bell, Shield, Moon, Globe, Volume2, Vibrate } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming
} from 'react-native-reanimated';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'toggle' | 'select';
  value?: boolean;
  options?: string[];
  selectedOption?: string;
  onToggle?: (value: boolean) => void;
  onSelect?: (option: string) => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    rideAlerts: true,
    soundEffects: true,
    hapticFeedback: true,
    locationTracking: true,
    dataSharing: false,
    darkMode: false,
    language: 'English',
    distanceUnit: 'Kilometers'
  });

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Receive ride updates and alerts',
          icon: <Bell size={20} color="#007AFF" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.pushNotifications,
          onToggle: (value: boolean) => updateSetting('pushNotifications', value)
        },
        {
          id: 'rideAlerts',
          title: 'Ride Alerts',
          description: 'Get notified about nearby ride requests',
          icon: <Bell size={20} color="#34C759" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.rideAlerts,
          onToggle: (value: boolean) => updateSetting('rideAlerts', value)
        }
      ]
    },
    {
      title: 'Audio & Haptics',
      items: [
        {
          id: 'soundEffects',
          title: 'Sound Effects',
          description: 'Play sounds for app interactions',
          icon: <Volume2 size={20} color="#FF9500" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.soundEffects,
          onToggle: (value: boolean) => updateSetting('soundEffects', value)
        },
        {
          id: 'hapticFeedback',
          title: 'Haptic Feedback',
          description: 'Feel vibrations for touch feedback',
          icon: <Vibrate size={20} color="#FF3B30" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.hapticFeedback,
          onToggle: (value: boolean) => updateSetting('hapticFeedback', value)
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'locationTracking',
          title: 'Location Tracking',
          description: 'Allow location access for ride matching',
          icon: <Shield size={20} color="#007AFF" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.locationTracking,
          onToggle: (value: boolean) => updateSetting('locationTracking', value)
        },
        {
          id: 'dataSharing',
          title: 'Anonymous Data Sharing',
          description: 'Help improve the app with usage data',
          icon: <Shield size={20} color="#6E6E73" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.dataSharing,
          onToggle: (value: boolean) => updateSetting('dataSharing', value)
        }
      ]
    },
    {
      title: 'Appearance & Language',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          icon: <Moon size={20} color="#1D1D1F" strokeWidth={2} />,
          type: 'toggle' as const,
          value: settings.darkMode,
          onToggle: (value: boolean) => updateSetting('darkMode', value)
        },
        {
          id: 'language',
          title: 'Language',
          description: 'Choose your preferred language',
          icon: <Globe size={20} color="#007AFF" strokeWidth={2} />,
          type: 'select' as const,
          selectedOption: settings.language,
          options: ['English', 'Spanish', 'French', 'German', 'Italian'],
          onSelect: (option: string) => updateSetting('language', option)
        }
      ]
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, modalStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>App Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <X size={24} color="#6E6E73" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {settingsSections.map((section, sectionIndex) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionContent}>
                  {section.items.map((item, itemIndex) => (
                    <View 
                      key={item.id} 
                      style={[
                        styles.settingItem,
                        itemIndex === section.items.length - 1 && styles.lastItem
                      ]}
                    >
                      <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                          {item.icon}
                        </View>
                        <View style={styles.settingInfo}>
                          <Text style={styles.settingTitle}>{item.title}</Text>
                          <Text style={styles.settingDescription}>{item.description}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.settingRight}>
                        {item.type === 'toggle' ? (
                          <Switch
                            value={item.value}
                            onValueChange={item.onToggle}
                            trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
                            thumbColor="#FFFFFF"
                            ios_backgroundColor="#E5E5E7"
                          />
                        ) : (
                          <TouchableOpacity style={styles.selectButton} activeOpacity={0.8}>
                            <Text style={styles.selectButtonText}>{item.selectedOption}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Reset Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reset</Text>
              <View style={styles.sectionContent}>
                <TouchableOpacity style={styles.resetButton} activeOpacity={0.8}>
                  <Text style={styles.resetButtonText}>Reset All Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    lineHeight: 22,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  settingRight: {
    marginLeft: 12,
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
});