import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  {
    id: "kits",
    label: "Kit Management",
    icon: Package,
    submenu: [
      { id: "kits-robotics", label: "Robotics" },
      { id: "kits-cstem", label: "CSTEM" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
    submenu: [
      { id: "inventory-raw", label: "Raw Materials" },
      { id: "inventory-preprocessed", label: "Pre-processed" },
      { id: "inventory-finished", label: "Finished Goods" },
    ],
  },
  { id: "clients", label: "Client Management", icon: Users },
  { id: "assignments", label: "Kit Assignments", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { signOut, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["kits", "inventory"]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-[280px] bg-sidebar border-r border-sidebar-border elevation-2 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">Science Utsav</h1>
            <p className="text-sm text-sidebar-foreground/70">Inventory System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-12 px-4 ripple",
                activeSection === item.id && "bg-sidebar-primary text-sidebar-primary-foreground elevation-1"
              )}
              onClick={() => {
                if (item.submenu) {
                  toggleMenu(item.id);
                } else {
                  onSectionChange(item.id);
                }
              }}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.submenu && (
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    expandedMenus.includes(item.id) && "rotate-90"
                  )}
                />
              )}
            </Button>

            {/* Submenu */}
            <AnimatePresence>
              {item.submenu && expandedMenus.includes(item.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 mt-2 space-y-1 overflow-hidden"
                >
                  {item.submenu.map((subItem) => (
                    <Button
                      key={subItem.id}
                      variant={activeSection === subItem.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 px-4 text-sm ripple",
                        activeSection === subItem.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      onClick={() => onSectionChange(subItem.id)}
                    >
                      <div className="w-2 h-2 rounded-full bg-current mr-3 opacity-60" />
                      {subItem.label}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-sidebar-accent/50">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 ripple"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </motion.aside>
  );
}
