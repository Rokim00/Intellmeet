import { Link } from "react-router-dom"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTheme } from "@/context/theme-context"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  TicketIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react"

export function NavUser({
  user,
  onOpenInviteModal,
  onLogout,
}: {
  user: {
    name: string
    email: string
    avatar?: string
  }
  onOpenInviteModal?: () => void
  onLogout: () => void
}) {
  const { theme, toggleTheme } = useTheme()
  const initials = user.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "U"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 border-none bg-transparent cursor-pointer"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-md shrink-0 border border-border group-data-[collapsible=icon]:mx-auto">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-foreground text-sm">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 mb-2 rounded-md bg-card border border-border text-card-foreground shadow-2xl p-1"
            side="top"
            align="start"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              {onOpenInviteModal && (
                <DropdownMenuItem onClick={onOpenInviteModal} className="cursor-pointer">
                  <TicketIcon size={14} className="text-emerald-400" />
                  <span>Workspace Invite Code</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem render={<Link to="/settings" className="w-full flex items-center gap-2" />}>
                <SettingsIcon size={14} className="text-zinc-400" />
                <span>Account & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <MoonIcon size={14} className="text-emerald-400" />
                  ) : (
                    <SunIcon size={14} className="text-amber-400" />
                  )}
                  <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-red-400 hover:text-red-300"
              >
                <LogOutIcon size={14} />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
