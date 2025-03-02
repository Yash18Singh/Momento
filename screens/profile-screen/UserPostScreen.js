import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import Colors, {getRandomQuirkyColor} from '../../Colors';
import FeedPosts from '../../components/FeedPosts';
import { LinearGradient } from 'expo-linear-gradient'; 

const formatDate = (isoString) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const date = new Date(isoString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

const UserPostScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();

    useEffect(() => {
        console.log(route?.params?.item);
    }, []);
    

  return (
    <ScrollView style={{backgroundColor:Colors.background, flex:1}}>
           <LinearGradient
                colors={['rgb(142, 52, 0)','rgb(255, 141, 96)', '#fdffe7']} // Gradient from primary to transparent
                start={{ x: 0, y: 0 }} // Starts at the top
                end={{ x: 0, y: 1 }} // Ends at the bottom
                style={{ paddingTop: 30, paddingBottom: 20 }} // Extend gradient to cover stories
            >
                <View style={{paddingHorizontal:15, flexDirection:'row', alignItems:'center', gap:15}}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons style={{marginTop:30}} name='caret-back-circle' size={30} color='black' />
                    </TouchableOpacity>
                    <View style={{marginTop:30, alignItems:'center', flexDirection:'column', width:'80%'}}>
                        <Text style={{fontSize:14, color:'black', fontFamily:'font-med'}}>{route?.params?.item?.user.username}</Text>
                        <Text style={{fontSize:20, color:'black', fontFamily:'font-head-bold'}}>POST</Text>
                    </View>
                </View>
            </LinearGradient>
            

            <View style={{paddingHorizontal:10, paddingVertical:10}}>
                <FeedPosts 
                    postId={route?.params?.item?._id}
                    postOwnerId={route?.params?.item?.user?._id}
                    fullName={route?.params?.item?.user.name}
                    userName={route?.params?.item?.user.username}
                    profileImg={route?.params?.item?.user.profilePic}
                    postImg={route?.params?.item.media}
                    likeCount={route?.params.item?.likes.length}
                    commentCount={route?.params.item?.comments.length}
                    caption={route?.params.item.caption}
                    date={new Date(route?.params.item.createdAt).toLocaleDateString()}
                    bgColor={getRandomQuirkyColor()}
                />
            </View>
    </ScrollView>
  )
}

export default UserPostScreen

const styles = StyleSheet.create({})