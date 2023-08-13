import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { uniqBy } from 'lodash';
import axios from 'axios';
import People from './components/People';

function Chats() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const { username: user, id, setUsername, setId } = useContext(UserContext);
  const navigate = useNavigate();
  const scrollReferenceDiv = useRef();
  const messagesWithoutDuplicates = uniqBy(messages, '_id');

  useEffect(() => {
    connectToWs();
  }, [id]);

  useEffect(() => {
    const div = scrollReferenceDiv.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) fetchMessages();
  }, [selectedUserId]);

  useEffect(() => {
    getOfflinePeople();
  }, [onlinePeople]);

  async function getOfflinePeople() {
    const request = await axios.get('/api/v1/people');
    const offlinePeople = request.data.people.filter(
      (person) =>
        person._id !== id && !Object.keys(onlinePeople).includes(person._id)
    );
    const offlinePeopleObj = {};
    offlinePeople.forEach((person) => {
      offlinePeopleObj[person._id] = person.username;
    });
    setOfflinePeople(offlinePeopleObj);
  }

  async function fetchMessages() {
    const messages = await axios.get(`/api/v1/messages/${selectedUserId}`);
    const mappedMessages = messages.data.messages.map((message) => {
      if (message.sender === id) {
        return {
          ...message,
          isOurs: true,
        };
      } else {
        return {
          ...message,
          isOurs: false,
        };
      }
    });
    setMessages(mappedMessages);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if (messageData.online) {
      showOnlinePeople(messageData.online);
    } else {
      setMessages((prev) => [...prev, { ...messageData, isOurs: false }]);
    }
  }

  function showOnlinePeople(peopleArr) {
    const people = {};

    peopleArr.forEach(({ userId, username }) => {
      if (userId !== id && id) people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function removePeopleHighlight(e) {
    if (e.currentTarget === e.target) setSelectedUserId(null);
  }

  function sendMessage(e) {
    e.preventDefault();

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );

    setMessages((prev) => [
      ...prev,
      { text: newMessageText, isOurs: true, _id: new Date().toISOString() },
    ]);
    setNewMessageText('');
  }

  function checkTocken() {
    const token = localStorage.getItem('token');
    if (!token) {
      setUsername(null);
      setId(null);
      navigate('/login');
    }
  }

  function connectToWs() {
    const ws = new WebSocket('ws://localhost:5001');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });

    const intervalId = setInterval(checkTocken, 60000);

    return () => clearInterval(intervalId);
  }

  return (
    <div className='flex h-screen w-screen'>
      <div
        onClick={(e) => removePeopleHighlight(e)}
        className='bg-primary-950 w-1/3 text-primary-50 dark:text-primary-900'
        style={{ maxWidth: '300px' }}
      >
        <div className='text-center py-2 bg-primary-900 dark:bg-primary-50 border-b border-primary-900 font-bold tracking-wider'>
          HanashiApp 話
        </div>
        {user}
        {Object.keys(onlinePeople).map((userId) => (
          <People
            key={userId}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            onlinePeople={onlinePeople}
            userId={userId}
            online={true}
          />
        ))}
        {Object.keys(offlinePeople).map((userId) => (
          <People
            key={userId}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            onlinePeople={offlinePeople}
            userId={userId}
            online={false}
          />
        ))}
      </div>
      <div className='flex flex-col bg-primary-800 w-full p-2'>
        <div className='flex-grow text-primary-100'>
          {!selectedUserId && (
            <div className='flex items-center justify-center h-full text-lg'>
              &larr; please select a person
            </div>
          )}
          {selectedUserId && (
            <div className='relative h-full'>
              <div className='overflow-y-scroll absolute inset-0 py-1'>
                {messagesWithoutDuplicates.map((message) => (
                  <div
                    className={
                      '' +
                      (message.isOurs
                        ? 'bg-blue-900 text-white p-2 rounded-xl m-1 w-fit ml-auto'
                        : 'bg-white text-gray-800 rounded-xl m-1 p-2 w-fit')
                    }
                    key={message._id}
                  >
                    {message.text}
                  </div>
                ))}
                {messagesWithoutDuplicates.length === 0 && (
                  <div className='flex items-center justify-center h-full text-lg'>
                    start a conversation
                  </div>
                )}
                <div ref={scrollReferenceDiv}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className='flex gap-2' onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type='text'
              className='bg-primary-100 border p-2 flex-grow rounded-full w-0'
              placeholder='Type here broseph'
            />
            <button
              type='submit'
              className='bg-primary-900 p-3 text-primary-100 rounded-full'
            >
              <svg
                viewBox='0 0 24 24'
                fill='currentColor'
                height='1em'
                width='1em'
                className='text-primary-50'
              >
                <path fill='none' d='M0 0h24v24H0z' />
                <path d='M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z' />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chats;
