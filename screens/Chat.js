import { View, Text, TextInput, SafeTextArea } from 'react-native';
import React, { useState, useEffect } from 'react';


var stompClient = null;

const Chat = () => {
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [tab, setTab] = useState('CHATROOM');
  const [userData, setUserData] = useState({
    username: '',
    receivername: '',
    connected: false,
    message: '',
  });
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const onConnected = (frame) => {
    setUserData({ ...userData, connected: true });
    stompClient.subscribe('/chatroom/public', onPublicMessageReceived);
    stompClient.subscribe(
      '/user/' + userData.username + '/private',
      onPrivateMessageReceived
    );
    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: 'JOIN',
    };
    stompClient.send('/app/message', {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case 'JOIN':
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case 'MESSAGE':
        publicChats.push(payloadData);
        setPublicChats([...publicChats]);
        break;
    }
  };

  const onPrivateMessage = (payload) => {
    console.log(payload);
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
  };

  const onError = (err) => {
    console.log(err);
  };

  const handleMessage = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, message: value });
  };
  const sendValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: 'MESSAGE',
      };
      console.log(chatMessage);
      stompClient.send('/app/message', {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: '' });
    }
  };

  const sendPrivateValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        status: 'MESSAGE',
      };

      if (userData.username !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send('/app/private-message', {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: '' });
    }
  };

  return (
    <View style={styles.container}>
      {userData.connected ? (
        <View style={styles.chatBox}>
          <View style={styles.memberList}>
            <TouchableOpacity
              onPress={() => {
                setTab('CHATROOM');
              }}
              style={[styles.member, tab === 'CHATROOM' && styles.active]}
            >
              <Text>Chatroom</Text>
            </TouchableOpacity>
            {[...privateChats.keys()].map((name, index) => (
              <TouchableOpacity
                onPress={() => {
                  setTab(name);
                }}
                style={[styles.member, tab === name && styles.active]}
                key={index}
              >
                <Text>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {tab === 'CHATROOM' && (
            <View style={styles.chatContent}>
              <View style={styles.chatMessages}>
                {publicChats.map((chat, index) => (
                  <View
                    style={[
                      styles.message,
                      chat.senderName === userData.username && styles.self,
                    ]}
                    key={index}
                  >
                    {chat.senderName !== userData.username && (
                      <Text style={styles.avatar}>{chat.senderName}</Text>
                    )}
                    <Text style={styles.messageData}>{chat.message}</Text>
                    {chat.senderName === userData.username && (
                      <Text style={[styles.avatar, styles.selfAvatar]}>
                        {chat.senderName}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.sendMessage}>
                <TextInput
                  style={styles.inputMessage}
                  placeholder="enter the message"
                  value={userData.message}
                  onChangeText={handleMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendValue}>
                  <Text>send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {tab !== 'CHATROOM' && (
            <View style={styles.chatContent}>
              <View style={styles.chatMessages}>
                {[...privateChats.get(tab)].map((chat, index) => (
                  <View
                    style={[
                      styles.message,
                      chat.senderName === userData.username && styles.self,
                    ]}
                    key={index}
                  >
                    {chat.senderName !== userData.username && (
                      <Text style={styles.avatar}>{chat.senderName}</Text>
                    )}
                    <Text style={styles.messageData}>{chat.message}</Text>
                    {chat.senderName === userData.username && (
                      <Text style={[styles.avatar, styles.selfAvatar]}>
                        {chat.senderName}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.sendMessage}>
                <TextInput
                  style={styles.inputMessage}
                  placeholder="enter the message"
                  value={userData.message}
                  onChangeText={handleMessage}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendPrivateValue}
                >
                  <Text>send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.register}>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={userData.username}
            onChangeText={handleUsername}
          />
          <TouchableOpacity style={styles.connectButton} onPress={registerUser}>
            <Text>connect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Chat;
