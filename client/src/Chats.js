import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { uniqBy } from 'lodash';
import axios from 'axios';
import People from './components/People';
import ThemeButton from './components/ThemeButton';
import Spinner from './components/Spinner';
import CheckMark from './components/CheckMark';
import Plane from './components/Plane';
import ChatsMenu from './components/ChatsMenu';

function Chats({ toggleDarkMode, isDarkMode }) {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { username: user, id, setUsername, setId } = useContext(UserContext);
  const navigate = useNavigate();
  const scrollReferenceDiv = useRef();
  const messagesWithoutDuplicates = uniqBy(messages, '_id');
  const [isConversationLoading, setIsConversationLoading] = useState(false);

  useEffect(() => {
    connectToWs();
  }, [id]);

  useEffect(() => {
    if (!isConversationLoading && messages) {
      setTimeout(() => {
        scrollToBottom();
      }, 10);
    }
  }, [messages, isConversationLoading]);

  useEffect(() => {
    if (selectedUserId) {
      setIsConversationLoading(true);
      fetchMessages();
    }
  }, [selectedUserId]);

  useEffect(() => {
    getOfflinePeople();
  }, [onlinePeople]);

  async function getOfflinePeople() {
    const request = await axios.get('/api/v1/people');
    if (request) {
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
    setIsConversationLoading(false);
    scrollToBottom();
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if (messageData.logout) {
      console.log('logged out 2');
      localStorage.removeItem('token');
      checkToken();
    }
    if (messageData.online) {
      showOnlinePeople(messageData.online);
    } else {
      setSelectedUserId((prevSelectedUserId) => {
        if (messageData.sender === prevSelectedUserId) {
          setMessages((prev) => [...prev, { ...messageData, isOurs: false }]);
        }
        scrollToBottom();
        return prevSelectedUserId;
      });
    }
  }

  function showOnlinePeople(peopleArr) {
    const people = {};
    peopleArr.forEach(({ userId, username }) => {
      if (userId !== id && id && userId) people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function removePeopleHighlight(e) {
    if (e.currentTarget === e.target) {
      setSelectedUserId(null);
      setMessages([]);
    }
  }

  function sendMessage(e, file = null) {
    if (e) e.preventDefault();
    checkToken();

    if (file) {
      setUploadedFile(file);
      console.log('file: ', file);
      return;
    }

    file = uploadedFile;
    setUploadedFile(null);
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        isOurs: true,
        _id: new Date().toISOString(),
        file,
      },
    ]);
    setNewMessageText('');
  }

  function checkToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      axios.post('/api/v1/logout');
      setUsername(null);
      setId(null);
      navigate('/');
    }
  }

  function connectToWs() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(
      `${wsProtocol}://${process.env.REACT_APP_WS_URL}?token=${token}`
    );
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', (event) => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });

    checkToken();
  }

  async function logout() {
    const response = await axios.post('/api/v1/logout');
    if (response) {
      if (ws) {
        ws.close();
        ws.removeEventListener('message', handleMessage);
      }
      localStorage.removeItem('token');
      setUsername(null);
      setId(null);
      navigate('/');
      setWs(null);
    }
  }

  function sendFile(e) {
    if (e.target.files.length === 0) {
      setUploadedFile(null);
      return;
    }
    setIsUploadingFile(true);
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);

    reader.onload = () => {
      setIsUploadingFile(false);
      sendMessage(null, {
        data: reader.result,
        name: e.target.files[0].name,
        type: e.target.files[0].type,
      });
    };
  }

  function scrollToBottom() {
    const div = scrollReferenceDiv.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  return (
    <div className='flex h-screen w-screen'>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`bg-primary-950 dark:bg-primary-900 ml-auto p-2 w-10 ${'block sm:hidden'}`}
      >
        <ChatsMenu />
      </button>
      <div
        className={`bg-primary-950 w-1/3 text-primary-50 dark:text-primary-900 flex flex-col ${`${
          isMenuOpen ? 'block' : 'hidden sm:flex'
        }`}`}
        style={{ maxWidth: '300px', minWidth: '200px' }}
      >
        <div className='flex-grow' onClick={(e) => removePeopleHighlight(e)}>
          <div className='text-center py-2 bg-primary-900 dark:bg-primary-50 border-b border-primary-900 font-bold tracking-wider select-none'>
            HanashiApp 話
          </div>
          <ThemeButton
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
            className='mx-auto'
          />
          <div className='text-center border m-1 rounded-full border-primary-900 select-none'>
            {user}
          </div>
          {Object.keys(onlinePeople).map((userId) => (
            <div key={userId} onClick={() => setSelectedUserId(userId)}>
              <People
                key={userId}
                selectedUserId={selectedUserId}
                onlinePeople={onlinePeople}
                userId={userId}
                online={true}
              />
            </div>
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <div key={userId} onClick={() => setSelectedUserId(userId)}>
              <People
                key={userId}
                selectedUserId={selectedUserId}
                onlinePeople={offlinePeople}
                userId={userId}
                online={false}
              />
            </div>
          ))}
        </div>
        <div className='text-center'>
          <button
            onClick={logout}
            className='flex p-3 bg-primary-500 w-full  rounded-xs justify-center hover:bg-primary-400 transition duration-200'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
              />
            </svg>
            <p className='items select-none'>log out</p>
          </button>
        </div>
      </div>
      <div className='flex flex-col bg-primary-800 w-full p-2 pt-0'>
        <div className='flex-grow text-primary-100'>
          {!selectedUserId && (
            <div className='flex items-center justify-center h-full text-lg select-none'>
              &larr; please select a person
            </div>
          )}
          {selectedUserId && !isConversationLoading ? (
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
                    <div>
                      {message.file &&
                        message.file?.mimeType?.startsWith('image/') && (
                          <img
                            src={URL.createObjectURL(
                              new Blob(
                                [new Uint8Array(message.file.data.data)],
                                {
                                  type: message.file.mimeType,
                                }
                              )
                            )}
                            alt={message.file.name}
                            className={`sm:max-w-xs max-h-xs rounded-md`}
                          />
                        )}
                    </div>
                    {message.text}
                  </div>
                ))}
                {messagesWithoutDuplicates.length === 0 && (
                  <div className='flex items-center justify-center h-full text-lg select-none'>
                    start a conversation
                  </div>
                )}
                <div
                  className='h-2 bg-transparent'
                  ref={scrollReferenceDiv}
                ></div>
              </div>
            </div>
          ) : (
            selectedUserId && 'loading..'
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
            <label className='bg-gray-700 p-3 text-primary-100 rounded-full cursor-pointer'>
              <input type='file' className='hidden' onChange={sendFile} />
              {!isUploadingFile ? (
                !uploadedFile ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-4 w-4'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13'
                    />
                  </svg>
                ) : (
                  <CheckMark />
                )
              ) : (
                <Spinner w={4} h={4} />
              )}
            </label>
            <button
              disabled={!newMessageText}
              type='submit'
              className='bg-primary-900 p-3 text-primary-100 rounded-full cursor-pointer'
            >
              <Plane />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chats;
