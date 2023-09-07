import React, { useContext, useEffect, useState } from 'react';
import nightwind from 'nightwind/helper';
import axios from 'axios';
import { UserContext } from './UserContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import LoginThemeButton from './components/LoginThemeButton';

function Register({ setUser, toggleDarkMode, isDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { username: mainUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const { setUsername: setLoggedInUsername } = useContext(UserContext);

  function showAlert() {
    alert(
      'Loading times may be inpacted by hosting provider. You may press Log In/Register again if nothing happens at first.'
    );

    localStorage.setItem('alertShown', 'true');
  }

  async function register(e) {
    const alertShown = localStorage.getItem('alertShown');
    if (!alertShown) {
      showAlert();
    }
    e.preventDefault();
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
      }
    } catch (error) {
      setError(error.response.data.msg);
      setTimeout(() => setError(null), 3000);
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
        <form style={{ width: '200px' }} onSubmit={register}>
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
          <button className='bg-primary-200 text-primary-900  w-full rounded-sm p-2'>
            Register
          </button>
          <p className='mt-1 text-center text-xs text-primary-100 font-thin'>
            Already have an account?
            <br />
            <Link to='/' className='text-primary-500 font-normal'>
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
