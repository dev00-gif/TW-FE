import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import FullLayout from '../layouts/full/FullLayout'
import { getMe } from '@/features/auth/hooks/useAuth'

export const Route = createFileRoute('/_dashboard')({
  ssr: false,
  loader: async ({ context }) => {
    const user = await getMe(context.queryClient)
    if (!user) {
      throw redirect({
        to: '/login',
      })
    }
    if (!user.canAccessDashboard) {
      throw redirect({ to: '/' })
    }
    return user
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <FullLayout>
      <Outlet />
    </FullLayout>
  )
}
