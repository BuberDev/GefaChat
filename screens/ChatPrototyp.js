import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, Button, ScrollView, StyleSheet, TextInput, FlatList } from 'react-native';
import { Client } from '@stomp/stompjs';
import { TextEncoder, TextDecoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let client;
const ChatPrototyp = () => {
  const [privateChats, setPrivateChats] = useState(new Map());
  const [username, setUsername] = useState("");
  const [receivername, setReceivername] = useState("");
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [publicChats, setPublicChats] = useState([]);
  const [userData, setUserData] = useState({
    username: '',
    receivername: '',
    connected: false,
    message: ''
  });
  const [stompClient, setStompClient] = useState(null);

  const connect = async () => {
    client.configure({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        setConnected(true);
        console.log('WebSocket connected successfully');
        client.subscribe("/user/queue/reply", (payload) => {
          setMessage(JSON.parse(payload.body));
        }, 
        (error) => {
          console.log('Error during message subscription: ', error);
        });
      },
      onStompError: (frame) => {
        console.log('Error during STOMP connection: ', frame);
        setConnected(false);
      },
      onError: (error) => {
        console.log('Error during WebSocket connection: ', error);
        setConnected(false);
      }
    });
    await client.activate();
  };

  
  const send = () => {
    client.publish({
      destination: "/app/send/message",
      body: JSON.stringify({ senderName: username, receiverName, message }),
    });
  };

  const onConnected = () => {
    setUserData({...userData, "connected": true});
    stompClient.subscribe('/chatroom/public', onMessageReceived);
    stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
    userJoin();
  }

  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: "JOIN"
    };
    stompClient.publish({ destination: "/app/message", body: JSON.stringify(chatMessage) });
  }

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        setPublicChats([...publicChats, payloadData]);
        break;
    }
  }

  const onPrivateMessage = (payload) => {
    var payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  }

  const onError = (err) => {
    console.log(err);
  }

  const handleMessage = (value) => {
    setUserData({ ...userData, "message": value });
  }

  const sendValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE"
      };
      stompClient.publish({ destination: "/app/message", body: JSON.stringify(chatMessage) });
      setUserData({ ...userData, "message": "" });
    }
  }

  const sendPrivateValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        receiverName: userData.receivername,
        message: userData.message,
        status: "MESSAGE"
      };
      if (userData.username !== userData.receivername) {
        privateChats.get(userData.receivername).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.publish({ destination: "/app/private-message", body: JSON.stringify(chatMessage) });
      setUserData({ ...userData, "message": "" });
    }
  }

  const handleUsername = (value) => {
    setUserData({ ...userData, "username": value });
  }

  const registerUser = () => {
    connect();
  }

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>Connect to the chat</Text>
        {!userData.connected &&
          <View>
            <TextInput
              id="user-name"
              placeholder="Enter your name"
              name="userName"
              value={userData.username}
              onChangeText={handleUsername}
              margin="normal"
            />
            <Button title="connect" onPress={registerUser} />
          </View>}
        {userData.connected &&
          <View>
            <Text>Welcome {userData.username}!</Text>
            <TextInput
              placeholder="Message"
              value={userData.message}
              onChangeText={handleMessage}
              margin="normal"
            />
            <Button title="Send public message" onPress={sendValue} />
            <TextInput
              placeholder="Receiver name"
              value={userData.receivername}
              onChangeText={(text) => setUserData({ ...userData, "receivername": text })}
              margin="normal"
            />
            <Button title="Send private message" onPress={sendPrivateValue} />
          </View>}
      </View>
      <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Receivername"
        value={receivername}
        onChangeText={setReceivername}
      />
      <TextInput
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Connect" onPress={connect} disabled={connected} />
      <Button title="Send" onPress={send} disabled={!connected} />

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.senderName}: {item.message}</Text>
          </View>
        )}
      />
    </View>
    </SafeAreaView>
  );
};

export default ChatPrototyp;
