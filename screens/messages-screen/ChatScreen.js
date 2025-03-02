import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Colors from '../../Colors';
import { AntDesign, Feather, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 


// Helper function to format time
const formatTime = (timestamp) => {
    const date = new Date(timestamp); // Convert the timestamp to a Date object
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Ensure 2-digit minutes
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    const hourIn12HrFormat = hours % 12 || 12; // Convert to 12-hour format
    return `${hourIn12HrFormat}:${formattedMinutes} ${ampm}`; // Return formatted time
};

// Initialize socket connection
const socket = io("http://192.168.1.5:5000");

const ChatScreen = ({ route }) => {
    const { userId, friendId } = route.params;
    const navigation = useNavigation();

    const [typedMessage, setTypedMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [friend, setFriend] = useState({});
    const [loading, setLoading] = useState(false);

    // Create a ref for the ScrollView
    const scrollViewRef = useRef();

    // Function to scroll to the bottom
    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    const fetchFriendDetail = async () => {
        try {
            const response = await axios.get(`http://192.168.1.5:5000/user/profile/${friendId}`);
            setFriend(response.data);
        } catch (error) {
            console.error("Error fetching friend details:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://192.168.1.5:5000/chat/history/${userId}/${friendId}`);
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Fetch friend details and messages
    useEffect(() => {
        if (friendId) {
            fetchFriendDetail();
            fetchMessages();
        }
    }, [friendId, userId]);

    // Scroll to bottom when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Scroll to bottom when the screen loads
    useEffect(() => {
        const timeout = setTimeout(() => {
            scrollToBottom();
        }, 500); // Small delay to ensure the ScrollView is rendered

        return () => clearTimeout(timeout);
    }, []);

    // Handle new messages from the socket
    useEffect(() => {
        socket.on("newMessage", (message) => {
            console.log("New message received:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off("newMessage");
        };
    }, []);

    const sendMessage = async () => {
        if (!typedMessage.trim()) return;

        const messageData = { sender: userId, receiver: friendId, text: typedMessage };
        socket.emit("sendMessage", messageData);
        setTypedMessage("");
    };

    const pickImage = async (source) => {
        let result;
        if (source === "camera") {
            result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, allowsEditing: true });
        }

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageUri) => {
        console.log("Uploading image with URI:", imageUri);

        const formData = new FormData();
        formData.append("file", { uri: imageUri, name: "chatImage.jpg", type: "image/jpeg" });
        formData.append("upload_preset", "social-media-app");

        try {
            setLoading(true);
            console.log("Sending request to Cloudinary...");
            const response = await axios.post("https://api.cloudinary.com/v1_1/da3c1ix9e/image/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Cloudinary response:", response.data);
            const imageUrl = response.data.secure_url;

            const messageData = { sender: userId, receiver: friendId, media: imageUrl };
            socket.emit("sendMessage", messageData);
            setLoading(false);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const deleteAlert = () => {
        Alert.alert(
            "Clear Chat?",
            "The messages will be cleared from both the sides",
            [
                {text:"Cancel", style:'cancel'},
                {text:"Yes", onPress: () => clearChat()}
            ]
        )
    }

    const clearChat = async() => {
        try {
            const response = await axios.delete(`http://192.168.1.5:5000/chat/delete/${userId}/${friendId}`);
            console.log("Messages deleted successfully", response.data);
            fetchMessages();
            
        } catch (error) {
            console.log("NOT ABLE TO DELETE MESSAGES :", error);
        }
    }

    return (
        <>
            <LinearGradient
                  colors={['rgb(142, 52, 0)','rgb(255, 141, 96)', '#fdffe7']} // Gradient from primary to transparent
                  start={{ x: 0, y: 0 }} // Starts at the top
                  end={{ x: 0, y: 1 }} // Ends at the bottom
                  style={{ paddingTop: 10}} // Extend gradient to cover stories
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back-sharp" size={25} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("OtherProfile", {item:{_id:friendId}})} style={styles.friendInfo}>
                            <Image style={styles.friendImage} source={{ uri: friend.profilePic }} />
                            <View>
                                <Text style={styles.friendName}>{friend.name}</Text>
                                <Text style={styles.friendUsername}>{friend.username}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={{padding:8, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}}>
                            <Feather name='phone' size={15} color='white' />
                        </TouchableOpacity>
                        <TouchableOpacity style={{padding:8, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}}>
                            <Feather name='video' size={15} color='white' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteAlert()} style={{padding:8, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}}>
                            <Feather name='trash' size={15} color='white' />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1, backgroundColor:Colors.background}} // Ensures it covers the entire screen
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {/* Chat Messages Section */}
                        <ScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={styles.messagesContainer}
                            keyboardShouldPersistTaps="handled" // Allows taps when keyboard is open
                            onContentSizeChange={() => scrollToBottom()} // Scrolls to bottom when new messages arrive
                        >
                            {messages.map((msg, index) => (
                                <TouchableOpacity key={msg._id || index}>
                                    <View style={[styles.messageBubble, msg.sender === userId ? styles.sentMessage : styles.receivedMessage]}>
                                        {msg.media && <Image source={{ uri: msg.media }} style={styles.messageImage} />}
                                        {msg.text && <Text style={styles.messageText(msg.sender === userId)}>{msg.text}</Text>}
                                        <Text style={styles.messageTime(msg.sender === userId)}>{formatTime(msg.createdAt)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {loading && <ActivityIndicator />}
                        </ScrollView>

                        {/* Message Input Section */}
                        <View style={{ paddingHorizontal: 20, backgroundColor: Colors.background }}>
                            <View style={styles.inputContainer}>
                                <View style={styles.inputLeft}>
                                    <TouchableOpacity onPress={() => pickImage("camera")} style={styles.cameraButton}>
                                        <FontAwesome name='camera' size={15} color='white' />
                                    </TouchableOpacity>
                                    <TextInput 
                                        value={typedMessage} 
                                        onChangeText={setTypedMessage} 
                                        style={styles.input} 
                                        placeholder='Message...' 
                                        placeholderTextColor="#999" 
                                    />
                                </View>
                                {typedMessage ? (
                                    <TouchableOpacity onPress={sendMessage} style={{ padding: 10, backgroundColor: Colors.quirky3, borderRadius: 30, borderWidth: 3 }}>
                                        <Feather name='send' size={15} color='white' />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => pickImage("gallery")} style={{ padding: 10, backgroundColor: Colors.quirky3, borderRadius: 30, borderWidth: 3 }}>
                                        <AntDesign name='picture' size={15} color='white' />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

        </>
    );
};


export default ChatScreen;

// Styles
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        padding: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginTop: 35,
    },
    friendInfo: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    friendImage: {
        height: 50,
        width: 50,
        borderRadius: 100,
        borderWidth: 3,
    },
    friendName: {
        fontFamily: 'font-bold',
        fontSize: 18,
        color: 'black',
    },
    friendUsername: {
        fontFamily: 'font-reg',
        fontSize: 14,
        color: 'black',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        marginTop: 35,
    },
    messagesContainer: {
        paddingVertical: 10,
        backgroundColor:Colors.background
    },
    messageBubble: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        maxWidth: '80%',
        marginHorizontal: 10,
        borderWidth:2,
        flexDirection:'column',
        gap:5
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.quirky2,
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.quirky4,
    },
    messageText: (isSender) => ({
        color: isSender ? 'white' : 'black',
        fontFamily: 'font-med',
        fontSize:16
    }),
    messageTime: (isSender) => ({
        fontFamily: 'font-reg',
        fontSize: 10,
        color: isSender ? 'white' : 'black',
        alignSelf: 'flex-end',
    }),
    messageImage: {
        width: 250,
        height: 250,
        marginTop: 5,
        borderRadius: 10,
        borderWidth:3
    },
    inputContainer: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderWidth: 0.5,
        borderRadius: 30,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'white',
        borderWidth:3,
    },
    inputLeft: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        flex: 1,
    },
    cameraButton: {
        padding: 10,
        backgroundColor: Colors.primary,
        borderRadius: 30,
        borderWidth:3
    },
    input: {
        fontFamily: 'font-med',
        flex: 1,
        color: 'black',
        fontSize:16
    },
    sendButton: {
        padding: 10,
        backgroundColor: Colors.primary,
        borderRadius: 30,
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 5,
        marginLeft: -30,
        backgroundColor:Colors.quirky1,
    },
});