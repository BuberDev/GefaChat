import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React from 'react';
import COLORS from '../constants/colors';

const MainScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, gap: 40, backgroundColor: COLORS.white }}>
      <Image
        style={{ width: 200, height: 100, marginHorizontal: 22 }}
        source={require('../assets/images/GafaMiniLogo.png')}
      />
      <View
        style={{
          flex: 5,
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom:30
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Chat')}
          style={{
            backgroundColor: 'lightgrey',
            width: 250,
            height: 150,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <Text style={{ fontSize: 25, color: 'white' }}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('Chat')}
          style={{
            backgroundColor: 'lightgrey',
            width: 250,
            height: 150,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 25, color: 'white' }}>
            Equipment Monitoring
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Chat')}
          style={{
            backgroundColor: 'lightgrey',
            width: 250,
            height: 150,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 25, color: 'white' }}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
