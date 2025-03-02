import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, { getRandomQuirkyColor } from '../../Colors';
import { LinearGradient } from 'expo-linear-gradient'; 
import { jwtDecode } from 'jwt-decode';

const FriendListScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [userId, setUserId] = useState(route?.params);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [friendList, setFriendList] = useState([]);

    useEffect(() => {
        const fetchUser = async() => {
          try {
            const token = await AsyncStorage.getItem('token');
            if(!token){
              throw new Error("Token not found");
            }
            const decodedToken = jwtDecode(token);
            setLoggedInUser(decodedToken.userId);
            console.log(userId);
          } catch (error) {
            console.error("Error fetching user ID:", error);
          }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        console.log("USER ID :", userId);
    }, [userId])

    useEffect(() => {
        fetchFriends();
    }, [userId]);

    const fetchFriends = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) throw new Error("Token not found");

            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`http://192.168.1.5:5000/friends/list/${userId}`, { headers });

            console.log("Fetched Friends:", response.data.friends); // Debugging

            setFriendList(response.data.friends);
        } catch (error) {
            console.error("Error fetching friends:", error.response?.data || error.message);
        }
    };

    const openProfile = (item) => {
        if (item._id === loggedInUser) {
            navigation.navigate("Main", {screen: "Profile"});
        } else {
            navigation.navigate("OtherProfile", { item }); // Pass the full item object
        }
    };

    useEffect(() => {
        console.log("FRIENDS :", friendList);
    }, [friendList])

    return (
        <>
            <LinearGradient
                colors={['rgb(142, 52, 0)','rgb(255, 141, 96)', '#fdffe7']} // Gradient from primary to transparent
                start={{ x: 0, y: 0 }} // Starts at the top
                end={{ x: 0, y: 1 }} // Ends at the bottom
                style={{ paddingTop: 10, paddingBottom: 20 }} // Extend gradient to cover stories
              >
                <View style={{flexDirection:'row', padding:10, alignItems:'center', gap:10}}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons style={styles.backIcon} name='caret-back-circle' size={30} color='black' />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>FRIENDS</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={{flex:1, backgroundColor:Colors.background}} showsVerticalScrollIndicator={false}>
                {/* Friend List */}
                <FlatList
                    data={friendList}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => openProfile(item)} style={styles.friendItem}>
                            <View style={{paddingHorizontal:50, flexDirection:'row', alignItems:'center', borderWidth:3, paddingVertical:5, borderRadius:10, backgroundColor:Colors.secondaryBackground, width:'100%'}}>
                                <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
                                <Text style={styles.friendName}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
            
            
        </>
    );
};

export default FriendListScreen;

const styles = StyleSheet.create({
    header: {
        padding: 10,
        flexDirection: 'row',
        gap: 15
    },
    backIcon: {
        marginTop: 30
    },
    headerTitleContainer: {
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 22,
        color: 'black',
        fontFamily: 'font-head-bold'
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal:20,
        justifyContent:'center',
        marginBottom:10,
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 100,
        marginRight: 10,
        borderWidth:3
    },
    friendName: {
        fontSize: 20,
        fontFamily:'font-bold'
    }
});
