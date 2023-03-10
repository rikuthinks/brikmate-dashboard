import React, { useCallback, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useCredentials } from "@/context/credentials-context"
import { Bot, Loader2, Send, UploadCloud, User } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardNav } from "@/components/sidebar-nav"
import { dashboardConfig } from "@/config/sidebar"

const stats = [
  { name: 'Total Leases', stat: '1' },
  { name: 'Total Monthly Rent', stat: '$87,623' },
  { name: 'Security Deposits', stat: '$0' },
  { name: 'Total Liability', stat: '$0' },
]

export default function IndexPage({ }) {
  const [files, setFiles] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const credentials = useCredentials()

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])

  const handleUpload = useCallback(async () => {
    const formData = new FormData()
    formData.append("openai-api-key", credentials.openaiApiKey)
    formData.append("pinecone-api-key", credentials.pineconeApiKey)
    Array.from(files).forEach((file: File) => {
      formData.append("file", file)
    })

    setIsUploading(true)
    await fetch("/api/ingest", {
      method: "post",
      body: formData,
    })
    setIsUploading(false)
  }, [files, credentials])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
    },
    multiple: false,
    maxFiles: 1,
  })

  return (
    <Layout>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full grid md:grid-cols-[200px_1fr]">
        <aside className="ml-6 mt-2 hidden w-[200px] flex-col md:flex">
          <ScrollArea className="mt-4 pr-6">
            <DashboardNav items={dashboardConfig.sidebarNav} />
          </ScrollArea>
        </aside>
        <section className="container w-full flex flex-1 flex-col ">
          <div className="mt-6 flex flex-grow flex-col items-start gap-2 ">
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
              Overview
            </h2>
            <div className="mb-5 w-full">
              <dl className="grid grid-cols-1 gap-5 lg:grid-cols-5 xl:auto-cols-auto sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500 text-center">{item.name}</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 text-center">{item.stat}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex flex-grow flex-col items-start gap-2">
            <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
              Upload
            </h2>
            <div
              className="min-w-full rounded-md border border-slate-200 p-0 dark:border-slate-700"
              {...getRootProps()}
            >
              <div className="flex min-h-[150px] cursor-pointer items-center justify-center p-10">
                <input {...getInputProps()} />

                {files ? (
                  <p>{files[0].name}</p>
                ) : (
                  <>
                    {isDragActive ? (
                      <p>Drop the lease here ...</p>
                    ) : (
                      <p>
                        Drag and drop a lease
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="self-start">
              <Button
                disabled={
                  !files ||
                  isUploading ||
                  !credentials.openaiApiKey ||
                  !credentials.pineconeApiKey
                }
                onClick={handleUpload}
              >
                {!isUploading ? (
                  <UploadCloud className="mr-2 h-4 w-4" />
                ) : (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
