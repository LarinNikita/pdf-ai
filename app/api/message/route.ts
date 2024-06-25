import { NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { db } from '@/db'

import { SendMessageValidator } from '@/lib/validator/SendMessageValidator'

export const POST = async (req: NextResponse) => {
    const body = await req.json()

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) return new Response('Unauthorized', { status: 401 })

    const { fileId, message } = SendMessageValidator.parse(body)

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: user.id,
        },
    })

    if (!file) return new Response('Not found', { status: 404 })

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            fileId,
            userId: user.id,
        },
    })
}
