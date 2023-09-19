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
import { format } from 'date-fns';

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
  const [localFile, setLocalFile] = useState(null);
  const [cachedData, setCachedData] = useState({});
  const cachedDataRef = useRef(cachedData);

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
    setLocalFile(null);
    setUploadedFile(null);
  }, [selectedUserId]);

  useEffect(() => {
    getOfflinePeople();
  }, [onlinePeople]);

  useEffect(() => {
    cachedDataRef.current = cachedData;
  }, [cachedData]);

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
    // check if the data is already stored for the selected chat
    if (cachedData[selectedUserId]) {
      setMessages(cachedData[selectedUserId]);
      setIsConversationLoading(false);
      scrollToBottom();
      return;
    }

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

    setCachedData((previousData) => {
      return {
        ...previousData,
        [selectedUserId]: mappedMessages,
      };
    });

    setMessages(mappedMessages);
    setIsConversationLoading(false);
    scrollToBottom();
  }

  function handleMessage(e) {
    const currentCachedData = cachedDataRef.current;
    const messageData = JSON.parse(e.data);

    if (messageData.logout) {
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

        // update cached data only if conversation from sender was previously stored
        if (currentCachedData[messageData.sender]) {
          const currentConversation = currentCachedData[messageData.sender];
          const newConversation = [...currentConversation, messageData];
          setCachedData((previousData) => {
            return {
              ...previousData,
              [messageData.sender]: newConversation,
            };
          });
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
    if (e.currentTarget === e.target && !isConversationLoading) {
      setSelectedUserId(null);
      setUploadedFile(null);
      setLocalFile(null);
      setMessages([]);
    }
  }

  function sendMessage(e, file = null) {
    if (e) e.preventDefault();
    checkToken();

    if (file) {
      const fileData = {
        data: file.data,
        name: file.name,
        mimeType: file.type,
      };
      setUploadedFile(file);
      setLocalFile(fileData);
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

    const newMessage = {
      text: newMessageText,
      isOurs: true,
      _id: new Date().toISOString(),
      file: localFile,
      uploadedLocally: true,
      createdAt: new Date(),
    };

    // cache sent messages
    if (cachedData[selectedUserId]) {
      const previousConversation = cachedData[selectedUserId];
      setCachedData((previousData) => {
        return {
          ...previousData,
          [selectedUserId]: [...previousConversation, newMessage],
        };
      });
    }

    setLocalFile(null);
    setMessages((prev) => [...prev, newMessage]);
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
      setLocalFile(null);
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
    setTimeout(() => {
      e.target.value = '';
    }, 100);
  }

  function scrollToBottom() {
    const div = scrollReferenceDiv.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  function setSelectedUserCheck(userId) {
    if (isConversationLoading) return;
    setSelectedUserId(userId);
  }

  return (
    <div className='flex h-screen w-screen'>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`bg-primary-950 dark:bg-primary-950 ml-auto p-2 w-10 ${'block sm:hidden'}`}
      >
        <ChatsMenu />
      </button>
      <div
        className={`bg-primary-950 w-1/3 text-primary-50 dark:text-primary-900 flex flex-col h-full ${`${
          isMenuOpen ? 'block' : 'hidden sm:flex'
        }`}`}
        style={{
          maxWidth: '300px',
          minWidth: '200px',
        }}
        onClick={(e) => removePeopleHighlight(e)}
      >
        <div className='text-center py-2 bg-primary-900 dark:bg-primary-50 border-b border-primary-900 font-bold tracking-wider select-none mb-1'>
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
        <div className='overflow-y-scroll'>
          {Object.keys(onlinePeople).map((userId) => (
            <div key={userId} onClick={() => setSelectedUserCheck(userId)}>
              <People
                key={userId}
                selectedUserId={selectedUserId}
                onlinePeople={onlinePeople}
                userId={userId}
                online={true}
                isConversationLoading={isConversationLoading}
              />
            </div>
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <div key={userId} onClick={() => setSelectedUserCheck(userId)}>
              <People
                key={userId}
                selectedUserId={selectedUserId}
                onlinePeople={offlinePeople}
                userId={userId}
                online={false}
                isConversationLoading={isConversationLoading}
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
      <div className='flex flex-col bg-primary-800 w-full p-2 pt-0 dark:bg-primary-700'>
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
                      'min-w-[4rem] ' +
                      (message.isOurs
                        ? 'bg-blue-900 text-white p-2 rounded-xl m-1 w-fit ml-auto'
                        : 'bg-white text-gray-800 rounded-xl m-1 p-2 w-fit dark:bg-primary-200')
                    }
                    key={message._id}
                  >
                    <div>
                      {message.file &&
                        message.file?.mimeType?.startsWith('image/') && (
                          <img
                            src={
                              !message.uploadedLocally
                                ? URL.createObjectURL(
                                    new Blob(
                                      [new Uint8Array(message.file.data.data)],
                                      {
                                        type: message.file.mimeType,
                                      }
                                    )
                                  )
                                : message.file.data
                            }
                            alt={message.file.name}
                            className={`sm:max-w-xs max-h-xs rounded-md`}
                          />
                        )}
                    </div>
                    <div className='w-full flex'>
                      <p className='text-md mr-1'>{message.text}</p>
                      {message.createdAt && (
                        <div className='ml-auto flex items-end'>
                          <div className='text-[9px]'>
                            {format(new Date(message.createdAt), 'h:mm')}
                          </div>
                          <div className='text-[9px] ml-1'>
                            {format(new Date(message.createdAt), 'a')}
                          </div>
                        </div>
                      )}
                    </div>
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
            selectedUserId && (
              <div className='flex w-full h-full'>
                <svg
                  aria-hidden='true'
                  className={`m-auto flex w-20 h-20 text-gray-200 animate-spin fill-blue-600`}
                  viewBox='0 0 100 101'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                    fill='currentColor'
                  />
                  <path
                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                    fill='currentFill'
                  />
                </svg>
              </div>
            )
          )}
        </div>
        {selectedUserId && (
          <form className='flex gap-2' onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type='text'
              className='bg-primary-100 border p-2 flex-grow rounded-full w-0 dark:bg-primary-900'
              placeholder='Type here broseph'
            />
            <label className='bg-gray-700 p-3 text-primary-100 rounded-full cursor-pointer'>
              <input type='file' className='hidden' onChange={sendFile} />
              {!isUploadingFile ? (
                !uploadedFile || !localFile ? (
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
