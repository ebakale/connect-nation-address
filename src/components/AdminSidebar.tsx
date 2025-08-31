import { useState } from "react";
import { 
  Users, Shield, Settings, BarChart3, FileText, 
  Database, Map, CheckCircle, AlertTriangle, 
  Globe, Crown, User, LogOut, Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { isAdmin, hasAdminAccess } = useUserRole();

  const adminItems = [
    { 
      id: "overview", 
      title: "Overview", 
      icon: Home, 
      description: "Dashboard overview"
    },
    { 
      id: "users", 
      title: "User Management", 
      icon: Users, 
      description: "Manage users and accounts"
    },
    { 
      id: "roles", 
      title: "Role Management", 
      icon: Shield, 
      description: "Assign and manage roles"
    },
    { 
      id: "addresses", 
      title: "Address System", 
      icon: Map, 
      description: "Address management"
    },
    { 
      id: "verification", 
      title: "Verification Queue", 
      icon: CheckCircle, 
      description: "Pending verifications"
    },
    { 
      id: "approvals", 
      title: "Approval Queue", 
      icon: AlertTriangle, 
      description: "Pending approvals"
    },
    { 
      id: "analytics", 
      title: "Analytics", 
      icon: BarChart3, 
      description: "System analytics"
    },
    { 
      id: "provinces", 
      title: "Province Management", 
      icon: Globe, 
      description: "Manage provinces"
    },
    { 
      id: "system", 
      title: "System Settings", 
      icon: Settings, 
      description: "System configuration"
    },
    { 
      id: "documentation", 
      title: "Documentation", 
      icon: FileText, 
      description: "Generate documentation"
    }
  ];

  const isActive = (id: string) => activeSection === id;
  const getNavCls = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Admin Portal</h2>
              <p className="text-xs text-muted-foreground">System Management</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.id)}
                    className={getNavCls(isActive(item.id))}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="w-8 h-8 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}