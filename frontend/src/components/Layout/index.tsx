import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import './Layout.scss';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: Readonly<LayoutProps>) {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
