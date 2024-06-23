'use client'

import React, { useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from './ui/button'

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={v => {
                if (!v) {
                    setIsOpen(v)
                }
            }}
        >
            <DialogTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>Upload PDF</Button>
            </DialogTrigger>
            <DialogContent>{/* TODO: upload functionality */}</DialogContent>
        </Dialog>
    )
}

export default UploadButton
