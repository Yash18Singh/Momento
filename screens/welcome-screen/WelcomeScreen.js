import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../Colors'
import { useNavigation } from '@react-navigation/native'

const WelcomeScreen = () => {
    const navigation = useNavigation();

  return (
    <SafeAreaView style={{backgroundColor:Colors.background, height:'100%'}}>  
        <View style={{flex:1, paddingVertical:60, paddingHorizontal:20}}>
            
            <View>
                <Image source={{uri:'https://img.freepik.com/free-vector/cool-lumina-studio-page-linkedin-profile-picture_742173-7554.jpg'}}
                       style={{width:'100%', height:400, borderRadius:10, borderWidth:4, boxShadow:'5px 5px 1px black'}}
                />
            </View>

            <View style={{justifyContent:'center', alignItems:'center', marginTop:40}}>
                <Text style={{fontFamily:'font-logo', fontSize:60, color:Colors.primary}}>Memento</Text>
                <Text style={{marginTop:10, fontFamily:'font-med', fontSize:18, textAlign:'center', color:Colors.textSecondary}}>Connect with friends, Share your best memories</Text>
            </View>

            <View style={{marginTop:50, alignItems:'center', justifyContent:'center', gap:20}}>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}  style={{padding:12, backgroundColor:Colors.primary, width:'70%', borderRadius:10, borderWidth:4, boxShadow:'2px 2px 1px black'}}>
                    <Text style={{fontFamily:'font-bold', color:'white', textAlign:'center', fontSize:20}}>Join Us!</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{padding:12, backgroundColor:Colors.secondaryBackground, width:'70%', borderRadius:10, borderWidth:4, boxShadow:'2px 2px 1px black'}}>
                    <Text style={{fontFamily:'font-bold', color:'black', textAlign:'center', fontSize:14}}>Already our member?</Text>
                </TouchableOpacity>
            </View>

        </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({})