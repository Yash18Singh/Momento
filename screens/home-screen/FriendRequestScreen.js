import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors, { getRandomQuirkyColor } from '../../Colors';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { LinearGradient } from 'expo-linear-gradient'; 

const API_URL = 'http://192.168.1.5:5000/friends';  // Replace with your backend URL

const FriendRequestScreen = () => {
  const navigation = useNavigation();
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error("Token not found");
            }
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.userId);
        } catch (error) {
            console.error("Error fetching user ID:", error);
        }
    };
    fetchCurrentUser();
}, []);

  useEffect(() => {
    if(userId){
      fetchFriendRequests();
    }
    
  }, [userId]);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/pending-requests/${userId}`);
      setFriendRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`${API_URL}/accept-request`, { requestId });
      setFriendRequests(friendRequests.filter(request => request._id !== requestId)); // Remove from UI
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId, senderId) => {
    try {
      await axios.post(`${API_URL}/reject-request/${userId}/${senderId}`, { requestId });
      setFriendRequests(friendRequests.filter(request => request._id !== requestId)); // Remove from UI
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  useEffect(() => {
    console.log(friendRequests);
  }, [friendRequests])

  return (
    <>
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
          <Text style={styles.headerText}>Friend Requests</Text>
        </View>
      </LinearGradient>
   

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : friendRequests.length === 0 ? (
          <Text style={styles.noRequestsText}>No friend requests</Text>
        ) : (
          friendRequests.map((request) => (
            <>
              <View style={{marginTop:10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:3, padding:10, borderRadius:10, backgroundColor:getRandomQuirkyColor()}} key={request._id}>
                <TouchableOpacity style={{flexDirection:'column', justifyContent:'center', alignItems:'center', paddingHorizontal:10}} onPress={() => navigation.navigate("OtherProfile", {item:request.sender})}> 
                  <Image style={styles.userImage} source={{ uri: request.sender.profilePic}} />
                  <Text style={styles.userName}>{request.sender.name}</Text>
                </TouchableOpacity>

                <View style={{flexDirection:'row', gap:10}}>
                  <TouchableOpacity style={{padding:10, backgroundColor:Colors.primary, borderRadius:10, borderWidth:2}} onPress={() => handleAcceptRequest(request._id)}>
                    <Text style={{fontFamily:'font-bold', fontSize:16, color:'white'}}>ACCEPT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{padding:10, backgroundColor:Colors.secondary, borderRadius:10, borderWidth:2}} onPress={() => handleRejectRequest(request._id, request.sender._id)}>
                    <Text style={{fontFamily:'font-bold', fontSize:16, color:'white'}}>REJECT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
            
          ))
        )}
      </ScrollView>
    </>
  );
};

export default FriendRequestScreen;

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
  container: {
    backgroundColor: Colors.background,
    flexDirection:'column',
    paddingHorizontal: 15,
    gap:10
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'font-bold',
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userImage: {
    height: 80,
    width: 80,
    borderRadius: 100,
    borderWidth:3
  },
  userName: {
    fontFamily: 'font-bold',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    padding: 7,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
  },
  rejectButton: {
    padding: 7,
    backgroundColor: Colors.border,
    borderRadius: 10,
  },
});
