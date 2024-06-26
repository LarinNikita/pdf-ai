import { NextResponse } from 'next/server'
import { PineconeStore } from '@langchain/pinecone'
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { db } from '@/db'

import { openai } from '@/lib/openai'
import { pinecone } from '@/lib/pinocone'
import { SendMessageValidator } from '@/lib/validator/SendMessageValidator'

import { OpenAIStream, StreamingTextResponse } from 'ai'

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

    // vectorized message
    const pineconeIndex = pinecone.Index('pdfai')

    const embeddings = new OllamaEmbeddings({
        model: 'llama3',
    })

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id,
    })

    const results = await vectorStore.similaritySearch(message, 4)

    const prevMessages = await db.message.findMany({
        where: {
            fileId,
        },
        orderBy: {
            createdAt: 'asc',
        },
        take: 6,
    })

    const formattedPrevMessages = prevMessages.map(msg => ({
        role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
        content: msg.text,
    }))

    const response = await openai.chat.completions.create({
        model: 'llama3',
        temperature: 0,
        stream: true,
        messages: [
            {
                role: 'system',
                content:
                    'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
            },
            {
                role: 'user',
                content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map(message => {
            if (message.role === 'user') return `User: ${message.content}\n`
            return `Assistant: ${message.content}\n`
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map(r => r.pageContent).join('\n\n')}
        
        USER INPUT: ${message}`,
            },
        ],
    })

    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    fileId,
                    userId: user.id,
                },
            })
        },
    })

    return new StreamingTextResponse(stream)
}
