// Chat.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot, faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4001');

function Chat() {
  const [name, setName] = useState(localStorage.getItem('username') || ''); // Prefill with stored username
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [clientsTotal, setClientsTotal] = useState(0); // 存储上一条消息的时间
  const [users, setUsers] = useState({});
  const [recipientId, setRecipientId] = useState('All');
  const [conversations, setConversations] = useState({ All: [] });

  useEffect(() => {
    if (name) {
      socket.emit('setUsername', name);
    }

    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setConversations((prevConversations) => ({
        ...prevConversations,
        All: [...prevConversations.All, newMessage],
      }));
    });

    socket.on('privateMessage', (newMessage) => {
      const recipientKey =
        newMessage.senderId === socket.id
          ? newMessage.recipientId
          : newMessage.senderId;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setConversations((prevConversations) => ({
        ...prevConversations,
        [recipientKey]: [
          ...(prevConversations[recipientKey] || []),
          newMessage,
        ],
      }));
    });


    socket.on('clientsTotal', (totalClients) => {
      setClientsTotal(totalClients);
    });

    socket.on('updateUserList', (userList) => {
      setUsers(userList);
    });

    //typing
    socket.on('typing', ({ recipientId: typingRecipientId, feedback }) => {
      setFeedback(feedback);
    });

     //message trop vite
     socket.on('messageTropVite', (data) => {
      setFeedback(data.error); // 使用一个状态来显示错误信息
    });

    socket.on('newClient', (data) => {
      setFeedback(data.error); // 使用一个状态来显示错误信息
    });

  }, [name, recipientId]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    socket.emit('setUsername', e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const newMessage = {
        text: message,
        author: name,
        date: new Date().toLocaleString(),
        senderId: socket.id,
        recipientId: recipientId === 'All' ? 'All' : recipientId,
      };
      socket.emit('message', newMessage);
      setMessage('');
      setFeedback('');
      socket.emit('stopTyping', recipientId);
    }
  };

  const handleTyping = () => {
    socket.emit('typing', {
      recipientId,
      feedback: `${name} is typing a message...`,
    });
  };

  // // 用户加入时通知
  // const handleUserConnect = () => {
  //   socket.emit('userConnected', {
  //     recipientId,
  //     feedback: `${name} a rejoint le chat`,
  //   });
  // };

  // const handleUserDisconnect = () => {
  //   socket.emit('userDisconnected', {
  //     recipientId: "All",
  //     feedback: `${name} a quitté le chat`,
  //   });
  // };


  const handleRecipientClick = (id) => {
    setRecipientId(id);
    setFeedback('');
  };

  const currentMessages = conversations[recipientId] || [];

  return (
    <>
      <h1 className="title">☕ iChat</h1>
      <div className="fullBody">
        <div className="main flex">
          <div className="userList">
            <h3>Users:</h3>
            <ul>
              <li
                key="All"
                onClick={() => handleRecipientClick('All')}
                className={recipientId === 'All' ? 'selectedUser' : ''}
              >
                All
              </li>
              {Object.keys(users).map(
                (id) =>
                  id !== socket.id && (
                    <li
                      key={id}
                      onClick={() => handleRecipientClick(id)}
                      className={id === recipientId ? 'selectedUser' : ''}
                    >
                      {users[id]}
                    </li>
                  )
              )}
            </ul>
          </div>
          <div className="conversation">
            <div className="name">
              <span className="flex">
                <FontAwesomeIcon icon={faUser} />
                <input
                  type="text"
                  className="nameInput"
                  id="nameInput"
                  value={name}
                  onChange={handleNameChange}
                  maxLength="20"
                />
              </span>
            </div>
            <ul className="messageContainer" id="messageContainer">
              {currentMessages.map((msg, index) => (
                <li
                  key={index}
                  className={
                    msg.senderId === socket.id ? 'messageRight' : 'messageLeft'
                  }
                >
                  <p className="message">{msg.text}</p>
                  <span>
                    {msg.author} - {msg.date}
                  </span>
                </li>
              ))}
              {feedback && (
                <li className="messageFeedback">
                  <p className="feedback" id="feedback">
                    {feedback}
                  </p>
                </li>
              )}
            </ul>
            <form
              className="messageForm"
              id="messageForm"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="message"
                id="messageInput"
                className="messageInput"
                value={message}
                onChange={handleMessageChange}
                onKeyUp={handleTyping}
                // onKeyUp1={handleUserConnect}
                // onKeyUp2={handleUserDisconnect}

              />
              <div className="verticalDivider"></div>
              <button type="submit" className="sendButton">
                Send
                <span>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </span>
              </button>
            </form>
            <h3 className="clientsTotal" id="ClientTotal">
              Total Clients: {clientsTotal}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
