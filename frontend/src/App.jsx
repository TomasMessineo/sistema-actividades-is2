import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import './App.css'
import RutasApp from './routes/rutasApp'

function App() {
  return (
    <BrowserRouter>
      <RutasApp/>
    </BrowserRouter>
  )
}

export default App
