import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Nav from './components/Nav.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import CoastFirePage from './features/coast-fire/CoastFirePage.jsx';
import './App.css';

const NAV_LINKS = [
  { label: 'Dashboard',   href: '/' },
  { label: 'Portfolio',   href: '#' },
  { label: 'Calculators', href: '/calculators/coast-fire' },
  { label: 'Settings',    href: '#' },
];

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Nav links={NAV_LINKS} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calculators/coast-fire" element={<CoastFirePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
