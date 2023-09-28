import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import axios from 'axios';
import LoginThemeButton from './components/LoginThemeButton';
import Spinner from './components/Spinner';

function Login({ setUser, isDarkMode, toggleDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const { setUsername: setLoggedInUsername, username: mainUsername } =
    useContext(UserContext);

  function showAlert() {
    alert(
      'Loading times may be impacted by hosting provider. You may press Log In/Register again if nothing happens at first.'
    );

    localStorage.setItem('alertShown', 'true');
  }

  async function logIn(e) {
    e.preventDefault();
    setIsLoading(true);

    const loadingInterval = setInterval(() => {
      setLoadingMessageIndex((prevIndex) => {
        return (prevIndex + 1) % loadingMessages.length;
      });
    }, 5000);

    const alertShown = localStorage.getItem('alertShown');
    if (!alertShown) {
      showAlert();
    }
    try {
      const response = await axios.post(`/api/v1/auth/login`, {
        username,
        password,
      });

      if (response.data) {
        localStorage.setItem('token', response.data.token);

        setLoggedInUsername(username);
        setUser(username);
        navigate('/chats');
        clearInterval(loadingInterval);
        setIsLoading(false);
      }
    } catch (error) {
      setError(
        error.response?.data.msg || 'An error occurred. Please try again.'
      );
      setTimeout(() => setError(null), 3000);
      clearInterval(loadingInterval);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (mainUsername) {
      navigate('/chats');
    }
  }, [mainUsername]);

  const loadingMessages = [
    'Logging you in...',
    'Calculating the meaning of life...',
    'Brewing coffee for the server...',
    'Summoning unicorns...',
    'Counting stars in the cloud...',
    'Teaching squirrels to water ski...',
    'Finding the last digit of pi...',
    'Chasing our tails...',
    'Asking the magic 8-ball for advice...',
    'Finding the lost city of Atlantis...',
    'Putting on a tinfoil hat...',
    'Convincing the server to dance...',
  ];

  return (
    <>
      <LoginThemeButton
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <div className='w-50 mx-auto mb-12'>
        {/* LOGO */}
        <p className='text-center mb-1 text-primary-100 font-semibold select-none text-[90px] bg-purpl'>
          話
        </p>
        <p className='text-center text-xl mb-5 text-primary-100 font-semibold select-none'>
          HanashiApp
        </p>
        {/* REGISTER FORM */}
        <form style={{ width: '200px' }} onSubmit={logIn}>
          <input
            className='block w-full rounded-sm p-2 mb-2 border'
            type='text'
            placeholder='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <input
            className='block w-full rounded-sm p-2 mb-2 border'
            type='password'
            placeholder='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            disabled={isLoading}
            className={`bg-primary-200 text-primary-50  w-full rounded-sm p-2 ${
              isLoading ? 'cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className='w-full flex justify-center'>
                <Spinner w={6} h={6} />
              </div>
            ) : (
              <p className='text-primary-900'>Log In</p>
            )}
          </button>
          {!isLoading && (
            <p className='mt-1 text-center text-xs text-primary-100 font-thin'>
              Don't have an account?
              <br />
              <Link to='register' className='text-primary-500 font-normal'>
                Register here!
              </Link>
            </p>
          )}
          {error && (
            <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
          )}
          {isLoading && (
            <p
              style={{ color: 'white', textAlign: 'center' }}
              className='mt-2 text-xs'
            >
              {loadingMessages[loadingMessageIndex]}
            </p>
          )}
        </form>
      </div>
    </>
  );
}

export default Login;
