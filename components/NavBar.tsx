'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

export function NavBar() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Plantel', href: '/roster' },
        { label: 'Carga', href: '/ingest' },
        { label: 'Asistente', href: '/assistant' },
        { label: 'Admin', href: '/admin/users' },
    ];

    return (
        <header className="sticky top-4 z-50 w-full px-4">
            <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-primary/95 backdrop-blur-md shadow-lg transition-all">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="relative w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                <Image
                                    src="/san-martin-logo.png"
                                    alt="CASM Logo"
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col leading-none text-primary-foreground">
                                <span className="font-bold tracking-wider uppercase text-lg">CASM</span>
                                <span className="font-light text-[10px] opacity-90 tracking-widest uppercase">Performance Lab</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wide z-10',
                                        isActive ? 'text-primary' : 'text-primary-foreground/80 hover:text-white'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end leading-tight text-right">
                            <span className="text-xs text-primary-foreground/90 font-medium">Usuario Activo</span>
                            <span className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">Admin</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                            AD
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
