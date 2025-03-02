import { StyleSheet, Text, View, ScrollView, TextInput, FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Colors, {QuirkyColors, getRandomQuirkyColor} from '../../Colors'
import SearchResult from '../../components/SearchResult'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [myUserId, setMyUserId] = useState([]);
  const navigation = useNavigation();
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    const fetchUser = async() => {
      try {
        const token = await AsyncStorage.getItem('token');
        if(!token){
          throw new Error("Token not found");
        }
        const decodedToken = jwtDecode(token);
        setMyUserId(decodedToken.userId);
        console.log(myUserId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    }
    fetchUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://192.168.1.5:5000/user/allUsers'); // Adjust your API URL
      setUsers(response.data);
      setFilteredUsers(response.data); // Initially set to all users
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  )

  // Filter users based on search input and exclude the current user
    useEffect(() => {
      if (searchQuery.trim() === '') {
        setFilteredUsers(users.filter(user => user._id !== myUserId)); // Exclude current user
      } else {
        setFilteredUsers(
          users
            .filter(user => 
              (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.username.toLowerCase().includes(searchQuery.toLowerCase())) &&
              user._id !== myUserId // Exclude current user
            )
        );
      }
    }, [searchQuery, users, myUserId]);


  return (
    <>
      <LinearGradient
          colors={['rgb(142, 52, 0)','rgb(255, 141, 96)', Colors.background]} // Gradient from primary to transparent
          start={{ x: 0, y: 0 }} // Starts at the top
          end={{ x: 0, y: 1 }} // Ends at the bottom
          style={{ paddingTop: 20, paddingBottom: 30 }} // Extend gradient to cover stories
      >
        <View style={{ marginTop: 60, paddingHorizontal: 30 }}>
          <TextInput 
            style={{ paddingVertical:15, borderWidth: 0.4, borderRadius: 30, paddingHorizontal: 20, fontFamily: 'font-med', fontSize: 16, backgroundColor:'white', borderWidth:3}} 
            placeholder='Search people here...' 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <View style={{flex:1, backgroundColor:Colors.background, padding:20}}>
          <FlatList
            key={numColumns} // Force re-render when numColumns changes
            data={filteredUsers}
            keyExtractor={(item) => item._id.toString()}
            numColumns={numColumns} // Dynamic number of columns
            columnWrapperStyle={numColumns === 2 ? { justifyContent: 'space-around' } : null} // Conditional style
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={{ width: numColumns === 2 ? '48%' : '100%', marginBottom: 10 }} // Adjust width dynamically
                onPress={() => navigation.navigate("OtherProfile", { item })}
              >
                <SearchResult item={item} bgColor={getRandomQuirkyColor()} />
              </TouchableOpacity>
            )}
          />
      </View>
    </>

    // <View style={{ flex: 1, backgroundColor: Colors.background }}>
    //   {/* Search Bar */}
      // <View style={{ marginTop: 60, paddingHorizontal: 20 }}>
      //   <TextInput 
      //     style={{ borderWidth: 0.4, borderRadius: 30, paddingHorizontal: 20, fontFamily: 'font-reg', fontSize: 14 }} 
      //     placeholder='Search people here...' 
      //     value={searchQuery}
      //     onChangeText={setSearchQuery}
      //   />
      // </View>

    //   {/* User List */}
      // <FlatList
      //   data={filteredUsers}
      //   keyExtractor={(item) => item._id.toString()}
      //   renderItem={({ item }) => <TouchableOpacity onPress={() => navigation.navigate("OtherProfile", {item})}>
      //     <SearchResult item={item} />
      //   </TouchableOpacity>}
      // />
    // </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({});
