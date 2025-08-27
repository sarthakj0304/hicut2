import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, Save, User, Mail, Phone, MapPin } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface EditProfileModalProps {
  visible: boolean;
  user: {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    location?: string;
  };
  onClose: () => void;
  onSave: (userData: any) => void;
}

export default function EditProfileModal({
  visible,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio || '',
    location: user.location || '',
  });

  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={24} color="#6E6E73" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.savingButton]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Save size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Picture Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <User size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
              <TouchableOpacity
                style={styles.changePhotoButton}
                activeOpacity={0.8}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6E6E73" strokeWidth={2} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                    placeholder="Enter your full name"
                    placeholderTextColor="#6E6E73"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#6E6E73" strokeWidth={2} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                    placeholder="Enter your email"
                    placeholderTextColor="#6E6E73"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Phone size={20} color="#6E6E73" strokeWidth={2} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.phone}
                    onChangeText={(text) => updateField('phone', text)}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#6E6E73"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.inputContainer}>
                  <MapPin size={20} color="#6E6E73" strokeWidth={2} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.location}
                    onChangeText={(text) => updateField('location', text)}
                    placeholder="Enter your city"
                    placeholderTextColor="#6E6E73"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.bio}
                    onChangeText={(text) => updateField('bio', text)}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#6E6E73"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyText}>
                Your information is secure and will only be shared with ride
                participants when necessary.
              </Text>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingButton: {
    backgroundColor: '#6E6E73',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  changePhotoButton: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    lineHeight: 20,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    gap: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  privacyNotice: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  privacyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 16,
    textAlign: 'center',
  },
});
