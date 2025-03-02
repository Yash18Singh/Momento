import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import Colors from "../../Colors"; // Ensure you have this file or replace it with color codes
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [responseMessage, setResponseMessage] = useState('');
  const {token, setToken} = useContext(AuthContext);

  const [userData, setUserData] = useState({
    email:'',
    password:'',
  });

  const submitDetails = async () => {
    if (!userData.email || !userData.password) {
        setResponseMessage("Please fill all the fields");
        return;
    }

    try {
        const response = await axios.post("http://192.168.1.5:5000/auth/login", {
            email: userData.email,
            password: userData.password
        });

        if (response.status === 200) {
            console.log("Login successful:", response.data);
            //setResponseMessage(response.data.message);
            //setToken(response.data.token); // Store token if using context

            if(response.data.token){
              await AsyncStorage.setItem('token', response.data.token);
              setToken(response.data.token);
              navigation.navigate("Home");
            }
        } else {
            setResponseMessage(response.data.message);
        }
    } catch (error) {
        console.error("Login Error:", error);
        setResponseMessage("Failed to login. Please try again.");
    }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <Image style={styles.image} source={{uri:'https://img.freepik.com/free-vector/friends-video-calling-concept_23-2148496149.jpg'}} />
      </View>

      <View style={styles.scrollView}>
          <Text style={{marginTop:10, fontFamily:'font-extra', fontSize:25}}>Login Here</Text>

          <View style={{flex:1, marginTop:20, width:'75%', flexDirection:'column', gap:10}}>
              <TextInput 
                  style={styles.input}
                  placeholder="Enter your Email..."
                  value={userData.email}
                  onChangeText={(text) => setUserData({...userData, email:text})}
                  placeholderTextColor={'black'}
              />
              <TextInput 
                  secureTextEntry={true}
                  style={styles.input}
                  placeholder="Enter your Password..."
                  value={userData.password}
                  onChangeText={(text) => setUserData({...userData, password:text})}
                  placeholderTextColor={'black'}
              />

              {
                responseMessage && 
                <Text style={{fontSize:14, color:'red', textAlign:'center'}}>{responseMessage}</Text>
              }

              <TouchableOpacity onPress={submitDetails} style={styles.button}>
                <Text style={{color:'white', fontFamily:'font-med', fontSize:20}}>Let's Go!!</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.secondaryButton}>
                <Text style={{color:'black', fontFamily:'font-med', fontSize:14}}>Join us Here!</Text>
              </TouchableOpacity>
          </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  image: {
    width: "100%",
    height: 450,
  },
  scrollView: {
    backgroundColor: Colors.background,
    height:'100%',
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
    boxShadow:'3px -3px 1px black',
    marginTop:-70,
    alignItems:'center',
    borderWidth:4
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontFamily: "font-extra",
    fontSize: 25,
  },
  subtitle: {
    fontFamily: "font-bold",
    fontSize: 20,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#000',  // Ensure border color is set
    fontFamily: 'font-bold',
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: 'white',
    textAlignVertical: 'center',  // Ensures text is centered vertically
    boxShadow:'1px 1px 1px black'
  },
  button:{
    backgroundColor:Colors.primary,
    padding:15,
    alignItems:'center',
    borderRadius:10,
    marginTop:20,
    borderWidth:4,
    boxShadow:'2px 2px 1px black'
  },
  secondaryButton:{
    backgroundColor:'white',
    padding:10,
    alignItems:'center',
    borderRadius:10,
    marginTop:10,
    borderWidth:4,
    boxShadow:'2px 2px 1px black'
  }
});

export default LoginScreen;
