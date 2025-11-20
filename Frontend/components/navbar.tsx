'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Bus, LogOut, User, Map, Ticket, LayoutDashboard, Car, AlertTriangle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Bus className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-slate-900">TransitMA</span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {user.role === 'user' && (
                                <>
                                    <NavLink href="/search" active={isActive('/search')} icon={<Map className="w-4 h-4 mr-1" />}>Search</NavLink>
                                    <NavLink href="/tickets" active={isActive('/tickets')} icon={<Ticket className="w-4 h-4 mr-1" />}>My Tickets</NavLink>
                                    <NavLink href="/lines" active={isActive('/lines')} icon={<Bus className="w-4 h-4 mr-1" />}>Lines</NavLink>
                                </>
                            )}
                            {user.role === 'driver' && (
                                <>
                                    <NavLink href="/driver/current-trip" active={isActive('/driver/current-trip')} icon={<Car className="w-4 h-4 mr-1" />}>Current Trip</NavLink>
                                    <NavLink href="/driver/history" active={isActive('/driver/history')} icon={<Map className="w-4 h-4 mr-1" />}>History</NavLink>
                                    <NavLink href="/driver/incidents" active={isActive('/driver/incidents')} icon={<AlertTriangle className="w-4 h-4 mr-1" />}>Incidents</NavLink>
                                </>
                            )}
                            {user.role === 'admin' && (
                                <>
                                    <NavLink href="/admin/dashboard" active={isActive('/admin/dashboard')} icon={<LayoutDashboard className="w-4 h-4 mr-1" />}>Dashboard</NavLink>
                                    <NavLink href="/admin/lines" active={isActive('/admin/lines')} icon={<Bus className="w-4 h-4 mr-1" />}>Lines</NavLink>
                                    <NavLink href="/admin/drivers" active={isActive('/admin/drivers')} icon={<Car className="w-4 h-4 mr-1" />}>Drivers</NavLink>
                                    <NavLink href="/admin/incidents" active={isActive('/admin/incidents')} icon={<AlertTriangle className="w-4 h-4 mr-1" />}>Incidents</NavLink>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={user.role === 'driver' ? '/driver/profile' : '/profile'}>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden md:inline">{user.name}</span>
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, active, children, icon }: { href: string; active: boolean; children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${active
                    ? 'border-blue-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
        >
            {icon}
            {children}
        </Link>
    );
}
