import { useEffect } from 'react'
import Layout from '@/components/Layout'
import AppRoutes from '@/routes/AppRoutes'

function App() {
    useEffect(() => {
        document.title = "Money Journey";
    }, [])

    return (
        <Layout>
            <AppRoutes />
        </Layout>
    )
}

export default App
