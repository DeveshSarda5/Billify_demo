import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, CreditCard } from 'lucide-react-native';

interface Card {
    id: string;
    number: string; // Storing masked
    expiry: string;
    holder: string;
}

export default function CardsScreen() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [holder, setHolder] = useState('');

    const [savedCards, setSavedCards] = useState<Card[]>([]);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            const data = await AsyncStorage.getItem('saved_cards');
            if (data) {
                setSavedCards(JSON.parse(data));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const saveCards = async (cards: Card[]) => {
        try {
            await AsyncStorage.setItem('saved_cards', JSON.stringify(cards));
            setSavedCards(cards);
        } catch (e) {
            Alert.alert('Error', 'Failed to save');
        }
    };

    const handleAdd = () => {
        if (cardNumber.length < 16 || !expiry || !cvv || !holder) {
            Alert.alert('Invalid Card', 'Please fill all fields correctly');
            return;
        }

        const masked = `**** **** **** ${cardNumber.slice(-4)}`;
        const newCard: Card = {
            id: Date.now().toString(),
            number: masked,
            expiry,
            holder,
        };

        const newCards = [...savedCards, newCard];
        saveCards(newCards);

        // Reset form
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setHolder('');
    };

    const handleDelete = (id: string) => {
        const newCards = savedCards.filter(c => c.id !== id);
        saveCards(newCards);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Cards</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9876 5432"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    maxLength={16}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                />
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 10 }]}
                        placeholder="MM/YY"
                        placeholderTextColor="#9ca3af"
                        value={expiry}
                        onChangeText={setExpiry}
                        maxLength={5}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="123"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        maxLength={3}
                        value={cvv}
                        onChangeText={setCvv}
                        secureTextEntry
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Card Holder Name"
                    value={holder}
                    onChangeText={setHolder}
                />

                <Pressable style={styles.addBtn} onPress={handleAdd}>
                    <Text style={styles.addText}>Add Card</Text>
                </Pressable>
            </View>

            <Text style={styles.subtitle}>Saved Cards</Text>

            <FlatList
                data={savedCards}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardIcon}>
                            <CreditCard size={24} color="#2196f3" />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardNumber}>{item.number}</Text>
                            <Text style={styles.cardSub}>Exp: {item.expiry}</Text>
                            <Text style={styles.cardSub}>{item.holder}</Text>
                        </View>
                        <Pressable onPress={() => handleDelete(item.id)}>
                            <Trash2 size={20} color="#ef4444" />
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No saved cards</Text>
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
    form: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    addBtn: {
        backgroundColor: '#2196f3',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
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
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cardIcon: {
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 12,
        color: '#6b7280',
    },
    empty: {
        color: '#9ca3af',
        fontStyle: 'italic',
        marginTop: 10,
    },
});
