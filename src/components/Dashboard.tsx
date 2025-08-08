import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all system users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Users</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Orders Overview</CardTitle>
                <CardDescription>View all orders across the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View All Orders</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Company-wide reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Reports</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'distributor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Retailers</CardTitle>
                <CardDescription>Manage retailers in your territory</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Retailers</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Territory Orders</CardTitle>
                <CardDescription>Orders from your retailers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Orders</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'retailer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Place New Order</CardTitle>
                <CardDescription>Create a new order</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">New Order</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>View your order history</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Orders</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'sales':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Manage your leads</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Leads</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>View your performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Performance</Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Your dashboard is being prepared</CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Spectacle Lens Management</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.displayName || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{getRoleDisplayName(user.role)}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {user.role === 'admin' && 'Manage your entire organization from here.'}
            {user.role === 'distributor' && 'Manage your territory and retailers.'}
            {user.role === 'retailer' && 'Manage your orders and inventory.'}
            {user.role === 'sales' && 'Track your leads and performance.'}
          </p>
        </div>

        {getDashboardContent()}
      </main>
    </div>
  );
};

export default Dashboard;