import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

function availableClasses() {
  const mainRef = useRef(null);

  return (
    <div className="available-classes" ref={mainRef}>
      <Navbar />
    </div>
  );
}

export default LandingPage;
