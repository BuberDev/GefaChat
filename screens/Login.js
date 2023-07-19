import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import Button from '../components/Button';
import SockJS from 'sockjs-client';
import StompWS from 'react-native-stomp-websocket';
import { Client } from '@stomp/rn-stompjs';

var stompClient = null;

const Login = ({ navigation }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    receivername: '',
    connected: false,
    message: '',
  });
  const handleUserName = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, username: value });
  };

  const connect = () => {
    let Sock = new StompWS('http://localhost:8080/ws');
    stompClient = new Client({
      brokerURL: 'http://localhost:8080/ws',
      connectHeaders: { login: 'mylogin', passcode: 'mypasscode' },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    stompClient.onConnect = onConnected;
    stompClient.onStompError = onError;
    stompClient.activate();
  };

  const onConnected = (frame) => {
    setUserData({ ...userData, connected: true });
    stompClient.subscribe('/chatroom/public', onPublicMessageReceived);
    stompClient.subscribe(
      '/user/' + userData.username + '/private',
      onPrivateMessageReceived
    );
    userJoin();
  };

  const registerUser = () => {
    connect();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, marginHorizontal: 22 }}>
        <View style={{ marginVertical: 22 }}>
          <Image
            style={{ width: 200, height: 100 }}
            source={require('../assets/images/GafaMiniLogo.png')}
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              marginVertical: 32,
              color: COLORS.black,
            }}
          >
            Login
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: COLORS.black,
            }}
          >
            {' '}
            Let's Login to your account
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 400,
              marginVertical: 8,
            }}
          >
            Username
          </Text>

          <View
            style={{
              width: '100%',
              height: 48,
              borderColor: COLORS.black,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 22,
            }}
          >
            <TextInput
              id="user-name"
              placeholder="Enter your username"
              placeholderTextColor={COLORS.grey}
              keyboardType="email-address"
              name="userName"
              value={userData.username}
              onChange={handleUserName}
              style={{
                width: '100%',
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 400,
              marginVertical: 8,
            }}
          >
            Password
          </Text>

          <View
            style={{
              width: '100%',
              height: 48,
              borderColor: COLORS.black,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 22,
            }}
          >
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={COLORS.grey}
              secureTextEntry={isPasswordShown}
              style={{
                width: '100%',
              }}
            />

            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: 'absolute',
                right: 12,
              }}
            >
              {isPasswordShown == true ? (
                <Ionicons name="eye-off" size={24} color={COLORS.black} />
              ) : (
                <Ionicons name="eye" size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginVertical: 6,
          }}
        >
          <Checkbox
            style={{ marginRight: 8 }}
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? COLORS.primary : undefined}
          />

          <Text>Remenber Me</Text>
        </View>

        <Button
          title="Login"
          filled
          style={{
            marginTop: 48,
            marginBottom: 4,
          }}
          onPress={() => {
            navigation.navigate('MainScreen');
            registerUser();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Login;
