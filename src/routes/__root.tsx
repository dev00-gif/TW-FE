import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import '@/config/i18n'

import { ThemeProvider } from '@/components/provider/ThemeProvider'
import { AuthBootstrapProvider } from '@/features/auth/context/AuthBootstrapProvider'
import { APP_INFO } from '@/config/appInfo'

import appCss from '../styles.css?url'

import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var storageKey='vite-ui-theme';var theme=window.localStorage.getItem(storageKey)||'light';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=theme==='system'?(prefersDark?'dark':'light'):theme;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(theme==='system'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',theme)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SOMICS Admin',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/jpeg',
        href: APP_INFO.FAVICON,
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <AuthBootstrapProvider>
      <Outlet />
    </AuthBootstrapProvider>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="antialiased wrap-anywhere">
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
        <GooeyToaster position="top-center" />
        <Scripts />
      </body>
    </html>
  )
}
