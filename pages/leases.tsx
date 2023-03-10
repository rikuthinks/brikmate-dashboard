import React from "react"
import Head from "next/head"

import { Layout } from "@/components/layout"
import Table from "@/components/table"
import { PrismaClient } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardNav } from "@/components/sidebar-nav"
import { dashboardConfig } from "@/config/sidebar"

const prisma = new PrismaClient()

export async function getServerSideProps() {

    const leases = await prisma.lease.findMany()

    return {
        props: {
            initialLeases: JSON.parse(JSON.stringify(leases)),
        },
    }
}

export default function LeasesPage({ initialLeases }) {

    return (
        <Layout>
            <Head>
                <title>Leases</title>
                <meta name="description" content="Manage leases" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="w-full grid md:grid-cols-[200px_1fr]">
                <aside className="ml-6 mt-2 hidden w-[200px] flex-col md:flex">
                    <ScrollArea className="mt-4 pr-6">
                        <DashboardNav items={dashboardConfig.sidebarNav} />
                    </ScrollArea>
                </aside>
                <section className="container flex justify-items-stretch gap-6 pt-6 pb-8">
                    <div className="flex flex-grow flex-col items-start gap-2 ">
                        <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
                            Leases
                        </h2>
                        <Table leases={initialLeases} />
                    </div>
                </section>
            </div>
        </Layout>
    )
}
