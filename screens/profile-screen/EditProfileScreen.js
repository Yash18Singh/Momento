import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../Colors';
import { LinearGradient } from 'expo-linear-gradient'; 

const EditProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const userId = route?.params?.userId;

    const [userData, setUserData] = useState({
        username: '',
        name: '',
        email: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch user data when the screen loads
    useEffect(() => {
        const getUserDetails = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`http://192.168.1.5:5000/user/profile/${userId}`);
                    setUserData({
                        username: response.data.username,
                        name: response.data.name,
                        email: response.data.email,
                        bio: response.data.bio,
                        currentPassword: '',
                        newPassword: '',
                    });
                } catch (error) {
                    console.error("Unable to get user data:", error);
                    setError("Failed to load user data");
                }
            }
        };
        getUserDetails();
    }, [userId]);

    // Handle profile update
    const handleUpdateProfile = async () => {
        setLoading(true);
        setError("");

        if (!userData.currentPassword) {
            setError("Please enter your current password");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put(`http://192.168.1.5:5000/user/updateUser/${userId}`, userData);
            Alert.alert("Success", "Profile updated successfully");
            navigation.goBack();
        } catch (error) {
            console.error("Update failed:", error.response?.data?.error || error.message);
            setError(error.response?.data?.error || "Failed to update profile");
        }

        setLoading(false);
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['rgb(142, 52, 0)','rgb(255, 141, 96)', '#fdffe7']} // Gradient from primary to transparent
                start={{ x: 0, y: 0 }} // Starts at the top
                end={{ x: 0, y: 1 }} // Ends at the bottom
                style={{ paddingTop: 30, paddingBottom: 20 }} // Extend gradient to cover stories
            >
                <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons style={styles.backIcon} name="caret-back-circle" size={30} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>EDIT PROFILE</Text>
                </View>
            </LinearGradient>

            {/* Form Inputs */}
            <View style={styles.form}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View>
                    <Text style={{fontFamily:'font-extra', fontSize:20, marginLeft:5}}>Username:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={userData.username}
                        onChangeText={(text) => setUserData({ ...userData, username: text })}
                    />
                </View>

                <View>
                    <Text style={{fontFamily:'font-extra', fontSize:20, marginLeft:5}}>Name:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={userData.name}
                        onChangeText={(text) => setUserData({ ...userData, name: text })}
                    />
                </View>

                <View>
                    <Text style={{fontFamily:'font-extra', fontSize:20, marginLeft:5}}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={userData.email}
                        onChangeText={(text) => setUserData({ ...userData, email: text })}
                    />
                </View>

                <View>
                    <Text style={{fontFamily:'font-extra', fontSize:20, marginLeft:5}}>Bio:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Bio"
                        value={userData.bio}
                        onChangeText={(text) => setUserData({ ...userData, bio: text })}
                    />
                </View>

                <View>
                    <Text style={{fontFamily:'font-extra', fontSize:20, marginLeft:5}}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        secureTextEntry
                        value={userData.currentPassword}
                        onChangeText={(text) => setUserData({ ...userData, currentPassword: text })}
                    />
                </View>
              

                <TextInput
                    style={styles.input}
                    placeholder="New Password (Optional)"
                    secureTextEntry
                    value={userData.newPassword}
                    onChangeText={(text) => setUserData({ ...userData, newPassword: text })}
                />

                <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? "Updating..." : "Save Changes"}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    header: {
        paddingHorizontal:15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backIcon: {
        marginTop: 30,
    },
    headerText: {
        marginTop: 30,
        fontFamily: 'font-head-bold',
        fontSize: 22,
        color: 'black',
    },
    form: { flex:1, padding: 20, display:'flex', flexDirection:'column', gap:10, backgroundColor:Colors.background },
    input: {
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderWidth: 2,
        borderColor: '#000',  // Ensure border color is set
        fontFamily: 'font-bold',
        fontSize: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        textAlignVertical: 'center',  // Ensures text is centered vertically
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 10,
        shadowRadius: 10,
        elevation: 10,  // For Android shadow
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 12,
        alignItems: "center",
        borderRadius:10,
        marginTop:30,
        borderWidth:3
    },
    buttonText: { color: "white", fontSize: 18, fontFamily:'font-bold' },
    errorText: { color: "red", marginBottom: 10 },
});
