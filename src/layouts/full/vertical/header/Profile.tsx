import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { useCurrentUser, useLogout } from '@/features/auth/hooks/useAuth'
import { formatImageUrl } from '@/utils/format'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Profile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useLogout()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const user = useCurrentUser()
  const avatarUrl = formatImageUrl(user?.avatarUrl)
  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout.mutateAsync()
    } catch {
      // Logout should still clear local auth state even if the backend request fails.
    } finally {
      setIsLoading(false)
      navigate({ to: '/login', replace: true })
    }
  }

  return (
    <div className="group/menu relative shrink-0 ps-1 sm:ps-15">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary group-hover/menu:bg-lightprimary group-hover/menu:text-primary flex cursor-pointer items-center justify-center rounded-full">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt="avatar"
                height="35"
                width="35"
                className="rounded-full"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <UserRound className="h-5 w-5" />
              </span>
            )}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-ld w-screen rounded-sm border pt-4 pb-6 shadow-none sm:w-50"
        >
          <DropdownMenuItem className="px-4 py-2 text-sm">
            {user?.displayName ?? user?.email ?? 'User'}
          </DropdownMenuItem>

          <div className="px-4 pt-2">
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-lightprimary hover:text-primary w-full rounded-md py-0"
            >
              {isLoading ? t('profile.loggingOut') : t('auth.logout')}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Profile
