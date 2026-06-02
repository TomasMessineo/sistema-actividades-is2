import { useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero';
import About from '../../components/About';
import Disciplines from '../../components/Disciplines';
import Stats from '../../components/Stats';
import Benefits from '../../components/Benefits';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import '../../styles/DashboardInfo.css';

function LandingPage() {
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
      <Hero />
      <About />
      <div id="info" className="info-dashboard">
        <Stats />
        <Disciplines />
        <Benefits />
      </div>
      <Contact />
      <Footer />
    </div>
  );
}

export default LandingPage;