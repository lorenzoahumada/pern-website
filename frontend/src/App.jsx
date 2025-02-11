import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from './store/useThemeStore'
import { Toaster } from 'react-hot-toast'

function App() {
  const {theme} = useThemeStore();
  return (
    <div className='min-h-screen bg-base-200 transition-colors duration-300' data-theme={theme}>
      <Navbar/>
      
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/product/:id" element={<ProductPage />}></Route>
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
