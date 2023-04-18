import React from 'react';
import NavBarLogo from '../common/NavBarLogo';

const LandingHeader = () => {
 return (
  <nav className={`bg-white fixed w-full z-10`}>
   <div className="mx-auto px-4 sm:px-6 lg:px-20">
    <div className="flex justify-between h-16">
      <NavBarLogo url={`/`} />    
    </div>
   </div>
  </nav>
 );
}

export default LandingHeader;