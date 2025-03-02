import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import Colors, {QuirkyColors, getRandomQuirkyColor} from '../Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

function formatDate(inputDate) {
  // Split the input date into month, day, and year
  const [month, day, year] = inputDate.split('/');

  // Create a Date object (Note: Months are 0-indexed in JavaScript)
  const date = new Date(year, month - 1, day);

  // Define an array of month names
  const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Get the day, month, and year
  const formattedDay = date.getDate(); // Day of the month (1-31)
  const formattedMonth = monthNames[date.getMonth()]; // Month name (e.g., 'Feb')
  const formattedYear = date.getFullYear().toString().slice(-2); // Last two digits of the year

  // Return the formatted date string
  return `${formattedDay} ${formattedMonth} ${formattedYear}`;
}


const FeedPosts = ({ postId, postOwnerId, fullName, userName, profileImg, postImg, commentCount, caption, date, bgColor}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userId, setUserId] = useState('');
  const navigation = useNavigation();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isOwner, setIsOwner] = useState(false); // New state
  

    const fetchPostData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error("Token not found");
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        setUserId(userId);
        setIsOwner(userId === postOwnerId); // Check ownership

        // Fetch updated like count and like status
        const response = await axios.get(`http://192.168.1.5:5000/uploadedPosts/check-likes/${postId}/${userId}`);
        setLikeCount(response.data.likeCount ?? 0);
        setIsLiked(response.data.isLiked ?? false);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    useEffect(() => {
      fetchPostData();
      fetchComments();
    }, [postId]);

  useEffect(() => {
    console.log("USER ID :", userId);
    console.log("POST OWNER: ", postOwnerId);
  }, [userId, postOwnerId])

  const handleDeletePost = async () => {
    try {
      await axios.delete(`http://192.168.1.5:5000/uploadedPosts/delete/${postId}`);
      alert('Post deleted successfully');
      // Optionally, you can remove the post from the feed using a state update in the parent component
    } catch (error) {
      console.error("Error deleting post:", error);
      alert('Failed to delete post');
    }
  };

  const handleLike = async () => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => (newLikedState ? prev + 1 : prev - 1));

      await axios.post(`http://192.168.1.5:5000/uploadedPosts/like/${postId}/${userId}`);
    } catch (error) {
      console.error("Error updating like:", error);
      setIsLiked(isLiked); // Revert on error
      setLikeCount(prev => (isLiked ? prev + 1 : prev - 1));
    }
  };


  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://192.168.1.5:5000/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error("Token not found");
  
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
  
      const response = await axios.post(`http://192.168.1.5:5000/comments/add/${postId}/${userId}`, { text: commentText });
  
      setComments([response.data.comment, ...comments]); // Add the new comment instantly
      setCommentText(''); // Clear input field
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error("Token not found");

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        await axios.delete(`http://192.168.1.5:5000/comments/delete/${commentId}/${userId}`);

        // Update the comments list by removing the deleted comment
        setComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));

    } catch (error) {
        console.error("Error deleting comment:", error.response?.data?.message || "Server error");
    }
};


  useFocusEffect(
    useCallback(() => {
      fetchPostData();
      fetchComments();
    }, [postId])
  );

  const openProfile = () => {
    if(isOwner){
      navigation.navigate("Profile");
    } else{
      navigation.navigate("OtherProfile", {item:{_id: postOwnerId}});
    }
  }
  
  
  return (
    <View style={[styles.container, {backgroundColor:bgColor || 'white'}]}>
      <View style={{flexDirection:'row', paddingHorizontal:25, paddingVertical:10, justifyContent:'space-between', alignItems:'center'}}>
        <TouchableOpacity onPress={() => openProfile()} style={{flexDirection:'row', alignItems:'center', gap:10}}>
          <Image style={{height:50, width:50, borderRadius:100, borderWidth:3}} source={{uri:profileImg}} />
          <View>
            <Text style={{fontFamily:'font-bold', fontSize:20}}>{userName}</Text>
            <Text style={{fontFamily:'font-reg', fontSize:10}}>{formatDate(date)}</Text>
          </View>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity onPress={handleDeletePost} style={{backgroundColor:'white', padding:3, borderRadius:10, borderWidth:3}}>
            <Ionicons name="trash-outline" size={25} color="red" />
          </TouchableOpacity>
        )}
      </View>
      {
        caption && 
        <View style={{paddingHorizontal:30, marginBottom:5}}>
          <Text style={{fontFamily:'font-med', fontSize:20}}>{caption}</Text>
        </View>
      }
      <View style={{paddingHorizontal:20}}>
        <Image style={{width:'100%', height:400, borderRadius:10, borderWidth:5}} source={{uri: postImg}} />
      </View>

      <View style={{paddingHorizontal:30, justifyContent:'space-around', flexDirection:'row', marginTop:10, marginBottom:showComments ? 5 : 30}}>
        <TouchableOpacity onPress={handleLike} style={{flexDirection:'column', alignItems:'center', backgroundColor: '#FFD1DC', padding:15, borderRadius:10, borderWidth:3}}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={30} color={isLiked ? 'red' : 'black'} />
            <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
            setShowComments(!showComments);
            if (!showComments) fetchComments();
          }} style={{flexDirection:'column', alignItems:'center', backgroundColor: '#FFA07A', padding:15, borderRadius:10, borderWidth:3}}>
          <Feather name='message-circle' size={30} color='black' />
          <Text style={styles.actionText}>{comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'column', alignItems:'center', backgroundColor: '#87CEEB', padding:15, borderRadius:10, borderWidth:3}}>
          <Feather name='send' size={30} color='black' />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'column', alignItems:'center', backgroundColor: '#E6E6FA', padding:15, borderRadius:10, borderWidth:3}}>
          <FontAwesome name='bookmark-o' size={30} color='black' />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>
      </View>

      {
        showComments &&
          <View style={{flexDirection:'column', gap:10}}>
                <View style={styles.commentSection}>
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <View style={styles.commentItem}>
                        <Image source={{ uri: item.user.profilePic }} style={styles.commentProfilePic} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.commentUser}>{item.user.username}</Text>
                          <Text style={styles.commentText}>{item.text}</Text>
                        </View>

                        {/* Show delete button if the user is the post owner or comment author */}
                        {(isOwner || item.user._id === userId) && (
                          <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
                            <Feather name="trash-2" size={20} color="red" />
                          </TouchableOpacity>
                        )}
                        </View>
                      )}
                    />
                  </View>

                  <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:30, marginBottom:30}}>
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Add a comment..."
                      style={styles.commentInput}
                    />
                    <TouchableOpacity style={{backgroundColor:'white', padding:10, borderRadius:30, borderWidth:3}} onPress={handleAddComment}>
                      <Feather name="send" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
            </View>
      }
    </View>

    // <SafeAreaView style={styles.container}>
    //   <View style={styles.header}>
    //     <TouchableOpacity onPress={() => openProfile()} style={{flexDirection:'row', alignItems:'center', gap:10}}>
    //       <Image style={styles.profileImage} source={{ uri: profileImg }} />
    //       <Text style={styles.userName}>{fullName}</Text>
    //     </TouchableOpacity>

        // {/* Show delete button only if the post belongs to the user */}
        // {isOwner && (
        //   <TouchableOpacity onPress={handleDeletePost} style={styles.deleteButton}>
        //     <Ionicons name="trash-outline" size={20} color="red" />
        //   </TouchableOpacity>
        // )}
    //   </View>

    //   <View>
    //     <Image style={styles.postImage} source={{ uri: postImg }} />
    //   </View>

    //   <View style={styles.actionsContainer}>
    //     <View style={styles.leftActions}>
    //       <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            // <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={30} color={isLiked ? 'red' : 'black'} />
            // <Text style={styles.actionText}>{likeCount}</Text>
    //       </TouchableOpacity>

          // <TouchableOpacity style={styles.actionButton} onPress={() => {
          //   setShowComments(!showComments);
          //   if (!showComments) fetchComments();
          // }}>
            // <Feather name='message-circle' size={25} color='black' />
            // <Text style={styles.actionText}>{comments.length}</Text>
    //       </TouchableOpacity>

    //       <TouchableOpacity style={styles.actionButton}>
            // <Feather name='send' size={25} color='black' />
    //       </TouchableOpacity>
    //     </View>

    //     <TouchableOpacity>
          // <FontAwesome name='bookmark-o' size={25} color='black' />
    //     </TouchableOpacity>
    //   </View>

    //   <View style={styles.captionContainer}>
    //     <Text style={styles.boldText}>{userName}</Text>
    //     <Text style={styles.regularText}>{caption}</Text>
    //   </View>

    //   <View style={styles.dateContainer}>
    //     <Text style={styles.dateText}>{date}</Text>
    //   </View>

    //   {showComments && (
        // <View style={styles.commentSection}>
        //   <FlatList
        //     data={comments}
        //     keyExtractor={(item) => item._id}
        //     renderItem={({ item }) => (
        //       <View style={styles.commentItem}>
        //         <Image source={{ uri: item.user.profilePic }} style={styles.commentProfilePic} />
        //         <View style={{ flex: 1 }}>
        //           <Text style={styles.commentUser}>{item.user.username}</Text>
        //           <Text style={styles.commentText}>{item.text}</Text>
        //         </View>

        //         {/* Show delete button if the user is the post owner or comment author */}
        //         {(isOwner || item.user._id === userId) && (
        //           <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
        //             <Feather name="trash-2" size={20} color="red" />
        //           </TouchableOpacity>
        //         )}
        //         </View>
        //       )}
        //     />


          // <View style={styles.commentInputContainer}>
          //   <TextInput
          //     value={commentText}
          //     onChangeText={setCommentText}
          //     placeholder="Add a comment..."
          //     style={styles.commentInput}
          //   />
          //   <TouchableOpacity onPress={handleAddComment}>
          //     <Feather name="send" size={24} color="blue" />
          //   </TouchableOpacity>
          // </View>
    //     </View>
    //   )}

    //   <View style={{ marginBottom: 10 }}></View>
    // </SafeAreaView>
  );
};

export default FeedPosts;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    borderRadius: 10,
    boxShadow:'5px 5px 1px rgb(0, 0, 0)',
    borderWidth:4,
  },
  header: {
    marginTop:-40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 0.3,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent:'space-between'
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 100,
    borderWidth: 1,
  },
  userName: {
    fontFamily: 'font-med',
    fontSize: 16,
  },
  postImage: {
    height: 400,
    width: '100%',
    resizeMode: 'cover',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'font-med',
    fontSize: 14,
    marginTop: 3,
  },
  captionContainer: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  boldText: {
    fontFamily: 'font-bold',
  },
  regularText: {
    fontFamily: 'font-reg',
  },
  dateContainer: {
    paddingHorizontal: 15,
  },
  dateText: {
    fontFamily: 'font-reg',
    fontSize: 10,
  },
  commentSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal:20,
  },
  commentProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 10,
  },
  commentUser: {
    fontFamily:'font-bold',
    fontSize:14
  },
  commentText: {
    fontSize: 16,
    fontFamily:'font-med',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    paddingVertical: 5,
  },
  commentInput: {
    flex: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    height: 50,
    marginRight: 10,
    backgroundColor:'white',
    borderWidth:3,
    fontFamily:'font-med'
  },
});
