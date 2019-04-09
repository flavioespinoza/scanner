import React, { Component } from 'react';
import MessageItem from './message-item';

const moment = require('moment');

class MessageList extends Component {
  render() {
    return (
      <div className="messages">
        {this.props.displayMessages.map(data => <MessageItem
          key={data._id}
          message={data.body}
          author={data.author}
          timestamp={moment(data.createdAt).from(moment())}
        />)}
      </div>
    );
  }
}

export default MessageList;
