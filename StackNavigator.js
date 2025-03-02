import { StyleSheet, Text, View, Platform} from 'react-native'
import React, {useContext} from 'react'
import Colors from './Colors'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { AuthContext } from './AuthContext'

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'


import HomeScreen from './screens/home-screen/HomeScreen'
import SearchScreen from './screens/search-screen/SearchScreen'
import MessagesScreen from './screens/messages-screen/MessagesScreen'
import ProfileScreen from './screens/profile-screen/ProfileScreen'
import LoginScreen from './screens/login-screen/LoginScreen'
import SignupScreen from './screens/signup-screen/SignupScreen'
import WelcomeScreen from './screens/welcome-screen/WelcomeScreen'
import ChatScreen from './screens/messages-screen/ChatScreen'
import UserPostScreen from './screens/profile-screen/UserPostScreen'
import PostUploadScreen from './screens/profile-screen/PostUploadScreen'
import OtherProfileScreen from './screens/search-screen/OtherProfileScreen'
import FriendRequestScreen from './screens/home-screen/FriendRequestScreen'
import NotificationScreen from './screens/home-screen/NotificationScreen'
import FriendListScreen from './screens/profile-screen/FriendListScreen'
import StoryScreen from './screens/home-screen/StoryScreen'
import EditProfileScreen from './screens/profile-screen/EditProfileScreen'


const StackNavigator = () => {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    const {token, setToken, isLoading} = useContext(AuthContext);

    const BottomTabs = () => {
        return (
            <Tab.Navigator
                style={{background:'transparent'}}
                screenOptions={{
                    tabBarStyle: styles.tabBar, // Apply custom styles
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <MaterialCommunityIcons
                                name={focused ? "home-circle" : "home-circle-outline"}
                                size={30}
                                color={'white'}
                            />
                        ),
                        tabBarLabel: () => null, // Hides the label
                    }}
                />
    
                <Tab.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                name={focused ? "search-circle-sharp" : "search-circle-outline"}
                                size={30}
                                color={'white'}
                            />
                        ),
                        tabBarLabel: () => null, // Hides the label
                    }}
                />
    
                <Tab.Screen
                    name="Message"
                    component={MessagesScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Feather
                                name={focused ? "message-circle" : "message-circle"}
                                size={focused ? 32 : 25}
                                color={'white'}
                            />
                        ),
                        tabBarLabel: () => null, // Hides the label
                    }}
                />
    
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                name={focused ? "person-circle" : "person-circle-outline"}
                                size={30}
                                color={'white'}
                            />
                        ),
                        tabBarLabel: () => null, // Hides the label
                    }}
                />
            </Tab.Navigator>
        );
    };


    const AuthStack = () => {
        return(
            <Stack.Navigator>
                <Stack.Screen name='Welcome' component={WelcomeScreen} options={{headerShown:false}}/>  
                <Stack.Screen name='Login' component={LoginScreen} options={{headerShown:false}}/>  
                <Stack.Screen name='Signup' component={SignupScreen} options={{headerShown:false}}/>
            </Stack.Navigator>
        )
    }


    const MainStack = () => {
        return(
            <Stack.Navigator>
                <Stack.Screen name='Main' component={BottomTabs} options={{headerShown:false}} />
                <Stack.Screen name='Chat' component={ChatScreen} options={{headerShown:false}} />
                <Stack.Screen name='UserPost' component={UserPostScreen} options={{headerShown:false}} />
                <Stack.Screen name='PostUpload' component={PostUploadScreen} options={{headerShown:false}} />
                <Stack.Screen name='OtherProfile' component={OtherProfileScreen} options={{headerShown:false}} />
                <Stack.Screen name='FriendRequest' component={FriendRequestScreen} options={{headerShown:false}} />
                <Stack.Screen name='Notification' component={NotificationScreen} options={{headerShown:false}} />
                <Stack.Screen name='FriendList' component={FriendListScreen} options={{headerShown:false}} />
                <Stack.Screen name='Story' component={StoryScreen} options={{headerShown:false}} />
                <Stack.Screen name='EditProfile' component={EditProfileScreen} options={{headerShown:false}} />
            </Stack.Navigator>
        )
    }

  return (
    <NavigationContainer>
        {
            token ? <MainStack />  : <AuthStack />
        }
        
    </NavigationContainer>
  )
}

export default StackNavigator

const styles = StyleSheet.create({
    tabBar: {
        bottom:10,
        left: '50%', // Center the tab bar (100% - 80% = 20%, so 10% on each side)
        width: '80%', // 80% of the screen width
        borderRadius: 30, // Rounded corners
        backgroundColor: Colors.quirky1, // Background color
        height: 50, // Adjust height as needed
        alignSelf: 'center', // Center horizontally
        borderWidth:5,
        borderColor:'black',
        alignItems:'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5, // Add elevation for Android
            },
        }),
    },
});