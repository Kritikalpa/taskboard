import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/shared/Navbar';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards/:id" element={<BoardPage />} />
      </Routes>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#21262D',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '6px',
            fontSize: '13px',
          },
          iconTheme: { primary: '#F22F46', secondary: '#21262D' },
          duration: 2500,
        }}
      />
    </BrowserRouter>
  );
}
