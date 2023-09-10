import React, { useContext, useEffect, useState } from 'react';
import nightwind from 'nightwind/helper';
import axios from 'axios';
import { UserContext } from './UserContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import LoginThemeButton from './components/LoginThemeButton';
import Spinner from './components/Spinner';

function Register({ setUser, toggleDarkMode, isDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    if (username && password && password !== confirmPassword) {
      console.log('returned');
      setPasswordMatch(false);
      setErrorFunction("Passwords don't match");
      return;
    }
    console.log('not returned');
    setIsLoading(true);
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
        setIsLoading(false);
      }
    } catch (error) {
      // setError(error.response.data.msg);
      // setTimeout(() => setError(null), 3000);
      setErrorFunction(error.response.data.msg);
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
          <input
            className='block w-full rounded-sm p-2 mb-2 border'
            type='password'
            placeholder='confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        </form>
      </div>
    </>
  );
}

export default Register;
