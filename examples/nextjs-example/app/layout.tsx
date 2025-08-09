import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Mod-Engine Next.js Example',
    description: 'Interactive demonstration of the mod-engine RPG item modification system',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.className}>
            <body>
                <nav className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold text-slate-900">
                                    🛡️ Mod-Engine Demo
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm">
                                    Home
                                </Link>
                                {/* <a
                                    href="/examples"
                                    className="text-slate-600 hover:text-slate-900 text-sm"
                                >
                                    Examples
                                </a> */}
                                <a
                                    href="https://github.com/brandon-irving/mod-engine"
                                    className="text-slate-600 hover:text-slate-900 text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>

                <footer className="bg-slate-100 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <p className="text-center text-slate-600 text-sm">
                            Built with mod-engine - A TypeScript library for typed attributes and modifiers
                        </p>
                    </div>
                </footer>
            </body>
        </html>
    )
}