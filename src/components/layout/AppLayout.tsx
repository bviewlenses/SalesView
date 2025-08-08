import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import BreadcrumbNav from './BreadcrumbNav';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  Bell,
  Search,
  Plus
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'distributor', 'retailer', 'sales']
  },
  {
    title: 'Lead Management',
    href: '/leads',
    icon: UserPlus,
    roles: ['admin', 'sales']
  },
  {
    title: 'Order Management',
    href: '/orders',
    icon: Package,
    badge: 'Soon',
    roles: ['admin', 'distributor', 'retailer']
  },
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'distributor']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'distributor', 'retailer', 'sales']
  }
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'Administrator',
      distributor: 'Distributor',
      retailer: 'Retailer',
      sales: 'Sales Staff'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      admin: 'default',
      distributor: 'secondary',
      retailer: 'outline',
      sales: 'destructive'
    };
    return variants[role as keyof typeof variants] || 'outline';
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const isActive = (href: string) => location.pathname === href;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">SalesView</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.email} alt={user.displayName} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <Badge variant={getRoleBadgeVariant(user.role) as any} className="text-xs">
              {getRoleDisplayName(user.role)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Button */}
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.email} alt={user.displayName} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <Badge variant={getRoleBadgeVariant(user.role) as any} className="w-fit text-xs">
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <BreadcrumbNav />
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;