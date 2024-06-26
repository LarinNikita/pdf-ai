import React from 'react'

import { Loader2, MessageSquare } from 'lucide-react'

import { trpc } from '@/app/_trpc/client'

import { INFINITE_QUERY_LIMIT } from '@/constants'

import Message from './Message'

import { Skeleton } from '../ui/skeleton'

interface MessagesProps {
    fileId: string
}

const Messages = ({ fileId }: MessagesProps) => {
    const { data, isLoading, fetchNextPage } =
        trpc.getFileMessages.useInfiniteQuery(
            {
                fileId,
                limit: INFINITE_QUERY_LIMIT,
            },
            {
                getNextPageParam: lastPage => lastPage?.nextCursor,
                enabled: !!fileId, //? keepPreviousData: true
            },
        )

    const messages = data?.pages.flatMap(page => page.messages)

    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: 'loading-message',
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
            </span>
        ),
    }

    const combinedMessages = [
        ...(true ? [loadingMessage] : []),
        ...(messages ?? []),
    ]

    return (
        <div className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex max-h-[calc(100vh-3.5rem-7rem)] flex-1 flex-col-reverse gap-4 overflow-y-auto border-zinc-200 p-3">
            {combinedMessages && combinedMessages.length > 0 ? (
                combinedMessages.map((message, i) => {
                    const isNextMessageSamePerson =
                        combinedMessages[i - 1]?.isUserMessage ===
                        combinedMessages[i]?.isUserMessage

                    if (i === combinedMessages.length - 1) {
                        return (
                            <Message
                                key={message.id}
                                message={message}
                                isNextMessageSamePerson={
                                    isNextMessageSamePerson
                                }
                            />
                        )
                    } else
                        return (
                            <Message
                                key={message.id}
                                message={message}
                                isNextMessageSamePerson={
                                    isNextMessageSamePerson
                                }
                            />
                        )
                })
            ) : isLoading ? (
                <div className="flex w-full flex-col gap-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                    <MessageSquare className="size-8 text-blue-500" />
                    <h3 className="text-xl font-semibold">
                        Yoy&apos;re all set!
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Ask your first question to get started.
                    </p>
                </div>
            )}
        </div>
    )
}

export default Messages
