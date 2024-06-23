'use client'

import React from 'react'

import Link from 'next/link'
import Image from 'next/image'
import {
    LoginLink,
    RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components'

import MaxWidthWrapper from './MaxWidthWrapper'

import { buttonVariants } from './ui/button'
import { ArrowRight } from 'lucide-react'

const Navbar = () => {
    return (
        <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link href="/" className="z-40 flex">
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={24}
                            height={24}
                            className="mr-2"
                        />
                        <span className="font-semibold">Iris</span>
                    </Link>
                    {/* TODO: mobile navbar */}
                    <div className="hidden items-center space-x-4 sm:flex">
                        <>
                            <Link
                                href="/pricing"
                                className={buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                })}
                            >
                                Pricing
                            </Link>
                            <LoginLink
                                className={buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                })}
                            >
                                Sign in
                            </LoginLink>
                            <RegisterLink
                                className={buttonVariants({
                                    size: 'sm',
                                })}
                            >
                                Get started
                                <ArrowRight className="ml-1.5 size-5" />
                            </RegisterLink>
                        </>
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default Navbar
