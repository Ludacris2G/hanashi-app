import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import Avatar from './components/Avatar';
import { useNavigate } from 'react-router-dom';

function Chats() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const { username: user, id, setUsername, setId } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5001');
    setWs(ws);
    ws.addEventListener('message', handleMessage);

    const intervalId = setInterval(checkTocken, 60000);

    return () => clearInterval(intervalId);
  }, [id]);

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if (messageData.online) {
      showOnlinePeople(messageData.online);
    } else {
      const message = {
        text: messageData.text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        { isOurs: false, text: message.text, timestamp: message.timestamp },
      ]);
    }
  }

  function showOnlinePeople(peopleArr) {
    const people = {};

    peopleArr.forEach(({ userId, username }) => {
      if (userId !== id) people[userId] = username;
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

    setNewMessageText('');
    setMessages((prev) => [...prev, { text: newMessageText, isOurs: true }]);
  }

  function checkTocken() {
    const token = localStorage.getItem('token');
    if (!token) {
      setUsername(null);
      setId(null);
      navigate('/login');
    }
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
          <div
            onClick={() => setSelectedUserId(userId)}
            className={
              ' border rounded-full border-primary-900 m-1 flex items-center gap-2 cursor-pointer ' +
              (userId === selectedUserId ? 'bg-primary-600' : '')
            }
            key={userId}
          >
            <Avatar username={onlinePeople[userId]} userId={userId} />
            <span>{onlinePeople[userId]}</span>
          </div>
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
            <div>
              {messages.map((message, i) => (
                <div key={i}>{message.text}</div>
              ))}
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className='flex gap-2' onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type='text'
              className='bg-primary-100 border p-2 flex-grow rounded-sm w-0'
              placeholder='Type here broseph'
            />
            <button
              type='submit'
              className='bg-primary-900 p-2 text-primary-100 rounded-sm'
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
