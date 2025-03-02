import { Image, Text, View } from 'react-native';
import React from 'react';

const MessageComponent = ({ friend, bgColor}) => {
  return (
    <View style={{boxShadow:'4px 1px 1px black', flexDirection: 'row', alignItems: 'center', gap: 20, paddingVertical: 10, paddingHorizontal: 15, borderWidth:3, borderRadius:5, backgroundColor:bgColor}}>
      <Image 
        style={{ height: 70, width: 70, borderWidth: 3, borderRadius: 10 }} 
        source={{ uri: friend.profilePic || 'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg' }} 
      />
    
      <View>
        <Text style={{ fontFamily: 'font-bold', fontSize:20}}>{friend.name}</Text>
        <Text style={{fontFamily:'font-reg', fontSize:12}}>Tap to Chat</Text>
      </View>
    </View>
  );
};

export default MessageComponent;
