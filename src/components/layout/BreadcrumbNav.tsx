import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface RouteConfig {
  path: string;
  label: string;
  parent?: string;
}

const routeConfig: RouteConfig[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/leads', label: 'Lead Management', parent: '/dashboard' },
  { path: '/leads/add', label: 'Add New Lead', parent: '/leads' },
  { path: '/orders', label: 'Order Management', parent: '/dashboard' },
  { path: '/orders/new', label: 'New Order', parent: '/orders' },
  { path: '/users', label: 'User Management', parent: '/dashboard' },
  { path: '/users/add', label: 'Add User', parent: '/users' },
  { path: '/reports', label: 'Reports', parent: '/dashboard' },
  { path: '/settings', label: 'Settings', parent: '/dashboard' },
];

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show breadcrumbs on login page or if no user
  if (!user || location.pathname === '/login') {
    return null;
  }

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const currentPath = location.pathname;
    
    // Find current route config
    const currentRoute = routeConfig.find(route => route.path === currentPath);
    
    if (!currentRoute) {
      // Fallback for unknown routes
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Page', current: true }
      ];
    }

    // Build breadcrumb chain
    const buildChain = (route: RouteConfig): BreadcrumbItem[] => {
      const items: BreadcrumbItem[] = [];
      
      if (route.parent) {
        const parentRoute = routeConfig.find(r => r.path === route.parent);
        if (parentRoute) {
          items.push(...buildChain(parentRoute));
        }
      }
      
      items.push({
        label: route.label,
        href: route.path === currentPath ? undefined : route.path,
        current: route.path === currentPath
      });
      
      return items;
    };

    return buildChain(currentRoute);
  };

  const breadcrumbItems = buildBreadcrumbs();
  
  // Don't show if only one item (just current page)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  // If more than 3 items, show ellipsis
  const showEllipsis = breadcrumbItems.length > 3;
  const displayItems = showEllipsis 
    ? [breadcrumbItems[0], ...breadcrumbItems.slice(-2)]
    : breadcrumbItems;

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {showEllipsis && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={breadcrumbItems[0].href || '#'}>
                    {breadcrumbItems[0].label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    <BreadcrumbEllipsis className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {breadcrumbItems.slice(1, -2).map((item, index) => (
                      <DropdownMenuItem key={index}>
                        {item.href ? (
                          <Link to={item.href}>{item.label}</Link>
                        ) : (
                          item.label
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          {displayItems
            .slice(showEllipsis ? 1 : 0)
            .map((item, index, array) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.current ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href || '#'}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < array.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNav;