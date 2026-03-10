import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboards/Dashboard'

function App() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
        document.title = "💸 Money Journey";
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <div className="app-container">
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <main style={{ padding: '2rem' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<h2>Página não encontrada 😢</h2>} />
                </Routes>
            </main>
        </div>
    )
}

export default App