import {
  LayoutDashboard, ScrollText, Send, Bell, Users, Plug, LogOut, Terminal,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Logs", url: "/logs", icon: ScrollText },
];

const phase2Items = [
  { title: "API Tester", url: "/api-tester", icon: Send },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Users & Roles", url: "/users", icon: Users },
  { title: "Integrations", url: "/integrations", icon: Plug },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { environment } = useEnvironment();

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <Terminal className="h-6 w-6 text-primary" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-foreground truncate">Aqui na Feira</span>
          <span className="text-[10px] font-mono text-muted-foreground">DEV HUB</span>
        </div>
        <EnvironmentBadge environment={environment} className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-widest">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-widest">
            Phase 2
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase2Items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 text-muted-foreground border-border">Soon</Badge>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {user && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate font-mono">{user.role}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
