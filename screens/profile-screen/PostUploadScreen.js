import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Alert, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient'; 


const PostUploadScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();

    const [userId, setUserId] = useState(route?.params?.userId);
    const [image, setImage] = useState(null);
    const [imageType, setImageType] = useState(""); // Store file type
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);

    // Function to open Action Sheet
    const openPickerOptions = () => {
        Alert.alert(
            "Select Option",
            "Choose from where you want to upload",
            [
                { text: "Gallery", onPress: pickImageFromGallery },
                { text: "Files", onPress: pickImageFromFiles },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    // Pick Image from Gallery
    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Sorry, we need camera roll permissions!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only Images
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageType("image/jpeg"); // Default type for images picked from gallery
        }
    };

    // Pick Image from Files
    const pickImageFromFiles = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "image/*", // Only allow images
            copyToCacheDirectory: true, // Ensure the file is accessible
        });
    
        console.log("File Picker Result:", result); // Debugging
    
        if (result.canceled || !result.assets || result.assets.length === 0) {
            return;
        }
    
        const file = result.assets[0]; // Extract the first file
        setImage(file.uri);
        setImageType(file.mimeType || "image/jpeg"); // Ensure correct file type
    };

    // Upload Post Function
    const uploadPost = async () => {
        if (!image) {
            alert("Please select an image");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("caption", caption);
            formData.append("media", {
                uri: image,
                type: imageType,
                name: "upload.jpg",
            });

            console.log("Uploading FormData:", formData); // Debugging

            const response = await axios.post("http://192.168.1.5:5000/post/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigation.goBack();
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to upload post.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(image);
    }, [image]);

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
                    <Text style={styles.headerText}>UPLOAD POST</Text>
                  </View>
            </LinearGradient>

            <View style={{ flex: 1, backgroundColor: Colors.background, gap: 20, alignItems: 'center' }}>
                <TouchableOpacity onPress={openPickerOptions} style={{ padding: 20, borderWidth: 3, backgroundColor: '#7aff8c', borderRadius: 10, marginTop:30}}>
                    <Text style={{fontFamily:'font-bold', fontSize:18}}>Choose from Device</Text>
                </TouchableOpacity>

                {image && (
                    <>
                        <TextInput
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 3,
                                height: 100,
                                textAlignVertical: "top",
                                padding: 10,
                                fontFamily: 'font-med',
                                fontSize: 15,
                                width: '90%',
                                borderRadius:10
                            }}
                            placeholder={"What's on your mind?"}
                            value={caption}
                            onChangeText={setCaption}
                        />

                        <Image source={{ uri: image }} style={{ width: '90%', height: 350, borderRadius:20, borderWidth:3}} />

                        <TouchableOpacity onPress={uploadPost} style={{ padding: 15, backgroundColor: Colors.primary, borderRadius: 10, width:200, borderWidth:3}}>
                            <Text style={{ color: 'black', fontSize: 18, textAlign:'center', fontFamily:'font-bold'}}>{loading ? "Uploading..." : "POST"}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </>
    );
}

export default PostUploadScreen;


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
});