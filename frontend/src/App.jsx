import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RutasApp from './routes/rutasApp';
import RutasPago from './routes/rutasPago';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pago/*" element={<RutasPago />} />
        <Route path="/*" element={<RutasApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;