import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, Smartphone } from 'lucide-react-native';

export default function UpiManagementScreen() {
    const [upiId, setUpiId] = useState('');
    const [savedUPIs, setSavedUPIs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUPIs();
    }, []);

    const loadUPIs = async () => {
        try {
            const data = await AsyncStorage.getItem('saved_upis');
            if (data) {
                setSavedUPIs(JSON.parse(data));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveUPIs = async (upis: string[]) => {
        try {
            await AsyncStorage.setItem('saved_upis', JSON.stringify(upis));
            setSavedUPIs(upis);
        } catch (e) {
            Alert.alert('Error', 'Failed to save');
        }
    };

    const handleAdd = () => {
        if (!upiId.includes('@')) {
            Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g., name@bank)');
            return;
        }
        if (savedUPIs.includes(upiId)) {
            Alert.alert('Duplicate', 'This UPI ID is already saved');
            return;
        }
        const newUPIs = [...savedUPIs, upiId];
        saveUPIs(newUPIs);
        setUpiId('');
    };

    const handleDelete = (id: string) => {
        const newUPIs = savedUPIs.filter(u => u !== id);
        saveUPIs(newUPIs);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage UPI IDs</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210@ybl"
                    placeholderTextColor="#9ca3af"
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                />
                <Pressable style={styles.addBtn} onPress={handleAdd}>
                    <Text style={styles.addText}>Add</Text>
                </Pressable>
            </View>

            <Text style={styles.subtitle}>Saved UPI IDs</Text>

            <FlatList
                data={savedUPIs}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Smartphone size={20} color="#4caf50" style={{ marginRight: 10 }} />
                            <Text style={styles.cardText}>{item}</Text>
                        </View>
                        <Pressable onPress={() => handleDelete(item)}>
                            <Trash2 size={20} color="#ef4444" />
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No saved UPI IDs</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 20,
        color: '#374151',
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
        fontSize: 16,
    },
    addBtn: {
        backgroundColor: '#4caf50',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    addText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16,
        color: '#1f2937',
    },
    empty: {
        color: '#9ca3af',
        fontStyle: 'italic',
        marginTop: 10,
    },
});
