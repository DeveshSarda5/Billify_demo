import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad'
];

export default function EditProfileScreen({ navigation }: Props) {
    const { user, setUser } = useAuth();
    const { colors } = useAppTheme();
    // If setUser is not exposed, we might need to manually update AsyncStorage and reload context or refetch
    // For now, let's assume we can update local state or user needs to re-login, but best UX is auto-update

    // Actually, looking at AuthContext, setUser IS exposed in the provider value but not in the type definition explicitly shown in the view_file output?
    // Wait, line 84: value={{ isLoggedIn, user, loading, login, signup, logout }}
    // setUser is NOT exposed. I should update AuthContext to expose it or reload user data.
    // I will add a `reloadUser` method to AuthContext later. For now, I'll update AsyncStorage manually and maybe simple-reload.

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    // location might not be in user type yet on frontend, need to cast or ignore TS error for now, or update Type
    const [location, setLocation] = useState((user as any)?.location || '');
    const [loading, setLoading] = useState(false);
    const [filteredCities, setFilteredCities] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleLocationChange = (text: string) => {
        setLocation(text);
        if (text.length > 0) {
            const filtered = INDIAN_CITIES.filter(city => city.toLowerCase().toLowerCase().includes(text.toLowerCase()));
            setFilteredCities(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleCitySelect = (city: string) => {
        setLocation(city);
        setShowSuggestions(false);
    };

    const handleSave = async () => {
        if (!name || !phone) {
            Alert.alert('Error', 'Name and Phone are required');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.updateProfile({ name, phone, location });
            const { user: updatedUser, token } = response;

            // Update local storage
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            // Update global state
            setUser(updatedUser);

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            // Basic retry logic or cleaner error display could be here
            Alert.alert('Error', error.message || 'Network request failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.text }]}>Location (City)</Text>
            <View style={{ zIndex: 10 }}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={location}
                    onChangeText={handleLocationChange}
                    placeholder="Search city..."
                    placeholderTextColor={colors.inputPlaceholder}
                    onFocus={() => location.length > 0 && setShowSuggestions(true)}
                />
                {showSuggestions && filteredCities.length > 0 && (
                    <View style={[styles.suggestionsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <FlatList
                            data={filteredCities}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            scrollEnabled={true}
                            style={{ maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleCitySelect(item)}
                                >
                                    <Text style={{ color: colors.text }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            <Pressable
                style={[styles.saveBtn, loading && styles.disabled]}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        zIndex: 1,
    },
    disabled: {
        opacity: 0.7,
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    suggestionsList: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
        borderWidth: 1,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
});
