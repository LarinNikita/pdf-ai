import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { INFINITE_QUERY_LIMIT, PLANS } from '@/constants'

import { db } from '@/db'

import { privateProcedure, publicProcedure, router } from './trpc'
import { absoluteUrl } from '@/lib/utils'
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe'

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' })

        //* check if the user is in the database
        const existingUser = await db.user.findFirst({
            where: { id: user.id },
        })

        if (!existingUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                },
            })
        }

        return { success: true }
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        return await db.file.findMany({
            where: {
                userId,
            },
        })
    }),
    getFile: privateProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    userId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            return file
        }),
    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ input, ctx }) => {
            const file = await db.file.findFirst({
                where: {
                    id: input.fileId,
                    userId: ctx.userId,
                },
            })

            if (!file) return { status: 'PENDING' as const }

            return { status: file.uploadStatus }
        }),
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                fileId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { userId } = ctx
            const { fileId, cursor } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    userId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            const messages = await db.message.findMany({
                where: {
                    fileId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    text: true,
                    createdAt: true,
                },
            })

            let nextCursor: typeof cursor | undefined = undefined

            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }

            return {
                messages,
                nextCursor,
            }
        }),
    deleteFile: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx
            const file = await db.file.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            await db.file.delete({
                where: {
                    id: input.id,
                    userId,
                },
            })

            return file
        }),
    createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
        const { userId } = ctx

        const billingUrl = absoluteUrl('/dashboard/billing')

        if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

        const existingUser = await db.user.findFirst({
            where: {
                id: userId,
            },
        })

        if (!existingUser) throw new TRPCError({ code: 'UNAUTHORIZED' })

        const subscriptionPlan = await getUserSubscriptionPlan()

        if (subscriptionPlan.isCanceled && existingUser.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: existingUser.stripeCustomerId,
                return_url: billingUrl,
            })

            return { url: stripeSession.url }
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            line_items: [
                {
                    price: PLANS.find(plan => plan.name === 'Pro')?.price
                        .priceIds.test,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId,
            },
        })

        return { url: stripeSession.url }
    }),
})

export type AppRouter = typeof appRouter
