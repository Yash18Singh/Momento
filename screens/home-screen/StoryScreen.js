import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';
import { AntDesign, Feather, FontAwesome, MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, {getRandomQuirkyColor} from '../../Colors';

const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${progress}%` }]} />
    </View>
  );
};

const StoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userId, setUserId] = useState('');
  const [stories, setStories] = useState([]);
  const [isUserStory, setIsUserStory] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (route?.params) {
      setStories(route?.params.stories);
      setUserId(route?.params.userId);
    }
  }, [route?.params]);

  useEffect(() => {
    if (stories.length > 0) {
      setIsUserStory(stories[0].user._id === userId);
      fetchUserData(stories[0].user._id);
    }
  }, [stories, userId]);

  const fetchUserData = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error("Token not found");

      const headers = { Authorization: `Bearer ${token}` };
      const userResponse = await axios.get(`http://192.168.1.5:5000/user/profile/${userId}`, { headers });
      setUserData(userResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
    }
  };

  const deleteStory = async () => {
    try {
      await axios.delete(`http://192.168.1.5:5000/story/delete/${stories[currentStoryIndex]._id}/${userId}`);
      alert("Story deleted");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const openProfile = () => {
    if (!isUserStory) {
      navigation.navigate("OtherProfile", { item: { _id: stories[currentStoryIndex].user._id } });
    }
  };

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Calculate progress for the ProgressBar
  const progress = ((currentStoryIndex + 1) / stories.length) * 100;

  return (
    <View style={{flex:1, height:'100%', backgroundColor: '#6B5B95', justifyContent:'center'}}>
      <View style={{flexDirection: 'column', justifyContent: 'center', gap: 20, height: '93%' }}>
        <View>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            {stories.map((_, index) => (
              <View key={index} style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: index <= currentStoryIndex ? '100%' : '0%' },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center'}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginLeft:5 }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <FontAwesome name='window-close' color='white' size={30} />
              </TouchableOpacity>

              <TouchableOpacity onPress={openProfile} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image style={{ height: 50, width: 50, borderRadius: 100, borderWidth:3, borderColor:'white'}} source={{ uri: userData?.profilePic }} />
                <Text style={{ fontFamily: 'font-med', color: 'white', fontSize:20}}>{userData?.username}</Text>
              </TouchableOpacity>
            </View>
            {isUserStory && (
              <TouchableOpacity onPress={deleteStory}>
                <MaterialCommunityIcons name='trash-can-outline' color='white' size={30} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Story Image with Touchable Areas */}
        {stories.length > 0 && (
          <View style={{ flex: 1, position: 'relative' }}>
            <Image source={{ uri: stories[currentStoryIndex].media }} style={{ width: '100%', height: '100%', borderWidth:3, borderRadius:10}} />

            {/* Left Touchable Area (Previous Story) */}
            <TouchableOpacity
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%' }}
              onPress={goToPreviousStory}
            />

            {/* Right Touchable Area (Next Story) */}
            <TouchableOpacity
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%' }}
              onPress={goToNextStory}
            />
          </View>
        )}

        {/* Reply Input */}
        <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
          <TextInput
            style={{ width:'90%', color: 'white', borderWidth: 3, borderColor: 'white', padding: 15, borderRadius: 100, fontFamily:'font-med'}}
            placeholderTextColor={'white'}
            placeholder='Reply to story...'
          />
        </View>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: 'black',
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgb(0, 0, 0)',
    borderRadius: 30,
    marginHorizontal: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
  },
});

export default StoryScreen;