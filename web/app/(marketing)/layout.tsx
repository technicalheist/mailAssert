import Navbar from '@/components/Navbar'

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Navbar />
            <main className="pt-16">
                {children}
            </main>
        </div>
    )
}
