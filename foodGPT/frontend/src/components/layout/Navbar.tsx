'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
    // ✅ FIX: include signInWithGoogle
    const { user, signOut, signInWithGoogle, loading } = useAuth();

    const getUserInitials = () => {
        if (!user) return '?';
        if (user.displayName) {
            return user.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return user.email?.[0].toUpperCase() || 'U';
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                            <img
                                src="/logo_edited_withoutbg.png"
                                alt="Dishcovery Logo"
                                className="w-full h-full object-contain drop-shadow-md"
                            />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Dishcovery
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="nav-link">Home</Link>
                        {user && (
                            <>
                                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                                <Link href="/recipes" className="nav-link">My Recipes</Link>
                            </>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        {loading ? (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        ) : user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || undefined} />
                                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{user.displayName?.split(' ')[0]}</span>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <p className="text-sm font-medium">{user.displayName}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </DropdownMenuLabel>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={signOut}
                                        className="text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            // ✅ Sign in directly with Google
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={signInWithGoogle}
                                disabled={loading}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-2 rounded-md font-medium shadow-sm"
                            >
                                Sign In
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
