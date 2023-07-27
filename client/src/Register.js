import React, { useContext, useState } from 'react';
import nightwind from 'nightwind/helper';
import axios from 'axios';
import { UserContext } from './UserContext';
import { Link, useNavigate } from 'react-router-dom';

function Register({ setUser }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    nightwind.toggle();
  };

  async function register(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/v1/auth/register', {
        username,
        password,
      });
      setLoggedInUsername(username);
      setId(data.user.id);
      setUser(username);
      navigate('/chats');
    } catch (error) {
      setError(error.response.data.msg);
      setTimeout(() => setError(null), 3000);
    }
  }

  return (
    <>
      <div className='bg-primary-200 dark:bg-primary-950 h-screen flex relative items-center'>
        {/* THEME TOGGLE BUTTON */}
        <button
          type='button'
          className={`rounded-full w-14 h-8 flex items-center justify-${
            isDarkMode ? 'end' : 'start'
          } bg-gray-300 dark:bg-gray-700 absolute z-10`}
          onClick={toggleDarkMode}
          style={{
            right: '1rem',
            top: '1rem',
          }}
        >
          <span
            className={`rounded-full w-6 h-6 bg-white dark:bg-gray-200 shadow-md transform `}
            style={{
              transform: `translate3d(${
                isDarkMode ? 'calc(100% + 4px)' : '4px'
              }, 0, 0)`,
              marginLeft: `${isDarkMode ? '-1px' : '0'}`,
              transition: 'transform linear 200ms',
            }}
          />
        </button>
        {/* LOGIN FORM */}
        <form
          style={{ width: '200px' }}
          className='w-50 mx-auto mb-12'
          onSubmit={register}
        >
          <input
            className='block w-full rounded-sm p-2 mb-2 border'
            type='text'
            placeholder='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className='block w-full rounded-sm p-2 mb-2 border'
            type='password'
            placeholder='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='bg-primary-700 text-primary-50  w-full rounded-sm p-2'>
            Register
          </button>
          <p className='mt-1 text-center text-xs text-primary-900 font-thin'>
            Already have an account?
            <br />
            <Link to='login' className='text-primary-500 font-normal'>
              Log in here!
            </Link>
          </p>
          {error && (
            <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
          )}
        </form>
      </div>
    </>
  );
}

export default Register;
