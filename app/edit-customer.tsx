import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  CreditCard,
  Mail,
  Users,
  Award,
  Star,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { CUSTOMER_GROUPS, CustomerGroupId, getCustomerGroupName } from '@/constants/customer-groups';
import { CUSTOMER_RATINGS, CustomerRatingId, getCustomerRatingName } from '@/constants/customer-ratings';

export default function EditCustomerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getCustomers, updateUser } = useUsers();
  const { hasPermission } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [customerGroup, setCustomerGroup] = useState<CustomerGroupId | ''>('');
  const [customerRating, setCustomerRating] = useState<CustomerRatingId | ''>('');
  const [isVip, setIsVip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showRatingPicker, setShowRatingPicker] = useState(false);

  const customer = getCustomers().find(c => c.id === id);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setNationalId(customer.nationalId || '');
      setCustomerGroup((customer.customerGroup as CustomerGroupId) || '');
      setCustomerRating((customer.customerRating as CustomerRatingId) || '');
      setIsVip(customer.customerGroup === 'vip');
    }
  }, [customer]);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            کڕیار نەدۆزرایەوە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission(PERMISSIONS.EDIT_CUSTOMER)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            دەسەڵات نییە
          </KurdishText>
        </View>
        <View style={styles.noPermissionContainer}>
          <KurdishText variant="body" color="#6B7280" style={styles.noPermissionText}>
            تۆ دەسەڵاتی چاککردنی زانیاری کڕیارت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('هەڵە', 'ناو و ژمارەی مۆبایل پێویستە');
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(customer.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        nationalId: nationalId.trim() || undefined,
        customerGroup: customerGroup || undefined,
        customerRating: customerRating || undefined,
      });

      Alert.alert('سەرکەوتوو', 'زانیاری کڕیار نوێکرایەوە', [
        { text: 'باشە', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating customer:', error);
      Alert.alert('هەڵە', 'نەتوانرا زانیاری کڕیار نوێ بکرێتەوە');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVipToggle = () => {
    if (!hasPermission(PERMISSIONS.MANAGE_VIP_CUSTOMERS)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی بەڕێوەبردنی کڕیارانی VIP ت نییە');
      return;
    }

    const newVipStatus = !isVip;
    setIsVip(newVipStatus);
    if (newVipStatus) {
      setCustomerGroup('vip');
    } else if (customerGroup === 'vip') {
      setCustomerGroup('regular');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          چاککردنی کڕیار
        </KurdishText>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={isLoading}
        >
          <Save size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <GradientCard style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            زانیاری بنەڕەتی
          </KurdishText>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="ناوی کڕیار"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="ژمارەی مۆبایل"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="ئیمەیڵ (ئیختیاری)"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textAlign="right"
              />
            </View>
          </View>
        </GradientCard>

        {/* Additional Information */}
        <GradientCard style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            زانیاری زیاتر
          </KurdishText>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="ناونیشان (ئیختیاری)"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <CreditCard size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="ژمارەی ناسنامە (ئیختیاری)"
                placeholderTextColor="#9CA3AF"
                value={nationalId}
                onChangeText={setNationalId}
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
          </View>
        </GradientCard>

        {/* Customer Classification */}
        <GradientCard style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            پۆلێنکردنی کڕیار
          </KurdishText>
          
          {/* VIP Status */}
          {hasPermission(PERMISSIONS.MANAGE_VIP_CUSTOMERS) && (
            <TouchableOpacity 
              style={[styles.vipToggle, isVip && styles.vipToggleActive]}
              onPress={handleVipToggle}
            >
              <Star size={20} color={isVip ? "#FFD700" : "#6B7280"} />
              <KurdishText variant="body" color={isVip ? "#FFD700" : "#6B7280"}>
                کڕیاری VIP
              </KurdishText>
            </TouchableOpacity>
          )}

          {/* Customer Group */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowGroupPicker(!showGroupPicker)}
            >
              <Users size={20} color="#6B7280" />
              <KurdishText variant="body" color="#1F2937">
                {customerGroup ? getCustomerGroupName(customerGroup) : 'گروپی کڕیار'}
              </KurdishText>
            </TouchableOpacity>
          </View>

          {showGroupPicker && (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[styles.pickerOption, !customerGroup && styles.pickerOptionSelected]}
                onPress={() => {
                  setCustomerGroup('');
                  setShowGroupPicker(false);
                }}
              >
                <KurdishText variant="body" color={!customerGroup ? "#1E3A8A" : "#6B7280"}>
                  هیچ گروپێک
                </KurdishText>
              </TouchableOpacity>
              {CUSTOMER_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.pickerOption,
                    customerGroup === group.id && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setCustomerGroup(group.id);
                    setShowGroupPicker(false);
                  }}
                >
                  <KurdishText 
                    variant="body" 
                    color={customerGroup === group.id ? "#1E3A8A" : "#6B7280"}
                  >
                    {group.name}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Customer Rating */}
          {hasPermission(PERMISSIONS.MANAGE_CUSTOMER_RATINGS) && (
            <>
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowRatingPicker(!showRatingPicker)}
                >
                  <Award size={20} color="#6B7280" />
                  <KurdishText variant="body" color="#1F2937">
                    {customerRating ? getCustomerRatingName(customerRating) : 'پلەی کڕیار'}
                  </KurdishText>
                </TouchableOpacity>
              </View>

              {showRatingPicker && (
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[styles.pickerOption, !customerRating && styles.pickerOptionSelected]}
                    onPress={() => {
                      setCustomerRating('');
                      setShowRatingPicker(false);
                    }}
                  >
                    <KurdishText variant="body" color={!customerRating ? "#1E3A8A" : "#6B7280"}>
                      خۆکارانە
                    </KurdishText>
                  </TouchableOpacity>
                  {CUSTOMER_RATINGS.map((rating) => (
                    <TouchableOpacity
                      key={rating.id}
                      style={[
                        styles.pickerOption,
                        customerRating === rating.id && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setCustomerRating(rating.id);
                        setShowRatingPicker(false);
                      }}
                    >
                      <KurdishText 
                        variant="body" 
                        color={customerRating === rating.id ? "#1E3A8A" : "#6B7280"}
                      >
                        {rating.name}
                      </KurdishText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </GradientCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionSelected: {
    backgroundColor: '#E0E7FF',
  },
  vipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  vipToggleActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFD700',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noPermissionText: {
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
});