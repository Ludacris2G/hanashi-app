import React from 'react';
import { Link } from 'react-router-dom'; // You can add a link back to the homepage

function NotFound() {
  return (
    <div className='h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-800 text-white'>
      <div className='text-6xl font-extrabold mb-4'>404</div>
      <p className='text-xl mb-8'>Oops! Page not found</p>
      <Link
        to='/'
        className='bg-primary-600 text-white py-2 px-4 rounded-full text-lg hover:bg-primary-700 transition duration-300'
      >
        Go back to homepage
      </Link>
    </div>
  );
}

export default NotFound;
