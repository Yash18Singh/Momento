import { Image, Text, View, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Colors from '../Colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const UserStory = ({userId, fetchStories, setLoading}) => {
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchUserData = async() => {
      try {
        const response = await axios.get(`http://192.168.1.5:5000/user/profile/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchUserData();
  }, []);

  // useEffect(() => {
  //   console.log("USER STORY DATA :", userData);
  // }, [userData]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      uploadStory(result.assets[0].uri);
    }
  };

  const uploadStory = async (imageUri) => {
    setUploading(true);
    try {
      //setLoading(true);
      let formData = new FormData();
      formData.append('file', { 
        uri: imageUri, 
        type: 'image/jpeg', 
        name: 'story.jpg' 
      });
      formData.append('upload_preset', 'social-media-app');
      formData.append('cloud_name', 'da3c1ix9e');
  
      let cloudinaryRes = await axios.post(
        'https://api.cloudinary.com/v1_1/da3c1ix9e/image/upload', 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' } // Add this
        }
      );
  
      let mediaUrl = cloudinaryRes.data.secure_url;
      
      await axios.post(`http://192.168.1.5:5000/story/add/${userId}`, { media: mediaUrl });
  
      alert("Story added!");
      setLoading(false);
      fetchStories();
    } catch (error) {
      console.error("Error uploading story:", error.message);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStories();
    }, [])
  )

  return (
    <>
        <TouchableOpacity onPress={pickImage} style={{ flexDirection:'column', alignItems: 'center', gap: 2, justifyContent:'center'}}>
          <TouchableOpacity onPress={pickImage} style={{padding:10, backgroundColor:'white', height:70, width:70, borderRadius:100, justifyContent:'center', alignItems:'center', borderWidth:3}}>
            <MaterialIcons  name='add' size={40} color='black' />
          </TouchableOpacity>
          <Text style={{ fontSize: 12, fontFamily:'font-med' }}>Add Story</Text>
        </TouchableOpacity>
    </>
  );
};

export default UserStory;
