'use client'

import React, { useState } from 'react'

import { z } from 'zod'
import SimpleBar from 'simplebar-react'
import { useForm } from 'react-hook-form'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { zodResolver } from '@hookform/resolvers/zod'
import { useResizeDetector } from 'react-resize-detector'
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react'

import { cn } from '@/lib/utils'

import PdfFullScreen from './PdfFullScreen'

import { Input } from './ui/input'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

    const [numPages, setNumPages] = useState<number>()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1)
    const [rotation, setRotation] = useState<number>(0)
    const [renderScale, setRenderScale] = useState<number | null>(null)

    const isLoading = renderScale !== scale

    const CustomPageValidator = z.object({
        page: z
            .string()
            .refine(num => Number(num) > 0 && Number(num) <= numPages!),
    })

    type TCustomPageValidator = z.infer<typeof CustomPageValidator>

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: '1',
        },
        resolver: zodResolver(CustomPageValidator),
    })

    const handlePageSubmit = ({ page }: TCustomPageValidator) => {
        setCurrentPage(Number(page))
        setValue('page', String(page))
    }

    return (
        <div className="flex w-full flex-col items-center rounded-md bg-white shadow">
            <div className="flex h-14 w-full items-center justify-between border-b border-zinc-200 px-2">
                <div className="flex items-center gap-1.5">
                    <Button
                        onClick={() => {
                            setCurrentPage(prev =>
                                prev - 1 > 1 ? prev - 1 : 1,
                            )
                            setValue('page', String(currentPage - 1))
                        }}
                        disabled={currentPage <= 1}
                        variant="ghost"
                        aria-label="previous page"
                    >
                        <ChevronDown className="size-4" />
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Input
                            {...register('page')}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSubmit(handlePageSubmit)()
                                }
                            }}
                            className={cn(
                                'h-8 w-12',
                                errors.page && 'focus-visible:ring-red-500',
                            )}
                        />
                        <p className="space-x-1 text-sm text-zinc-700">
                            <span>/</span>
                            <span>{numPages ?? 'x'}</span>
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setCurrentPage(prev =>
                                prev + 1 > numPages! ? numPages! : prev + 1,
                            )
                            setValue('page', String(currentPage + 1))
                        }}
                        disabled={
                            numPages === undefined || currentPage === numPages
                        }
                        variant="ghost"
                        aria-label="next page"
                    >
                        <ChevronUp className="size-4" />
                    </Button>
                </div>
                <div className="space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                aria-label="zoom"
                                variant="ghost"
                                className="gap-1.5"
                            >
                                <Search className="size-4" />
                                {scale * 100}%
                                <ChevronDown className="size-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setScale(1)}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(1.5)}>
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2)}>
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2.5)}>
                                250%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(3)}>
                                300%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        onClick={() => setRotation(prev => prev + 90)}
                        aria-label="rotate 90 degrees"
                        variant="ghost"
                    >
                        <RotateCw className="size-4" />
                    </Button>
                    <PdfFullScreen fileUrl={url} />
                </div>
            </div>
            <div className="max-h-screen w-full flex-1">
                <SimpleBar
                    autoHide={false}
                    className="max-h-[calc(100vh-10rem)]"
                >
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
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages)
                            }}
                            className="max-h-full"
                        >
                            {isLoading && renderScale ? (
                                <Page
                                    width={width ? width : 1}
                                    pageNumber={currentPage}
                                    scale={scale}
                                    rotate={rotation}
                                    key={'@' + renderScale}
                                />
                            ) : null}
                            <Page
                                className={cn(isLoading ? 'hidden' : '')}
                                width={width ? width : 1}
                                pageNumber={currentPage}
                                scale={scale}
                                rotate={rotation}
                                key={'@' + scale}
                                loading={
                                    <div className="flex justify-center">
                                        <Loader2 className="my-24 size-6 animate-spin" />
                                    </div>
                                }
                                onRenderSuccess={() => setRenderScale(scale)}
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </div>
        </div>
    )
}

export default PdfRender
