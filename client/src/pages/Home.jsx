import React, {Component} from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import FriendsList from '../components/FriendsList.jsx';
import FriendRequestsSent from '../components/FriendRequestsSent.jsx';
import FriendRequestsReceived from '../components/FriendRequestsReceived.jsx';
import FrienderPanel from '../components/FrienderPanel.jsx';
import CardpackManager from '../components/CardpackManager/index.jsx';
import Navbar from '../components/Navbar.jsx';

import {
  SET_CURRENT_USER
} from '../store/actions';

import {
  addFriend,
  addFriendRequestSent,
  addFriendRequestReceived,
  removeSentFriendRequest,
  removeFriend,
  removeReceivedFriendRequest,
  requestsReceived,
  setCurrentUser,
  requestCurrentUser,
  requestFriends
} from '../store/modules/home.js';


class Home extends Component {
  constructor(props) {
    super(props);
    this.socket = io();

    this.socket.on('', (data) => {
      let users = JSON.parse(data);
      let otherUser;
      if (users.friender.id === this.props.currentUser.id) {
        otherUser = users.friendee;
        this.props.addFriendRequestSent(otherUser);
      } else {
        otherUser = users.friender;
        this.props.addFriendRequestReceived(otherUser);
      }
    });

    this.socket.on('friendrequestaccept', (data) => {
      console.log('accepted!');
      let users = JSON.parse(data);
      let otherUser;
      if (users.acceptor.id === this.props.currentUser.id) {
        otherUser = users.acceptee;
      } else {
        otherUser = users.acceptor;
      }
      this.props.removeSentFriendRequest(otherUser);
      this.props.removeReceivedFriendRequest(otherUser);
      this.props.addFriend(otherUser);
    });

    this.socket.on('unfriend', (data) => {
      console.log('unfriended!');
      let users = JSON.parse(data);
      let otherUser;
      if (users.unfriender.id === this.props.currentUser.id) {
        otherUser = users.unfriendee;
      } else {
        otherUser = users.unfriender;
      }
      this.props.removeSentFriendRequest(otherUser);
      this.props.removeReceivedFriendRequest(otherUser);
      this.props.removeFriend(otherUser);
    });
  }

  componentDidMount() {
    this.props.requestCurrentUser();
    // one is the loneliest number
    this.props.requestFriends(); 
  }

  render() {
    return (
      <div>
        <Navbar/>
        <div className='content-wrap'>
          <div className='col-narrow'>
            <FrienderPanel />
            <FriendsList friends={this.props.friends} />
            <FriendRequestsSent 
              requestsSent={this.props.requestsSent} 
            />
            <FriendRequestsReceived 
              requestsReceived={this.props.requestsReceived} 
            />
            <h1>{'test' + this.props.currentUser + this.props.requestsSent}</h1>
          </div>
        </div>
      </div>
    ); 
  }
}

const mapStateToProps = ({home}) => ({
  currentUser: home.currentUser,
  friends: home.friends, 
  requestsSent: home.requestsSent, 
  requestsReceived: home.requestsReceived
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  addFriend,
  removeFriend,
  addFriendRequestSent,
  addFriendRequestReceived,
  removeSentFriendRequest,
  removeReceivedFriendRequest,
  requestsReceived,
  setCurrentUser,
  requestCurrentUser,
  requestFriends
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);