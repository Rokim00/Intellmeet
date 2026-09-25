import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRightIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()
  const { isMobile, state, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isCurrentActive = (url: string) => {
    if (url.includes("?")) {
      const [path, search] = url.split("?")
      return location.pathname === path && location.search.toLowerCase().includes(search.toLowerCase())
    }
    if (url === "/projects") {
      return location.pathname === "/projects" && (!location.search || !location.search.includes("status="))
    }
    if (url === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return location.pathname === url
  }

  return (
    <SidebarGroup className="px-2 py-2">
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isItemDirectlyActive = isCurrentActive(item.url)
          const itemHasActiveChild = item.items?.some((sub) => isCurrentActive(sub.url))

          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isItemDirectlyActive}
                  render={<Link to={item.url} onClick={handleNavClick} />}
                >
                  {item.icon}
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          if (isCollapsed) {
            return (
              <SidebarMenuItem key={item.title} className="w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <SidebarMenuButton tooltip={item.title} isActive={isItemDirectlyActive && !itemHasActiveChild}>
                      {item.icon}
                    </SidebarMenuButton>
                  } />
                  <DropdownMenuContent side="right" align="start" className="w-48 bg-card border-border shadow-xl ml-4">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.title}</div>
                    {item.items?.map((subItem) => {
                      const isSubActive = isCurrentActive(subItem.url)
                      return (
                        <DropdownMenuItem key={subItem.title} render={
                          <Link 
                            to={subItem.url} 
                            onClick={handleNavClick}
                            className={`w-full cursor-pointer ${isSubActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}
                          >
                            {subItem.title}
                          </Link>
                        } />
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isItemDirectlyActive || itemHasActiveChild || item.isActive}
              className="group/collapsible w-full"
            >
              <SidebarMenuItem className="w-full">
                <CollapsibleTrigger
                  className="w-full"
                  render={
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isItemDirectlyActive && !itemHasActiveChild}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  }
                />
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = isCurrentActive(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={isSubActive}
                            render={
                              <Link to={subItem.url} onClick={handleNavClick} className="flex w-full items-center">
                                <span>{subItem.title}</span>
                              </Link>
                            }
                          />
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
