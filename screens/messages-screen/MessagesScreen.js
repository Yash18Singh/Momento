import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Colors, {getRandomQuirkyColor} from '../../Colors';
import MessageComponent from '../../components/MessageComponent';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { LinearGradient } from 'expo-linear-gradient'; 

const MessagesScreen = () => {
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUser = async() => {
      try {
        const token = await AsyncStorage.getItem('token');
        if(!token){
          throw new Error("Token not found");
        }
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
        console.log(userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    }
    fetchUser();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`http://192.168.1.5:5000/friends/message-list/${userId}`);
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    if(userId){
      fetchFriends();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
       fetchFriends();
    }, [userId])
  )

  useEffect(() => {
    console.log("FRIENDS :", friends);
  }, [friends]);

  return (
    <>
      <LinearGradient
          colors={['rgb(142, 52, 0)','rgb(255, 141, 96)', '#fdffe7']} // Gradient from primary to transparent
          start={{ x: 0, y: 0 }} // Starts at the top
          end={{ x: 0, y: 1 }} // Ends at the bottom
          style={{ paddingTop: 40, paddingBottom: 40 }} // Extend gradient to cover stories
      >
        <Text style={{ marginTop: 10, fontFamily: 'font-head-bold', fontSize: 30, color: 'black', marginLeft:20}}>Messages</Text>
      </LinearGradient>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flexDirection: 'column', backgroundColor: Colors.background }}>
        {friends.map(friend => (
          <TouchableOpacity style={{paddingHorizontal:30, marginBottom:5}} key={friend._id} onPress={() => navigation.navigate("Chat", { friendId: friend._id, userId: userId })}>
            <MessageComponent friend={friend} bgColor={"rgb(255, 191, 166)"}/>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

export default MessagesScreen;
