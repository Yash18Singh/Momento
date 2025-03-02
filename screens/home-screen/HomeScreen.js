import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Colors, { QuirkyColors } from '../../Colors';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Modern icons
import UserStory from '../../components/UserStory';
import FeedPosts from '../../components/FeedPosts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background

const HomeScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [stories, setStories] = useState([]);
  const [storyColors, setStoryColors] = useState({}); // Store story colors
  const [storyLoading, setStoryLoading] = useState(false);

  // Function to get a random quirky color
  const getRandomQuirkyColor = () => {
    return QuirkyColors[Math.floor(Math.random() * QuirkyColors.length)];
  };

  // Fetch Stories
  const fetchStories = async () => {
    try {
      //setStoryLoading(true);
      const response = await axios.get(`http://192.168.1.5:5000/story/get/${userId}`);
      setStories(response.data);
      setStoryLoading(false)
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStories();
    }
  }, [userId]);

  // Fetch User ID
  const fetchUser = async () => {
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

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch Friends' Posts
  const fetchFriendsPosts = async () => {
    try {
      const response = await axios.get(`http://192.168.1.5:5000/friends/posts/${userId}`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFriendsPosts();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchFriendsPosts();
      fetchStories();
    }, [userId])
  );


  return (
    <>
      {/* Gradient Background for Header and Stories Section */}
      <ScrollView
        vertical={true}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors.background}}
      >
        <LinearGradient
          colors={['rgb(186, 68, 0)','rgb(255, 141, 96)', '#fdffe7']} // Gradient from primary to transparent
          start={{ x: 0, y: 0 }} // Starts at the top
          end={{ x: 0, y: 1 }} // Ends at the bottom
          style={{ paddingTop: 40, paddingBottom: 20 }} // Extend gradient to cover stories
        >
          {/* Top Navbar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: 'font-logo', fontSize: 35, color: 'white' }}>Memento</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity style={{padding:10, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}} onPress={() => navigation.navigate("FriendRequest")}>
                <Ionicons name="people-outline" size={27} color="white" /> {/* Modern icon */}
              </TouchableOpacity>

              <TouchableOpacity style={{padding:10, backgroundColor:Colors.quirky1, borderRadius:100, borderWidth:3}}>
                <MaterialIcons name="notifications-none" size={27} color="white" /> {/* Modern icon */}
              </TouchableOpacity>
            </View>
          </View>

          {/* Stories Section */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 }}
            style={{ marginTop: 10 }}
          >
            <UserStory setLoading={setStoryLoading} fetchStories={fetchStories} userId={userId} />
            {stories.map((group) => (
              <TouchableOpacity
                style={{ flexDirection: 'column', alignItems: 'center', gap: 2 }}
                key={group.user._id}
                onPress={() => navigation.navigate("Story", { stories: group.stories, userId: userId })}
              >
                  <>
                    <View style={{ borderWidth: 3, borderRadius: 100, padding: 2, boxShadow:'3px 1px 1px black' }}>
                        <Image
                          style={{ height: 70, width: 70, borderRadius: 100}}
                          source={{ uri: group.user.profilePic }}
                        />
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'font-bold', color: 'black' }}>{group.user.username}</Text>
                  </>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

      {/* Feed */}
        <View style={{paddingHorizontal:10}}>
          {/* Posts Section */}
          <View style={{ marginBottom: 50 }}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              posts.map((post) => (
                <FeedPosts
                  postId={post._id}
                  key={post._id}
                  postOwnerId={post.user._id}
                  fullName={post.user.name}
                  userName={post.user.username}
                  profileImg={post.user.profilePic}
                  postImg={post.media}
                  likeCount={post.likes.length}
                  commentCount={post.comments.length}
                  caption={post.caption}
                  date={new Date(post.createdAt).toLocaleDateString()}
                  bgColor={getRandomQuirkyColor()} // Pass random color to FeedPosts
                />
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </>
  );
};

export default HomeScreen;