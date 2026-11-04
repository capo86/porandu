import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import AuthProvider from '@/features/auth/AuthProvider'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-serif-display/latin-400.css'
import '@fontsource/dm-serif-display/latin-400-italic.css'
import '@/index.css'

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><RouterProvider router={router} /></AuthProvider></StrictMode>)
