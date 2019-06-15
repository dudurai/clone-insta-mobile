import React, { Component } from 'react';

import { View,Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

import camera from '../assets/camera.png';
import api from '../services/api';

import more from '../assets/more.png';
import like from '../assets/like.png';
import send from '../assets/send.png';
import comment from '../assets/comment.png';
import io from 'socket.io-client';


export default class Feed extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerRight: (
      <TouchableOpacity onPress={() => navigation.navigate('New')}>
        <Image source={camera} style={{marginRight: 20 }} />
      </TouchableOpacity>
    )
  });

  state = {
    feed: []
  }

  async componentDidMount() {
    this.registerToSocket();
    
    const response = await api.get('posts');

    console.log(response);

    this.setState({ feed: response.data })
  }

  registerToSocket = () => {
    const socket = io('http://192.168.0.120:3333');

    socket.on('post', newPost => {
      console.log(newPost);
      this.setState({ feed: [newPost, ...this.state.feed] });
    })

    socket.on('like', likedPost => {
      this.setState({
        feed: this.state.feed.map(post => 
          post._id === likedPost._id ? likedPost : post
        )
      })
    })
  }

  handleLike = id => {
    console.log(id);
    api.post(`/posts/${id}/like`);
  }

  render() {
    return (<View style={styles.container}>
      <FlatList
        data={this.state.feed}
        keyExtractor={post => post._id}
        renderItem={({item}) => (
          <View style={styles.feedItem}>

            <View style={styles.feedItemHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{item.author}</Text>
                <Text style={styles.place}>{item.place}</Text>
              </View>

              <Image source={more} />
            </View>

            <Image style={styles.feedImage} source={{ uri: `http://192.168.0.120:3333/files/${item.image}` }} />

            <View style={styles.feedItemFooter}>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.action} onPress={() => this.handleLike(item._id)}>
                  <Image source={like} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.action} onPress={() => {}}>
                  <Image source={comment} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.action} onPress={() => {}}>
                  <Image source={send} />
                </TouchableOpacity>
              </View>

              <Text style={styles.likes}>{item.likes} curtidas</Text>
              <Text style={styles.description}>{item.description} curtidas</Text>
              <Text style={styles.hashtags}>{item.hashtags}</Text>
            </View>          
          </View>
        )}
      />
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  feedItem: {
    marginTop: 20,
  },

  feedItemHeader: {
    paddingHorizontal: 15,

    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
  },

  userInfo: {},
  name: {
    fontSize: 14,
    color: '#000'
  },

  place: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  feedImage: { 
    height: 400, 
    width: "100%",
    marginVertical: 15,
  },

  feedItemFooter: {
    paddingHorizontal: 15
  },

  actions: {
    flexDirection: "row",
  },

  action: {
    marginRight: 8,
  },

  likes: {
    marginTop: 15,
  },

  description: {
    lineHeight: 18,
    color: '#000',
  },

  hashtags: {
    color: "#7159c1",
  }
})