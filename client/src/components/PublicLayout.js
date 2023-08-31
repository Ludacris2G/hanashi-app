import nightwind from 'nightwind/helper';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <>
      <div className='bg-primary-100 h-screen flex relative items-center'>
        <Outlet />
      </div>
    </>
  );
}

export default PublicLayout;
