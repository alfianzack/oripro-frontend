'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu } from '@/lib/api'
import { useMenus } from '@/hooks/useMenus'
import { ChevronRight, Loader2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface NavMainApiProps {
  className?: string
}

export default function NavMainApi({ className }: NavMainApiProps) {
  const pathname = usePathname()
  const { menus, loading } = useMenus()

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading menu...</span>
      </div>
    )
  }

  const renderMenuItem = (item: Menu, level = 0) => {
    const isActive = pathname === item.url
    const hasChildren = item.children && item.children.length > 0
    const isParentActive = hasChildren && item.children?.some(child => pathname === child.url)

    if (hasChildren) {
      return (
        <Collapsible key={item.id} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <Link
              href={item.url}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isParentActive && 'bg-accent text-accent-foreground',
                level > 0 && 'ml-4'
              )}
            >
              {item.icon && (
                <span className="text-lg">
                  {/* You can map icon names to actual icon components here */}
                  {item.icon}
                </span>
              )}
              <span className="flex-1">{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </Link>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-4 space-y-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.url}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground',
          level > 0 && 'ml-4'
        )}
      >
        {item.circle_color && (
          <div className={cn('h-2 w-2 rounded-full', item.circle_color)} />
        )}
        {item.icon && !item.circle_color && (
          <span className="text-lg">
            {/* You can map icon names to actual icon components here */}
            {item.icon}
          </span>
        )}
        <span className="flex-1">{item.title}</span>
      </Link>
    )
  }

  return (
    <nav className={cn('space-y-1', className)}>
      {menus.map(item => renderMenuItem(item))}
    </nav>
  )
}
