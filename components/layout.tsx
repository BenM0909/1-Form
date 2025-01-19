'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import { AIAssistant } from './AIAssistant';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      {!isLoginPage && <AIAssistant />}
    </div>
  );
}

