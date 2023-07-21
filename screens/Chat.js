import React, { useState, useEffect,useCallback  } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, Button, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView  } from 'react-native';
import { Client } from '@stomp/stompjs';
import { TextEncoder, TextDecoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;



const Chat = () => {
  const [serverState, setServerState] = useState('Loading...');
  const [connectedToServer, setConnectedToServer] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  useEffect(() => {
    
      const client = new Client({
        brokerURL: 'ws://192.168.2.38:8080/ws',
        onConnect: () => {
          client.subscribe('/topic/public', onMessageReceived);
          client.publish({destination: "/app/chat.addUser", body: JSON.stringify({sender: username, type: 'JOIN'})});
          setServerState('Connected to the server');
          setConnectedToServer(true);
        },
        onStompError: (error) => {
          setError(`Could not connect to WebSocket server. Please refresh this page to try again! Detailed error: ${error.headers.message}`);
          setServerState('Error');
          
        },
        onDisconnect: () =>{setConnectedToServer(false);}
      });

      client.activate();
      setStompClient(client);
    

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [usernameSubmitted]);

  const sendMessage = useCallback(() => {
    if (message.trim() && stompClient) {
      const chatMessage = {
        sender: username,
        content: message,
        type: 'CHAT'
      };
      try {
        stompClient.publish({destination: "/app/chat.sendMessage", body: JSON.stringify(chatMessage)});
        setMessage('');
      } catch(error) {
        setError(`Error sending message: ${error.message}`);
      }
    } else {
      Alert.alert('Warning', 'Cannot send empty message.');
    }
  }, [message, stompClient, username]);
  const handleSubmitUsername = useCallback(() => {
    if (username.trim()) {
      setUsernameSubmitted(true);
      
    } else {
      Alert.alert('Warning', 'Username cannot be empty.');
    }
  }, [username]);

 

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === "Enter") {
      sendMessage();
    }
  };

  return (
    
    <SafeAreaView style={{flex: 1}}>
      <View style={{ alignItems: 'center', marginTop: 42 }}>
        {
          connectedToServer 
            ? <Text style={{fontSize:42, fontWeight:'bold', marginTop:100}}>Connected!</Text>
            : (
              <>
                <View style={{marginTop:200}}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
                    {serverState}
                    </Text>
                    <ActivityIndicator size={'large'} style={{ margin: 42, transform: [{ scale: 2.0 }] }} />
                </View>
              </>
            )
        }
      </View>
      <View style={styles.container}>
        {usernameSubmitted 
          ? <> 
              <ScrollView style={styles.messageArea}>
                {messages.map((message, index) => (
                  <View key={index} style={styles.message}>
                    <Text style={styles.sender}>({message.sender}): </Text>
                    <Text style={styles.content}>{message.content}</Text>
                  </View>
                ))}
              </ScrollView>
              <TextInput 
                placeholder="Message"
                value={message}
                onChangeText={setMessage}
                onKeyPress={handleKeyPress}
                style={styles.input} 
              />
              <View><Button title="Send" onPress={sendMessage} /></View>
            </>
          : (connectedToServer && <>
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
            <Button title="Submit Username" onPress={handleSubmitUsername} />
          </>)
        }
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  messageArea: {
    flex: 1,
  },
  message: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  sender: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  content: {},
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 16,
  },
  error: {
    color: 'red',
  },
});

export default Chat;
