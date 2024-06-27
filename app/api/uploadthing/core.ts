import { PineconeStore } from '@langchain/pinecone'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { db } from '@/db'

import { pinecone } from '@/lib/pinocone'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { PLANS } from '@/constants'

const f = createUploadthing()

const middleware = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
        throw new Error('Unauthorized')
    }

    const subscriptionPlan = await getUserSubscriptionPlan()

    return { userId: user.id, subscriptionPlan }
}

const onUploadComplete = async ({
    metadata,
    file,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string
        name: string
        url: string
    }
}) => {
    const isFileExist = await db.file.findFirst({
        where: {
            key: file.key,
        },
    })

    if (isFileExist) return

    const createdFile = await db.file.create({
        data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: `https://utfs.io/f/${file.key}`,
            uploadStatus: 'PROCESSING',
        },
    })

    try {
        const response = await fetch(`https://utfs.io/f/${file.key}`)

        const blob = await response.blob()

        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load()

        const pagesAmt = pageLevelDocs.length //for subscription plan

        const { subscriptionPlan } = metadata
        const { isSubscribed } = subscriptionPlan

        const isProExceed =
            pagesAmt > PLANS.find(plan => plan.name === 'Pro')!.pagesPerPdf
        const isFreeExceed =
            pagesAmt > PLANS.find(plan => plan.name === 'Free')!.pagesPerPdf

        if ((isSubscribed && isProExceed) || (!isSubscribed && isFreeExceed)) {
            await db.file.update({
                where: {
                    id: createdFile.id,
                },
                data: {
                    uploadStatus: 'FAILED',
                },
            })
        }

        const pineconeIndex = pinecone.Index('pdfai')

        const embeddings = new OllamaEmbeddings({
            model: 'llama3',
        })

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id,
        })

        await db.file.update({
            data: {
                uploadStatus: 'SUCCESS',
            },
            where: {
                id: createdFile.id,
            },
        })
    } catch (error) {
        console.log(error)

        await db.file.update({
            data: {
                uploadStatus: 'FAILED',
            },
            where: {
                id: createdFile.id,
            },
        })
    }
}

export const ourFileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
