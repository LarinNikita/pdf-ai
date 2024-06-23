import { redirect } from 'next/navigation'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db } from '@/db'

export default async function Page() {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const existingUser = await db.user.findFirst({
        where: {
            id: user.id,
        },
    })

    if (!existingUser) redirect('/auth-callback?origin=dashboard')

    return (
        <div>
            <h1>{user?.email}</h1>
        </div>
    )
}
