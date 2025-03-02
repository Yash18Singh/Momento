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
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [userExists, setUserExists] = useState(false);
  const [requiredFields, setRequiredFields] = useState(false);

  const {token, setToken} = useContext(AuthContext);

  const [userData, setUserData] = useState({
    name:'',
    email:'',
    username:'',
    password:''
  });

  const submitDetails = async() => {
    if(!userData.name || !userData.email || !userData.username || !userData.password){
      setRequiredFields(true);
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.5:5000/auth/signup', userData);

      if(response.status === 201){
        console.log("Signup successful :", response.data);
        setUserExists(false);
        setRequiredFields(false);
        setUserData({});
        
        if(response.data.token){
          navigation.navigate("Login");
        }

      } else{
        setUserExists(true);
        setRequiredFields(false);
        return;
      }
    } catch (error) {
      console.error("Signup Error:", error);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <Image style={styles.image} source={{uri:'https://img.freepik.com/premium-vector/friends-video-calling-concept_23-2148504259.jpg'}} />
      </View>

      <View style={styles.scrollView}>
          <Text style={{marginTop:10, fontFamily:'font-extra', fontSize:25}}>Sign Up Here</Text>
          <Text style={{fontFamily:'font-bold', fontSize:18}}>Please provide your details</Text>

          <View style={{flex:1, marginTop:20, width:'75%', flexDirection:'column', gap:10}}>
              <TextInput 
                  style={styles.input}
                  placeholder="Enter your Name..."
                  value={userData.name}
                  onChangeText={(text) => setUserData({...userData, name:text})}
                  placeholderTextColor={'black'}
              />
              <TextInput 
                  type='email'
                  style={styles.input}
                  placeholder="Enter your Email..."
                  value={userData.email}
                  onChangeText={(text) => setUserData({...userData, email:text})}
                  placeholderTextColor={'black'}
              />
              <TextInput 
                  style={styles.input}
                  placeholder="Enter a Username..."
                  value={userData.username}
                  onChangeText={(text) => setUserData({...userData, username:text})}
                  placeholderTextColor={'black'}
              />
              <TextInput 
                  secureTextEntry={true}
                  style={styles.input}
                  placeholder="Enter a Password..."
                  value={userData.password}
                  onChangeText={(text) => setUserData({...userData, password:text})}
                  placeholderTextColor={'black'}
              />

              {
                userExists &&
                <Text style={{color:'red', textAlign:'center'}}>Email or Username already exists!</Text>
              }

              {
                requiredFields &&
                <Text style={{color:'red', textAlign:'center'}}>Please fill all the fields!</Text>
              }

              <TouchableOpacity onPress={submitDetails} style={styles.button}>
                <Text style={{color:'white', fontFamily:'font-med', fontSize:20}}>Click here to join us!</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.secondaryButton}>
                <Text style={{color:'black', fontFamily:'font-med', fontSize:14}}>Already joined us?</Text>
              </TouchableOpacity>
          </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground || "#F5F5F5",
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode:'cover'
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

export default SignUpScreen;
