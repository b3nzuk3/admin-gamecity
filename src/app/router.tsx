import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { AdminRoutes } from './adminRoutes'

export function AppRouter() {
  return <BrowserRouter><AuthProvider><AdminRoutes /></AuthProvider></BrowserRouter>
}
