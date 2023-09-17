import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';
import { Link, useNavigate } from 'react-router-dom';
import LoginThemeButton from './components/LoginThemeButton';
import Spinner from './components/Spinner';

function Register({ setUser, toggleDarkMode, isDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { username: mainUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const { setUsername: setLoggedInUsername } = useContext(UserContext);

  function showAlert() {
    alert(
      'Loading times may be impacted by hosting provider. You may press Log In/Register again if nothing happens at first.'
    );

    localStorage.setItem('alertShown', 'true');
  }

  async function register(e) {
    e.preventDefault();

    if (username && password !== confirmPassword) {
      console.log('returned');
      setErrorFunction("Passwords don't match");
      return;
    }

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
      const { data } = await axios.post('/api/v1/auth/register', {
        username,
        password,
      });
      if (data) {
        localStorage.setItem('token', data.token);

        setLoggedInUsername(username);
        setUser(username);
        navigate('/chats');
        clearInterval(loadingInterval);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setErrorFunction(
        error.response?.data.msg || 'An error occured. Please try again.'
      );
      clearInterval(loadingInterval);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (mainUsername) {
      navigate('/chats');
    }
  }, [mainUsername]);

  function setErrorFunction(errorText) {
    setError(errorText);
    setTimeout(() => setError(null), 3000);
  }

  const loadingMessages = [
    'Creating your account...',
    'Calculating the meaning of life...',
    'Brewing coffee for the server...',
    'Teaching penguins to fly...',
    'Counting stars in the cloud...',
    'Translating hieroglyphics...',
    'Finding the last digit of pi...',
    'Rebooting the Matrix...',
    'Cracking the Da Vinky code...',
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
        <p
          className='text-center mb-1 text-primary-100 font-semibold select-none'
          style={{ fontSize: '90px' }}
        >
          話
        </p>
        <p className='text-center text-xl mb-5 text-primary-100 font-semibold select-none'>
          HanashiApp
        </p>

        {/* REGISTER FORM */}
        <form style={{ width: '200px' }} onSubmit={register}>
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
          <input
            className='block w-full rounded-sm p-2 mb-2 border'
            type='password'
            placeholder='confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              <p className='text-primary-900'>Register</p>
            )}
          </button>
          {!isLoading && (
            <p className='mt-1 text-center text-xs text-primary-100 font-thin'>
              Already have an account?
              <br />
              <Link to='/' className='text-primary-500 font-normal'>
                Log in here!
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

export default Register;
