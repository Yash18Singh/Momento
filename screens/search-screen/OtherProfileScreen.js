import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Colors from '../../Colors'
import { AntDesign, Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';


const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / 3;

const OtherProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [userId, setUserId] = useState('');
    const [loggedInUserId, setLoggedInUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [friendRequestStatus, setFriendRequestStatus] = useState("");
    const [friendRequestId, setFriendRequestId] = useState(null);
    const [numColumns, setNumColumns] = useState(2);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error("Token not found");
                }
                const decodedToken = jwtDecode(token);
                setLoggedInUserId(decodedToken.userId);
            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };
        fetchCurrentUser();
    }, []);

    

    const fetchUserData = async (userId) => {
        try {
          console.log("Fetching profile for userId:", userId); // Debugging
      
          if (!userId) {
            throw new Error("User ID is undefined");
          }
      
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error("Token not found");
      
          const headers = { Authorization: `Bearer ${token}` };
      
          // Fetch user details
          const userResponse = await axios.get(`http://192.168.1.5:5000/user/profile/${userId}`, { headers });
          setUserData(userResponse.data);
      
          // Fetch user posts
          const userPostsResponse = await axios.get(`http://192.168.1.5:5000/user/posts/${userId}`, { headers });
          setUserPosts(userPostsResponse.data);
      
        } catch (error) {
          console.error("Error fetching data:", error.response?.data || error.message);
        }
      };
    // Fetch data only after route.params is available
    useEffect(() => {
        const fetchData = async () => {
          if (route?.params?.item?._id) {
            setUserId(route.params.item._id);
            await fetchUserData(route.params.item._id);
          }
        };
        fetchData();
      }, [route?.params?.item?._id]);



      const checkFriendRequestStatus = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) throw new Error("Token not found");
      
          const headers = { Authorization: `Bearer ${token}` };
      
          // Fetch both users' data
          const userResponse = await axios.get(`http://192.168.1.5:5000/user/profile/${loggedInUserId}`, { headers });
          const friendResponse = await axios.get(`http://192.168.1.5:5000/user/profile/${userId}`, { headers });
      
          const user = userResponse.data;
          const friend = friendResponse.data;
      
          // Check if they are friends
          if (user.friends.includes(userId) && friend.friends.includes(loggedInUserId)) {
            setFriendRequestStatus("friends");
          } else {
            // Check for pending friend requests
            const requestResponse = await axios.get(
              `http://192.168.1.5:5000/friends/check-status/${loggedInUserId}/${userId}`,
              { headers }
            );
      
            // Explicitly handle the "unfriended" state
            if (requestResponse.data.status === "none") {
              setFriendRequestStatus("none");
            } else {
              setFriendRequestStatus(requestResponse.data.status);
            }
          }
        } catch (error) {
          console.error("Error checking friend request status:", error.response?.data || error.message);
        }
      };
    
    
    useEffect(() => {
        console.log("UserId:", userId);
        console.log("LoggedInUserId:", loggedInUserId);

        if (userId && loggedInUserId) { // Ensure both are available
            checkFriendRequestStatus();
        }
        console.log(friendRequestStatus)
    }, [userId, loggedInUserId]); // Depend on both


    const sendFriendRequest = async () => {
        try {
            console.log("Sending friend request from:", loggedInUserId, "to:", userId); // Debugging
            const token = await AsyncStorage.getItem("token");
            if (!token) throw new Error("Token not found");
    
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(
                "http://192.168.1.5:5000/friends/send-request",
                { senderId: loggedInUserId, receiverId: userId },
                { headers }
            );
            console.log("SENT REQUEST:", response.message);
    
            setFriendRequestStatus("pending");
        } catch (error) {
            console.error("Error sending friend request:", error.message);
        }
    };

    const acceptFriendRequest = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) throw new Error("Token not found");
    
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(
                "http://192.168.1.5:5000/friends/accept-request",
                { requestId: friendRequestId },
                { headers }
            );
    
            setFriendRequestStatus("accepted");
        } catch (error) {
            console.error("Error accepting friend request:", error.message);
        }
    };    

    const unfriendUser = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) throw new Error("Token not found");
      
          const headers = { Authorization: `Bearer ${token}` };
      
          // Call the unfriend endpoint
          const response = await axios.post(
            `http://192.168.1.5:5000/friends/unfriend/${loggedInUserId}/${userId}`,
            {},
            { headers }
          );
      
          console.log("Unfriended successfully:", response.data.message); // Debugging
      
          // Re-check friend request status
          await checkFriendRequestStatus();
        } catch (error) {
          console.error("Error unfriending:", error.response?.data?.message || "Server error");
        }
      };

    const unfriendAlert = () => {
        Alert.alert(
            "Unfriend", 
            "Are you sure you want to unfriend this user?", 
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => unfriendUser() }
            ]
        );
    }

    useFocusEffect(
        useCallback(() => {
            checkFriendRequestStatus();
            fetchUserData();
        }, [])
    )
    
      useEffect(() => {
        console.log(route?.params)
        //console.log(userId);
      }, [userId]);

      useEffect(() => {
        console.log("FRIEND REQUEST STATUS :", friendRequestStatus);
      }, [friendRequestStatus])

    //   useEffect(() => {
    //     console.log(userPosts);
    //   }, [userPosts]);

  return (
    <>
        <ScrollView nestedScrollEnabled style={{backgroundColor:Colors.background}}>
            <LinearGradient
                colors={['rgb(200, 73, 0)','rgb(255, 146, 104)', '#fdffe7']} // Gradient from primary to transparent
                start={{ x: 0, y: 0 }} // Starts at the top
                end={{ x: 0, y: 1 }} // Ends at the bottom
                style={{ paddingTop: 10, paddingBottom: 20 }} // Extend gradient to cover stories
            >
                <View style={{paddingHorizontal:15, flexDirection:'row', alignItems:'center', gap:10}}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons style={{marginTop:35}} name='caret-back-circle' size={30} color='black' />
                    </TouchableOpacity>
                    <Text style={{marginTop:30, fontFamily:'font-bold', fontSize:30, color:'black'}}>{userData?.username}</Text>
                </View>

                <View style={{paddingHorizontal:20, flexDirection:'row', gap:30, marginTop:20}}>
                    <View style={{justifyContent:'center', alignItems:'center', width:'100%', flexDirection:'column'}}>
                        <TouchableOpacity>
                            <Image
                                style={{ height: 120, width: 120, borderRadius: 100, borderWidth:3 }}
                                source={{ uri: userData?.profilePic}}
                            />
                        </TouchableOpacity>
                        <View style={{flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                                <View>
                                    <Text style={{fontFamily:'font-bold', fontSize:18}}>{userData?.name}</Text>
                                </View>
                                <View>
                                    <Text style={{fontFamily:'font-med', fontSize:14}}>{userData?.bio}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row', gap:30, marginTop: userData?.bio ? 10 : 0}}>
                                <TouchableOpacity style={{alignItems:'center', backgroundColor:Colors.primary, paddingVertical:5, paddingHorizontal:15, borderRadius:10, borderWidth:2}}>
                                    <Text style={{fontFamily:'font-bold', fontSize:16, color:'white'}}>{userPosts.length}</Text>
                                    <Text style={{fontFamily:'font-reg', fontSize:12, color:'white'}}>Posts</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate("FriendList", userId)} style={{alignItems:'center', backgroundColor:Colors.primary, paddingVertical:5, paddingHorizontal:10, borderRadius:10, borderWidth:2}}>
                                    <Text style={{fontFamily:'font-bold', fontSize:16, color:'white'}}>{userData?.friends?.length}</Text>
                                    <Text style={{fontFamily:'font-reg', fontSize:12, color:'white'}}>Friends</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                </View>

                {
                    friendRequestStatus === "friends" ? (
                        <View style={{ flexDirection: "row", gap: 20, alignItems: "center", justifyContent: "center", marginTop:20}}>
                            <TouchableOpacity
                                onPress={() => unfriendAlert()}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                    backgroundColor: Colors.quirky3,
                                    alignItems: "center",
                                    width: 150,
                                    borderWidth:3,
                                    boxShadow:'3px 2px 1px black'
                                }}
                            >
                                <Text style={{ fontFamily: "font-bold", color: "white", fontSize:18}}>Friends</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate("Chat", { userId: loggedInUserId, friendId: userId })}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderWidth: 3,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    width: 150,
                                    borderWidth:3,
                                    boxShadow:'3px 2px 1px black',
                                    backgroundColor: Colors.quirky4,
                                }}
                            >
                                <Text style={{ fontFamily: "font-bold", fontSize:18}}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                            <View style={{flexDirection:'row', justifyContent:'center', marginTop:20}}>
                                <TouchableOpacity
                                    onPress={() => sendFriendRequest()}
                                    disabled={friendRequestStatus === "pending" || friendRequestStatus === "accepted"}
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderWidth: 3,
                                        borderRadius: 10,
                                        backgroundColor: Colors.quirky2,
                                        alignItems: "center",
                                        width: 250,
                                        boxShadow:'3px 2px 1px black',
                                    }}
                                >
                                    <Text style={{ fontFamily: "font-bold", color: "white", fontSize:18}}>
                                        {friendRequestStatus === 'none' ? "Add Friend" : "Pending"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                           
                        )
                }
            </LinearGradient>
             <View style={styles.container}>
                <FlatList
                    data={userPosts}
                    keyExtractor={(item) => item._id.toString()}
                    numColumns={numColumns} // 3-column grid
                    columnWrapperStyle={({ index }) => {
                    // If the last row has only one image, align it to the left
                    if (userPosts.length % numColumns !== 0 && index >= userPosts.length - (userPosts.length % numColumns)) {
                        return { justifyContent: "flex-start" };
                    }
                    return { justifyContent: "space-around" };
                    }}
                    renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => navigation.navigate("UserPost", { item })}>
                        <Image 
                            source={{ uri: item.media }} 
                            style={{ width: 190, height: 250, borderRadius: 10, borderWidth: 3, marginTop: 10, marginLeft:10, resizeMode:'cover'}} 
                        />
                    </TouchableOpacity>
                    )}
                    nestedScrollEnabled={true} // Enable nested scrolling
                />
                </View>
        </ScrollView>
    </>
  )
}

export default OtherProfileScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop:0,
        marginBottom:50
      },
      image: {
        width: itemSize,
        height: itemSize,
        resizeMode: "cover",
        margin: 1, // Optional: Adds spacing between images
      },
})