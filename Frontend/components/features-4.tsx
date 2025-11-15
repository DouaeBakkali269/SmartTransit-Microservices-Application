import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'

export default function Features() {
    return (
        <section id="features" className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Comprehensive Transport Management Solutions</h2>
                    <p>TransitMA provides everything you need to manage urban transportation efficiently. From real-time tracking to digital payments, we've got your transit system covered.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Real-Time Tracking</h3>
                        </div>
                        <p className="text-sm">GPS-enabled vehicle tracking with live arrival predictions for seamless passenger experience.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">Smart Scheduling</h3>
                        </div>
                        <p className="text-sm">Automated scheduling system that optimizes routes and assigns vehicles based on traffic and demand.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />

                            <h3 className="text-sm font-medium">Secure Payments</h3>
                        </div>
                        <p className="text-sm">PCI-DSS compliant payment processing with multiple payment methods and secure digital tickets.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />

                            <h3 className="text-sm font-medium">Digital Ticketing</h3>
                        </div>
                        <p className="text-sm">Instant ticket generation and validation on mobile devices with subscription management options.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />

                            <h3 className="text-sm font-medium">Admin Dashboard</h3>
                        </div>
                        <p className="text-sm">Comprehensive monitoring tools for fleet management, scheduling, and system performance metrics.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />

                            <h3 className="text-sm font-medium">Smart Notifications</h3>
                        </div>
                        <p className="text-sm">Proactive alerts for delays, cancellations, ticket confirmations, and customizable notification preferences.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
