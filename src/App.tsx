import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import AppLayout from '@/components/layout/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Leads Management */}
          <Route 
            path="/leads" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LeadsDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for navigation */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold">Order Management</h2>
                    <p className="text-muted-foreground mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-muted-foreground mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold">Reports & Analytics</h2>
                    <p className="text-muted-foreground mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <p className="text-muted-foreground mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
