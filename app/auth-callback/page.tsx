import { useRouter, useSearchParams } from 'next/navigation'

import { trpc } from '../_trpc/client'

export default async function Page() {
    const router = useRouter()

    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    trpc.authCallback.useQuery(undefined, {
        //@ts-ignore
        onSuccess: ({ success }) => {
            if (success) {
                // user is synced to db
                router.push(origin ? `/${origin}` : '/dashboard')
            }
        },
    })

    return (
        <div>
            <h1></h1>
        </div>
    )
}
