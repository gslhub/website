/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* Keep the Suspense boundary below: it prevents the Next.js admin document from
 * failing hydration before Payload has resolved its dynamic layout state. */

import config from '@payload-config'
import '@payloadcms/next/css'
import './admin-custom.css'

import {
  handleServerFunctions,
  RootLayout,
} from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React, { Suspense } from 'react'

import { importMap } from './admin/importMap'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = async ({ children }: Args) => (
  <Suspense fallback={null}>
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  </Suspense>
)

export default Layout
