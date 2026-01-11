import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    ListRenderItem,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const API_URL = "https://fitness-ai-chatbot-backend.onrender.com/chat";

interface Lifestyle {
    steps: number;
    sleep: number;
    exerciseMinutes: number;
}

interface UserContext {
    personality: "Encourager" | "Explorer" | "Goal Finisher";
    daysUsed: number;
    lifestyle: Lifestyle;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai' | 'system';
}

const INITIAL_CONTEXT: UserContext = {
    personality: "Encourager",
    daysUsed: 1,
    lifestyle: {
        steps: 4200,
        sleep: 5.5,
        exerciseMinutes: 25,
    },
};

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<'welcome' | 'chat'>('welcome');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userContext, setUserContext] = useState<UserContext>(INITIAL_CONTEXT);
    const flatListRef = useRef<FlatList<Message>>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    personality: userContext.personality,
                    daysUsed: userContext.daysUsed,
                    lifestyle: userContext.lifestyle,
                }),
            });

            const data = await res.json();

            const aiMsg: Message = {
                id: Date.now() + 1,
                text: data.response || 'No response',
                sender: 'ai',
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 2, text: 'Connection error. Backend unreachable.', sender: 'system' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem: ListRenderItem<Message> = ({ item }) => (
        <View style={[
            styles.bubble,
            item.sender === 'user' ? styles.userBubble :
                item.sender === 'system' ? styles.systemBubble : styles.aiBubble
        ]}>
            {item.sender === 'system' && (
                <Ionicons name="warning-outline" size={18} color="#F97316" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.msgText}>{item.text}</Text>
        </View>
    );

    if (currentScreen === 'welcome') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.welcome}>
                    <View style={styles.heroSection}>
                        <Ionicons name="fitness-outline" size={64} color="#22C55E" />
                        <Text style={styles.title}>Fitness AI</Text>
                        <Text style={styles.subtitle}>Your personal wellness assistant</Text>
                    </View>

                    <View style={styles.disclaimerCard}>
                        <View style={styles.warningRow}>
                            <Ionicons name="medical-outline" size={20} color="#F97316" />
                            <Text style={styles.warningText}>
                                I am an AI fitness companion, not a doctor. I cannot provide medical diagnosis or advice.
                            </Text>
                        </View>

                        <Text style={styles.scopeTitle}>I cannot assist with:</Text>
                        <View style={styles.scopeList}>
                            <View style={styles.scopeRow}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.scopeItem}>Injuries (Fractures, tears, pain)</Text>
                            </View>
                            <View style={styles.scopeRow}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.scopeItem}>Medical Conditions (Diabetes, Heart issues)</Text>
                            </View>
                            <View style={styles.scopeRow}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.scopeItem}>Medications or Supplements</Text>
                            </View>
                        </View>

                        <View style={styles.emergencyRow}>
                            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                            <Text style={styles.emergencyText}>
                                If you experience pain or dizziness, stop immediately and consult a professional.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('chat')}>
                        <Ionicons name="chatbubbles-outline" size={20} color="#020617" />
                        <Text style={styles.primaryText}>Start Chat</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#020617" />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => setUserContext(p => ({
                            ...p, personality: p.personality === 'Encourager' ? 'Goal Finisher' : 'Encourager'
                        }))}>
                            <Ionicons name="person-circle-outline" size={16} color="#CBD5F5" />
                            <Text style={styles.headerText}>{userContext.personality}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerBtn} onPress={() => setUserContext(p => ({
                            ...p, daysUsed: p.daysUsed === 1 ? 10 : 1
                        }))}>
                            <Ionicons name="calendar-outline" size={16} color="#CBD5F5" />
                            <Text style={styles.headerText}>Day {userContext.daysUsed}</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={i => i.id.toString()}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        keyboardShouldPersistTaps="handled"
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.listContent}
                    />

                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about workouts..."
                            placeholderTextColor="#94A3B8"
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText || isLoading) && styles.sendDisabled]}
                            onPress={sendMessage}
                            disabled={!inputText || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#020617" />
                            ) : (
                                <Ionicons name="send-outline" size={18} color="#020617" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },

    welcome: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC' },
    subtitle: { fontSize: 14, color: '#94A3B8' },
    primaryBtn: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 20,
        backgroundColor: '#22C55E',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    primaryText: { fontWeight: '700', color: '#020617' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerBtn: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    headerText: { color: '#CBD5F5', fontSize: 12, fontWeight: '600' },

    listContent: {
        padding: 16,
        paddingBottom: 20,
    },

    bubble: {
        padding: 14,
        borderRadius: 16,
        marginBottom: 8,
        maxWidth: '85%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#22C55E' },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1E293B' },
    systemBubble: { alignSelf: 'center', backgroundColor: '#7C2D12' },

    msgText: { color: '#F8FAFC', fontSize: 15, lineHeight: 20 },

    inputBar: {
        flexDirection: 'row',
        backgroundColor: '#020617',
        padding: 12,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
    },
    input: {
        flex: 1,
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        color: '#F8FAFC',
    },
    sendBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.4 },

    heroSection: { alignItems: 'center', gap: 8, marginBottom: 20 },
    disclaimerCard: {
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 16,
        width: '90%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    warningRow: { flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'flex-start' },
    warningText: { color: '#F8FAFC', flex: 1, fontSize: 13, lineHeight: 18 },

    scopeTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    scopeList: { gap: 6, marginBottom: 16, paddingLeft: 4 },
    scopeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    scopeItem: { color: '#CBD5F5', fontSize: 13 },

    emergencyRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
        alignItems: 'center'
    },
    emergencyText: { color: '#EF4444', flex: 1, fontSize: 12, fontWeight: '600' },
});
