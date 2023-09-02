import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import axios from 'axios';
import nightwind from 'nightwind/helper';
import LoginThemeButton from './components/LoginThemeButton';

function Login({ setUser, isDarkMode, toggleDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { setUsername: setLoggedInUsername, username: mainUsername } =
    useContext(UserContext);

  async function logIn(e) {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/v1/auth/login`, {
        username,
        password,
      });

      if (response.data) {
        console.log('we got token');
        localStorage.setItem('token', response.data.token);

        setLoggedInUsername(username);
        setUser(username);
        navigate('/chats');
      }
    } catch (error) {
      setError(error.response.data.msg || 'An error occurred');
      console.log(error);
      setTimeout(() => setError(null), 3000);
    }
  }

  useEffect(() => {
    if (mainUsername) {
      navigate('/chats');
    }
  }, [mainUsername]);
  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode);
  //   nightwind.toggle();
  // };

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
          <button className='bg-primary-200 text-primary-50  w-full rounded-sm p-2'>
            <p className='text-primary-900'>Log In</p>
          </button>
          <p className='mt-1 text-center text-xs text-primary-100 font-thin'>
            Don't have an account?
            <br />
            <Link to='/' className='text-primary-500 font-normal'>
              Register here!
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

export default Login;
