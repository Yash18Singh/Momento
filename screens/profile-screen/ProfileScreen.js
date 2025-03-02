import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Colors from '../../Colors'
import { AntDesign, Entypo, Ionicons, MaterialIcons, FontAwesome5} from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background
import MasonryList from "react-native-masonry-list";


const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / 3;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');

  const {token, setToken} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [numColumns, setNumColumns] = useState(2);

  const logOut = async() => {
    await AsyncStorage.setItem('token', "");
    setToken("");
    navigation.navigate("Welcome")
  }

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

  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const fetchUserData = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error("Token not found");

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        setUserId(userId);

        // Set headers for authorization
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user details using axios
        const userResponse = await axios.get(`http://192.168.1.5:5000/user/profile/${userId}`, { headers });
        setUserData(userResponse.data);

        // Fetch user posts using axios
        const userPostsResponse = await axios.get(`http://192.168.1.5:5000/user/posts/${userId}`, { headers });
        setUserPosts(userPostsResponse.data);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchUserData();
  }, []);


  // Function to pick an image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      uploadImageToCloudinary(result.assets[0].uri);
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', { uri: imageUri, name: 'profile.jpg', type: 'image/jpeg' });
    formData.append('upload_preset', 'social-media-app'); // Cloudinary upload preset
    formData.append('cloud_name', 'da3c1ix9e');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/da3c1ix9e/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        updateProfilePicture(data.secure_url);
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile picture in MongoDB
  const updateProfilePicture = async (imageUrl) => {
    try {
      await axios.put(
        `http://192.168.1.5:5000/user/updateProfilePic/${userId}`,
        { profilePic: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData((prev) => ({ ...prev, profilePic: imageUrl }));
    } catch (error) {
      console.error('Profile Update Error:', error);
      alert('Failed to update profile picture.');
    }
  };

  const getImageSize = (index) => {
    if (index % 3 === 0) {
      return { width: '100%', height: 200 }; // Full width for every 3rd item
    } else {
      return { width: '48%', height: 150 }; // Half width for other items
    }
  };
  

  // useEffect(() => {
  //   console.log(userData);
  // }, [userData]);

  // useEffect(() => {
  //   console.log("USER POSTS :", userPosts);
  // }, [userPosts]);


  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  )


  return (
    <>
      <ScrollView nestedScrollEnabled style={{backgroundColor:Colors.background}}>
        <LinearGradient
            colors={['rgb(200, 73, 0)','rgb(255, 146, 104)', '#fdffe7']} // Gradient from primary to transparent
            start={{ x: 0, y: 0 }} // Starts at the top
            end={{ x: 0, y: 1 }} // Ends at the bottom
            style={{ paddingTop: 20, paddingBottom: 20 }} // Extend gradient to cover stories
        >
          <View style={{paddingHorizontal:15, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{marginTop:30, fontFamily:'font-extra', fontSize:30, color:'black'}}>{userData?.username}</Text>
              <View style={{flexDirection:'row', gap:5, alignItems:'center', marginTop:30}}>
                <TouchableOpacity style={{padding:10, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}} onPress={() => navigation.navigate("PostUpload", {userId})}>
                  <MaterialIcons name='add-to-photos' size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("EditProfile", {userId: userId})} style={{padding:10, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}}>
                  <FontAwesome5 name='user-edit' size={17} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={{padding:10, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}} onPress={logOut}>
                  <Entypo name='log-out' size={20} color="black" />
                </TouchableOpacity>
              </View>
          </View>
          <View style={{paddingHorizontal:20, flexDirection:'row', gap:30, marginTop:20}}>
            <View style={{justifyContent:'center', alignItems:'center', width:'100%', flexDirection:'column'}}>
                <TouchableOpacity onPress={pickImage} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                      <Image
                        style={{ height: 120, width: 120, borderRadius: 100, borderWidth:3 }}
                        source={{ uri: userData?.profilePic}}
                      />
                    )}
                </TouchableOpacity>
                <View style={{flexDirection:'column', gap:5, justifyContent:'center', alignItems:'center'}}>
                  <View>
                      <Text style={{fontFamily:'font-bold', fontSize:18}}>{userData?.name}</Text>
                    </View>
                    <View>
                        <Text style={{fontFamily:'font-reg', fontSize:14}}>{userData?.bio}</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row', gap:30, marginTop:5}}>
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
      

           
            {/* <View style={{padding:20, flexDirection:'row', gap:30, borderBottomWidth:3, backgroundColor:Colors.background}}>
                <View style={{flexDirection:'column', alignItems:'center', gap:10}}>
                  <TouchableOpacity onPress={pickImage} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                      <Image
                        style={{ height: 100, width: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.primary }}
                        source={{ uri: userData?.profilePic}}
                      />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => navigation.navigate("EditProfile", {userId: userId})} style={{paddingVertical:10, paddingHorizontal:20, borderWidth:0.3, borderRadius:20, backgroundColor:Colors.cardBackground,  alignItems:'center', width:150}}>
                      <Text style={{fontFamily:'font-reg'}}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>

                <View style={{flexDirection:'column', gap:10, alignItems:'center'}}>
                    <View>
                        <Text style={{fontFamily:'font-extra', fontSize:18}}>{userData?.name}</Text>
                    </View>

                    <View style={{flexDirection:'row', gap:30}}>
                        <TouchableOpacity style={{alignItems:'center'}}>
                          <Text style={{fontFamily:'font-bold', fontSize:16}}>{userPosts.length}</Text>
                          <Text style={{fontFamily:'font-reg', fontSize:12, color:Colors.textSecondary}}>Posts</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("FriendList", userId)} style={{alignItems:'center'}}>
                          <Text style={{fontFamily:'font-bold', fontSize:16}}>{userData?.friends?.length}</Text>
                          <Text style={{fontFamily:'font-reg', fontSize:12, color:Colors.textSecondary}}>Friends</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                      <Text style={{fontFamily:'font-reg'}}>{userData?.bio}</Text>
                    </View>
                </View>
            </View>
            
         
          <View style={styles.container}>
              <FlatList
                data={userPosts}
                keyExtractor={(item) => item._id.toString()}
                numColumns={3} // 3-column grid
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => navigation.navigate("UserPost", {item})}>
                    <Image source={{ uri: item.media }} style={styles.image} />
                  </TouchableOpacity>
                )}
                nestedScrollEnabled={true} // Enable nested scrolling
              />
          </View> */}

    </>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    marginBottom:50
  },
  image: {
    width: itemSize,
    height: itemSize,
    resizeMode: "cover",
    margin: 1, // Optional: Adds spacing between images
  },
})