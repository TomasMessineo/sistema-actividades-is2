import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Disciplines from '../components/Disciplines';
import Stats from '../components/Stats';
import Benefits from '../components/Benefits';
import Footer from '../components/Footer';

function GeneralInfoPage() {
  const mainRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing-page" ref={mainRef}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>
        <Disciplines />
        <Stats />
        <Benefits />
      </div>
      <Footer />
    </div>
  );
}

export default GeneralInfoPage;
