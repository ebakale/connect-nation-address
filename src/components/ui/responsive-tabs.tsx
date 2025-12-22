import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface TabOption {
  value: string
  label: string
  icon?: React.ReactNode
  condition?: boolean
}

interface ResponsiveTabsListProps {
  tabs: TabOption[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

/**
 * ResponsiveTabsList - Shows a Select dropdown on mobile, horizontal tabs on desktop.
 * Use this instead of TabsList when you have many tabs that would cause horizontal scrolling.
 */
export function ResponsiveTabsList({ 
  tabs, 
  value, 
  onValueChange,
  className 
}: ResponsiveTabsListProps) {
  // Filter tabs by condition (default to true if not specified)
  const visibleTabs = tabs.filter(tab => tab.condition !== false)
  
  // Find current tab label for select display
  const currentTab = visibleTabs.find(tab => tab.value === value)

  return (
    <>
      {/* Mobile: Select dropdown */}
      <div className={cn("block sm:hidden w-full", className)}>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue>
              {currentTab && (
                <span className="flex items-center gap-2">
                  {currentTab.icon}
                  {currentTab.label}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-[300px]">
            {visibleTabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Horizontal tabs with wrapping */}
      <TabsList className={cn(
        "hidden sm:flex flex-wrap h-auto p-1 bg-muted/50 gap-1",
        className
      )}>
        {visibleTabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="text-xs sm:text-sm px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </>
  )
}
