import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const Banks = lazy(() => import('@/pages/Banks'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const BalanceRecords = lazy(() => import('@/pages/BalanceRecords'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

export default function AppRoutes() {
    return (
        <Suspense fallback={<div className="loading">Carregando...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/banks" element={<Banks />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/balance" element={<BalanceRecords />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<h2>Pagina nao encontrada</h2>} />
            </Routes>
        </Suspense>
    );
}
