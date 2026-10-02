import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import App from './App'
import './index.css'

const queryClient = new QueryClient()

async function enableMocking() {
  try {
    const { worker } = await import('./mocks/browser')

    await worker.start({
      onUnhandledFrame: 'bypass',
    })
  } catch (error) {
    console.error('Failed to start MSW:', error)
  }
}

enableMocking()

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)