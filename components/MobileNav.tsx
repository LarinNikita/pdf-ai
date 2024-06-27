'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu } from 'lucide-react'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const toggleOpen = () => setIsOpen(prev => !prev)

    useEffect(() => {
        if (isOpen) toggleOpen()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    const closeOnCurrent = (href: string) => {
        if (pathname === href) {
            toggleOpen()
        }
    }

    return (
        <div className="sm:hidden">
            <Menu
                onClick={toggleOpen}
                className="relative z-50 size-5 text-zinc-700"
            />
            {isOpen ? (
                <div className="fixed inset-0 z-0 w-full animate-in fade-in-20 slide-in-from-top-5">
                    <ul className="absolute grid w-full gap-3 border-b border-zinc-200 bg-white px-10 pb-8 pt-20 shadow-xl">
                        {!isAuth ? (
                            <>
                                <li>
                                    <Link
                                        href="/sign-up"
                                        onClick={() =>
                                            closeOnCurrent('/sign-up')
                                        }
                                        className="flex w-full items-center font-semibold text-blue-600"
                                    >
                                        Get started
                                        <ArrowRight className="ml-2 size-5" />
                                    </Link>
                                </li>
                                <li className="my-3 h-px w-full bg-gray-300" />
                                <li>
                                    <Link
                                        href="/sign-in"
                                        onClick={() =>
                                            closeOnCurrent('/sign-in')
                                        }
                                        className="flex w-full items-center font-semibold"
                                    >
                                        Sign in
                                    </Link>
                                </li>
                                <li className="my-3 h-px w-full bg-gray-300" />
                                <li>
                                    <Link
                                        href="/pricing"
                                        onClick={() =>
                                            closeOnCurrent('/pricing')
                                        }
                                        className="flex w-full items-center font-semibold"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        href="/dashboard"
                                        onClick={() =>
                                            closeOnCurrent('/dashboard')
                                        }
                                        className="flex w-full items-center font-semibold"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="my-3 h-px w-full bg-gray-300" />
                                <li>
                                    <LogoutLink className="flex w-full items-center font-semibold">
                                        Sign out
                                    </LogoutLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            ) : null}
        </div>
    )
}

export default MobileNav
