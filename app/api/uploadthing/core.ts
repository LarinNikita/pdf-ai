import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { db } from '@/db'

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { pinecone } from '@/lib/pinocone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'
import { PineconeStore } from '@langchain/pinecone'

const f = createUploadthing()

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
        .middleware(async ({ req }) => {
            const { getUser } = getKindeServerSession()
            const user = await getUser()

            if (!user || !user.id) {
                throw new Error('Unauthorized')
            }

            return { userId: user.id }
        })
        .onUploadComplete(async ({ metadata, file }) => {
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

                const pineconeIndex = pinecone.Index('ai')

                const embeddings = new OllamaEmbeddings({
                    model: 'mxbai-embed-large',
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
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
