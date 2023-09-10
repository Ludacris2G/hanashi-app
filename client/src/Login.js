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
  const navigate = useNavigate();

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
        setIsLoading(false);
      }
    } catch (error) {
      setError(error.response.data.msg || 'An error occurred');
      console.log(error);
      setTimeout(() => setError(null), 3000);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (mainUsername) {
      navigate('/chats');
    }
  }, [mainUsername]);

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
        <form style={{ width: '200px' }} onSubmit={logIn}>
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
          <button
            disabled={isLoading}
            className='bg-primary-200 text-primary-50  w-full rounded-sm p-2'
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
        </form>
      </div>
    </>
  );
}

export default Login;
