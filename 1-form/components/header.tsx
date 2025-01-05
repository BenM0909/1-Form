'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Menu } from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-red-600 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="relative">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <Link href="/" className="text-2xl font-bold flex items-center">
                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 7L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 12L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 17L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  1-Form
                </Link>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <Link href="/" className="w-full">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/forms" className="w-full">Forms</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/joined-rooms" className="w-full">Joined Rooms</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/account" className="w-full">Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/file-rooms" className="w-full">File Rooms</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <nav className="flex space-x-4 items-center">
          {!loading && (
            user ? (
              <>
                <Link href="/forms">
                  <Button className="border border-white text-white bg-transparent rounded-full px-4 py-2 hover:bg-white hover:text-red-600 transition">
                    Forms
                  </Button>
                </Link>
                <Link href="/file-rooms">
                  <Button className="border border-white text-white bg-transparent rounded-full px-4 py-2 hover:bg-white hover:text-red-600 transition">
                    File Rooms
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-10 h-10 rounded-full border border-white p-0 bg-transparent hover:bg-white hover:text-red-600 transition">
                      <User className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/account" className="w-full">Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => signOut(auth)}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button className="border border-white text-white bg-transparent rounded-full px-4 py-2 hover:bg-white hover:text-red-600 transition">
                  Login
                </Button>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

