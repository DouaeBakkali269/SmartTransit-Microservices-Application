'use client'

const teamMembers = [
    {
        name: 'BEHRI Omar',
        image: '/team/omar.jpg', // Placeholder - user will provide
    },
    {
        name: 'BAKKALI Douae',
        image: '/team/douae.jpg', // Placeholder - user will provide
    },
    {
        name: 'ABBOUD Meriem',
        image: '/team/meriem.jpg', // Placeholder - user will provide
    },
    {
        name: 'Elammary Ilyas',
        image: '/team/ilyas.jpg', // Placeholder - user will provide
    },
]

export default function TeamSection() {
    return (
        <section id="team" className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-medium lg:text-5xl">Meet Our Team</h2>
                    <p className="mt-4 text-muted-foreground">The talented individuals building TransitMA</p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center space-y-4">
                            <div className="relative size-32 overflow-hidden rounded-full border-4 border-border bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        // Fallback to a placeholder if image doesn't exist
                                        const target = e.target as HTMLImageElement
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=128&background=random`
                                    }}
                                />
                            </div>
                            <h3 className="text-lg font-medium">{member.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

