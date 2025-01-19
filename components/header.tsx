'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, HelpCircle, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  useEffect(() => {
    if (user) {
      const checkProfileCompletion = async () => {
        const userDoc = await getDoc(doc(getFirestore(), 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNeedsProfileCompletion(!userData.displayName || !userData.username);
        }
      };
      checkProfileCompletion();
    }
  }, [user]);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 7L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 12L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 17L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            1-Form
          </Link>

          <nav className="hidden md:flex space-x-4 items-center">
            <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link href="/faq" className="text-gray-600 hover:text-indigo-600 transition-colors">
              <HelpCircle className="inline-block w-4 h-4 mr-1" />
              FAQ
            </Link>
            {!loading && user ? (
              <>
                <Link href="/forms" className="text-gray-600 hover:text-indigo-600 transition-colors">Forms</Link>
                <Link href="/file-rooms" className="text-gray-600 hover:text-indigo-600 transition-colors">File Rooms</Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-5 w-5" />
                      {needsProfileCompletion && (
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/account" className="w-full flex items-center">
                        Account
                        {needsProfileCompletion && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/joined-rooms" className="w-full">Joined Rooms</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => signOut(auth)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-4"
          >
            <nav className="flex flex-col space-y-4">
              <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
              <Link href="/faq" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <HelpCircle className="inline-block w-4 h-4 mr-1" />
                FAQ
              </Link>
              {!loading && user ? (
                <>
                  <Link href="/forms" className="text-gray-600 hover:text-indigo-600 transition-colors">Forms</Link>
                  <Link href="/file-rooms" className="text-gray-600 hover:text-indigo-600 transition-colors">File Rooms</Link>
                  <Link href="/account" className="text-gray-600 hover:text-indigo-600 transition-colors">Account</Link>
                  <Link href="/joined-rooms" className="text-gray-600 hover:text-indigo-600 transition-colors">Joined Rooms</Link>
                  <Button variant="ghost" onClick={() => signOut(auth)} className="justify-start px-0">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}

