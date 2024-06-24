'use client'

import React, { useState } from 'react'

import Dropzone from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { Cloud, File, Loader2 } from 'lucide-react'

import { trpc } from '@/app/_trpc/client'

import { useUploadThing } from '@/lib/uploadthing'

import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { useToast } from './ui/use-toast'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

const UploadDropzone = () => {
    const router = useRouter()
    const { toast } = useToast()

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    const { startUpload } = useUploadThing('pdfUploader')

    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: file => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true,
        retryDelay: 500,
    })

    const startSimulatedProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress(prevProgress => {
                if (prevProgress >= 95) {
                    clearInterval(interval)
                    return prevProgress
                }
                return prevProgress + 5
            })
        }, 500)

        return interval
    }

    return (
        <Dropzone
            multiple={false}
            onDrop={async acceptedFile => {
                setIsUploading(true)
                const progressInterval = startSimulatedProgress()

                const res = await startUpload(acceptedFile)

                if (!res) {
                    toast({
                        title: 'Something went wrong',
                        description: 'Please try again later.',
                        variant: 'destructive',
                    })
                }

                console.log(res)

                //@ts-ignore
                const [fileResponse] = res

                const key = fileResponse?.key

                if (!key) {
                    toast({
                        title: 'Something went wrong',
                        description: 'Please try again later.',
                        variant: 'destructive',
                    })
                }

                clearInterval(progressInterval)
                setUploadProgress(100)

                startPolling({ key })
            }}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div
                    {...getRootProps()}
                    className="m-4 h-64 rounded-lg border border-dashed border-gray-300"
                >
                    <div className="flex size-full items-center justify-center">
                        <label
                            htmlFor="dropzone-file"
                            className="flex size-full cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                <Cloud className="mb-2 size-6 text-zinc-500" />
                                <p className="mb-2 text-sm text-zinc-700">
                                    <span className="font-semibold">
                                        Click to upload
                                    </span>{' '}
                                    or drag and drop
                                </p>
                                <p className="text-xs text-zinc-500">
                                    PDF (up to 4MB)
                                </p>
                            </div>
                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className="flex max-w-xs items-center divide-x divide-zinc-200 overflow-hidden rounded-md bg-white outline outline-[1px] outline-zinc-200">
                                    <div className="grid h-full place-items-center px-3 py-2">
                                        <File className="size-4 text-blue-500" />
                                    </div>
                                    <div className="h-full truncate px-3 py-2 text-sm">
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}
                            {isUploading ? (
                                <div className="mx-auto mt-4 w-full max-w-xs">
                                    <Progress
                                        value={uploadProgress}
                                        max={100}
                                        indicatorColor={
                                            uploadProgress === 100
                                                ? 'bg-green-500'
                                                : ''
                                        }
                                        className="h-1 w-full bg-zinc-200"
                                    />
                                    {uploadProgress === 100 ? (
                                        <div className="flex items-center justify-center gap-1 pt-2 text-center text-sm text-zinc-700">
                                            <Loader2 className="size-3 animate-spin" />
                                            Redirecting...
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                            <input
                                {...getInputProps()}
                                type="file"
                                id="dropzone-file"
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}

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
            <DialogContent>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton
