'use client'

import React from 'react'

import { Loader2 } from 'lucide-react'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useResizeDetector } from 'react-resize-detector'

import { useToast } from './ui/use-toast'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString()

interface PdfRenderProps {
    url: string
}

const PdfRender = ({ url }: PdfRenderProps) => {
    const { toast } = useToast()
    const { width, ref } = useResizeDetector()

    return (
        <div className="flex w-full flex-col items-center rounded-md bg-white shadow">
            <div className="flex h-14 w-full items-center justify-between border-b border-zinc-200 px-2">
                <div className="flex items-center gap-1.5">top bar</div>
            </div>
            <div className="max-h-screen w-full flex-1">
                <div ref={ref}>
                    <Document
                        file={url}
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
                        className="max-h-full"
                    >
                        <Page width={width ? width : 1} pageNumber={1} />
                    </Document>
                </div>
            </div>
        </div>
    )
}

export default PdfRender
