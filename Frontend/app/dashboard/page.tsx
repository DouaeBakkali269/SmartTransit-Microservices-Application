import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Welcome to TransitMA Dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Dashboard content will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    )
}

