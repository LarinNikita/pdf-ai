'use client'

import React, { useState } from 'react'

import SimpleBar from 'simplebar-react'
import { Expand, Loader2 } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'

import { Button } from './ui/button'
import { useToast } from './ui/use-toast'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString()

interface PdfFullScreenProps {
    fileUrl: string
}

const PdfFullScreen = ({ fileUrl }: PdfFullScreenProps) => {
    const { toast } = useToast()

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [numPages, setNumPages] = useState<number>()

    const { width, ref } = useResizeDetector()

    return (
        <Dialog
            open={isOpen}
            onOpenChange={v => {
                if (!v) {
                    setIsOpen(v)
                }
            }}
        >
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button
                    aria-label="fullscreen"
                    variant="ghost"
                    className="gap-1.5"
                >
                    <Expand className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-7xl">
                <SimpleBar
                    autoHide={false}
                    className="mt-6 max-h-[calc(100vh-10rem)]"
                >
                    <div ref={ref}>
                        <Document
                            file={fileUrl}
                            loading={
                                <div className="flex justify-center">
                                    <Loader2 className="my-24 size-6 animate-spin" />
                                </div>
                            }
                            onLoadError={() => {
                                toast({
                                    title: 'Error loading PDF',
                                    description: 'Please try again later.',
                                    variant: 'destructive',
                                })
                            }}
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages)
                            }}
                            className="max-h-full"
                        >
                            {new Array(numPages).fill(0).map((_, i) => (
                                <Page
                                    key={i}
                                    width={width ? width : 1}
                                    pageNumber={i + 1}
                                />
                            ))}
                        </Document>
                    </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    )
}

export default PdfFullScreen
