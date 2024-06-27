import React from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { Gem } from 'lucide-react'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'

import { getUserSubscriptionPlan } from '@/lib/stripe'

import { Icons } from './Icons'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserAccountNavProps {
    email: string | undefined
    imageUrl: string
    name: string
}

const UserAccountNav = async ({
    email,
    imageUrl,
    name,
}: UserAccountNavProps) => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="overflow-visible">
                <Button className="aspect-square size-8 rounded-full bg-slate-400">
                    <Avatar className="relative size-8">
                        {imageUrl ? (
                            <div className="relative aspect-square size-full">
                                <Image
                                    src={imageUrl}
                                    alt="profile picture"
                                    fill
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        ) : (
                            <AvatarFallback>
                                <span className="sr-only">{name}</span>
                                <Icons.user className="size-4 text-zinc-900" />
                            </AvatarFallback>
                        )}
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5 leading-none">
                        {name && (
                            <p className="text-sm font-medium text-black">
                                {name}
                            </p>
                        )}
                        {email && (
                            <p className="w=[200px] truncate text-xs text-zinc-700">
                                {email}
                            </p>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    {subscriptionPlan?.isSubscribed ? (
                        <Link href="/dashboard/billing">
                            Manage Subscription
                        </Link>
                    ) : (
                        <Link href="/pricing">
                            Upgrade{' '}
                            <Gem className="ml-1.5 size-4 text-blue-600" />
                        </Link>
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <LogoutLink>Log out</LogoutLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserAccountNav
