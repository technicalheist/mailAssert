import Link from 'next/link';
import { auth } from '@/auth';
import UserMenu from './UserMenu';

export default async function Navbar() {
    const session = await auth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="MailAssert Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/20 object-cover" />
                        <span className="text-xl font-bold text-white tracking-tight">MailAssert</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Features
                        </Link>
                        <Link href="/#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Pricing
                        </Link>
                        <Link href="/docs" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Docs
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Contact
                        </Link>
                    </div>

                    {/* Auth Buttons / User Menu */}
                    {session?.user ? (
                        <UserMenu user={session.user} />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Login
                            </Link>
                            <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
