import { useState } from "react";
import { 
  Shield, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Key, 
  Workflow, 
  LogOut,
  Crown,
  Hash
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminItems = [
  { title: "Users", id: "users", icon: Users },
  { title: "Roles", id: "roles", icon: Shield },
  { title: "Permissions", id: "permissions", icon: Key },
  { title: "Workflows", id: "workflows", icon: Workflow },
  { title: "UAC System", id: "uac", icon: Hash },
  { title: "Analytics", id: "analytics", icon: BarChart3 },
];

const ndaaItems = [
  { title: "API & Webhooks", id: "api-webhooks", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { hasNDAAAccess } = useUserRole();
  const [activeTab, setActiveTab] = useState("users");

  const allItems = hasNDAAAccess ? [...adminItems, ...ndaaItems] : adminItems;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <img 
              src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
              alt="BIAKAM Logo" 
              className="h-6 w-auto" 
            />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="font-semibold text-sm">
                {hasNDAAAccess ? 'NDAA Admin' : 'System Admin'}
              </h2>
              <p className="text-xs text-muted-foreground">ConnectEG Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {hasNDAAAccess ? 'National Administration' : 'System Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    className={activeTab === item.id ? "bg-primary text-primary-foreground" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="h-4 w-4" />
                  {state !== "collapsed" && <span>System Docs</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          {state !== "collapsed" && (
            <div className="text-xs text-muted-foreground">
              <p>ConnectEG Platform v2.1.0</p>
              <p>© 2025 BIAKAM</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {state !== "collapsed" && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}