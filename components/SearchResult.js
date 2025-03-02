import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const SearchResult = ({item, bgColor}) => {
  return (
    <View style={{marginTop:1, paddingHorizontal:10, paddingVertical:5, flexDirection:'column', alignItems:'center', gap:10, borderWidth:3, borderRadius:10, backgroundColor:bgColor || 'white', boxShadow:'3px 3px 1px black', width:'90%'}}>
      <View>
        <Image style={{height:100, width:100, borderRadius:100, resizeMode:'cover', borderWidth:3, boxShadow:'2px 2px 1px black'}} source={{uri: item.profilePic}} />
      </View>

      <View style={{flexDirection:'column', alignItems:'center'}}>
        <Text style={{fontFamily:'font-bold', fontSize:20}}>@{item.username}</Text>
        <Text style={{fontFamily:'font-med', fontSize:16}}>{item.name}</Text>
      </View>
    </View>
  )
}

export default SearchResult

const styles = StyleSheet.create({})