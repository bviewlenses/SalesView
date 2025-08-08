# Firebase Authentication Specification
## Simplified Role-Based Access Control

---

## Overview

**Authentication Method**: Firebase Authentication with Email/Password  
**Authorization**: Firebase Custom Claims + Firestore Security Rules  
**Session Management**: Firebase Auth State Persistence  
**User Roles**: Admin, Distributor, Retailer, Sales Staff  

---

## 1. User Roles & Permissions

### 1.1 Role Hierarchy
```
Admin (Company Level)
├── Sales Staff (Lead Management)
├── Distributor (Territory Level)
└── Retailer (Store Level)
```

### 1.2 Role Definitions

#### **Admin**
- **Access Level**: Company-wide
- **Key Permissions**:
  - Manage all users (create, update, deactivate)
  - View all orders across distributors/retailers
  - Approve/reject all orders
  - View all reports and analytics
  - Manage system settings
  - Onboard new distributors

#### **Distributor** 
- **Access Level**: Territory/Region-based
- **Key Permissions**:
  - Manage assigned retailers
  - View/approve orders from assigned retailers
  - View territory-specific reports
  - Onboard new retailers in territory
  - Cannot access other distributor data

#### **Retailer**
- **Access Level**: Store-specific
- **Key Permissions**:
  - Create and manage own orders
  - View own order history
  - Update store profile
  - Cannot access other retailer data

#### **Sales Staff**
- **Access Level**: Lead management focused
- **Key Permissions**:
  - Manage leads (create, update, visit scheduling)
  - Onboard qualified leads as retailers
  - View own performance dashboard
  - Cannot access order management

---

## 2. Firebase Authentication Setup

### 2.1 User Creation Flow
```
1. Admin creates user → Firebase Auth account created
2. Custom claims assigned → Role and access level set
3. User profile created → Firestore user document
4. Email sent → User receives login credentials
```

### 2.2 Login Credentials Format
- **Email Format**: `{userId}@{company}.com`
- **Examples**:
  - `admin001@spectacles.com`
  - `dist_north_01@spectacles.com` 
  - `ret_del_001@spectacles.com`
  - `sales_001@spectacles.com`

### 2.3 Custom Claims Structure
```javascript
{
  role: "admin" | "distributor" | "retailer" | "sales",
  companyId: "company_123",
  distributorId: "dist_456", // if distributor or retailer under distributor
  territoryId: "north_region", // if distributor/sales
  storeId: "store_789", // if retailer
  permissions: [
    "orders:read",
    "orders:create", 
    "orders:approve",
    "users:manage",
    "reports:view"
  ]
}
```

---

## 3. Firestore Database Structure

### 3.1 Collections Overview
```
/companies/{companyId}
  /users/{userId}
  /orders/{orderId}
  /leads/{leadId}
  /notifications/{notificationId}

/distributors/{distributorId}
  /retailers/{retailerId}

/territories/{territoryId}
```

### 3.2 User Document Structure
```javascript
// /companies/{companyId}/users/{userId}
{
  uid: "firebase_auth_uid",
  userId: "admin001", // login identifier
  email: "admin001@spectacles.com",
  displayName: "John Admin",
  phone: "+919876543210",
  
  // Role Information
  role: "admin",
  companyId: "company_123",
  distributorId: null, // if under distributor
  territoryId: null, // if territory-based
  storeId: null, // if retailer
  
  // Status
  isActive: true,
  isEmailVerified: true,
  lastLogin: "2024-01-15T10:30:00Z",
  
  // Audit
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin_user_id",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

---

## 4. Security Rules

### 4.1 User Access Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Company-level access
    match /companies/{companyId}/users/{userId} {
      allow read, write: if isAdmin(resource, request.auth) || 
                            isOwner(userId, request.auth);
    }
    
    // Orders access
    match /companies/{companyId}/orders/{orderId} {
      allow read, write: if isAdmin(resource, request.auth) ||
                            canAccessOrder(resource, request.auth);
    }
    
    // Distributor-specific data
    match /distributors/{distributorId}/retailers/{retailerId} {
      allow read, write: if isAdmin(resource, request.auth) ||
                            isDistributorOwner(distributorId, request.auth);
    }
  }
  
  // Helper functions
  function isAdmin(resource, auth) {
    return auth != null && auth.token.role == 'admin';
  }
  
  function isOwner(userId, auth) {
    return auth != null && auth.uid == userId;
  }
  
  function canAccessOrder(resource, auth) {
    return auth != null && 
           (auth.token.role == 'retailer' && resource.data.retailerId == auth.token.storeId) ||
           (auth.token.role == 'distributor' && resource.data.distributorId == auth.token.distributorId);
  }
}
```

### 4.2 Data Access Matrix

| Role | Own Data | Same Level | Sub Level | Parent Level |
|------|----------|------------|-----------|--------------|
| **Admin** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write | ❌ N/A |
| **Distributor** | ✅ Read/Write | ❌ No Access | ✅ Read/Write (Retailers) | ❌ No Access |
| **Retailer** | ✅ Read/Write | ❌ No Access | ❌ N/A | ✅ Read Only (Distributor) |
| **Sales Staff** | ✅ Read/Write | ❌ No Access | ✅ Read/Write (Leads) | ❌ No Access |

---

## 5. Authentication Implementation

### 5.1 Login Flow
```javascript
// 1. User enters credentials
const { email, password } = loginForm;

// 2. Firebase authentication
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// 3. Get custom claims
const idTokenResult = await user.getIdTokenResult();
const { role, companyId, distributorId, territoryId, storeId } = idTokenResult.claims;

// 4. Store user context
const userContext = {
  uid: user.uid,
  email: user.email,
  role,
  companyId,
  distributorId,
  territoryId,
  storeId,
  permissions: idTokenResult.claims.permissions || []
};

// 5. Redirect based on role
redirectToDashboard(role);
```

### 5.2 Route Protection
```javascript
// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, requiredPermissions }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDenied />;
  }
  
  if (requiredPermissions && !hasPermissions(user.permissions, requiredPermissions)) {
    return <AccessDenied />;
  }
  
  return children;
};
```

### 5.3 Data Filtering Hook
```javascript
// Custom hook for role-based data filtering
const useDataAccess = () => {
  const { user } = useAuth();
  
  const getOrdersQuery = () => {
    const baseRef = collection(db, 'companies', user.companyId, 'orders');
    
    switch (user.role) {
      case 'admin':
        return baseRef; // No filtering
        
      case 'distributor':
        return query(baseRef, where('distributorId', '==', user.distributorId));
        
      case 'retailer':
        return query(baseRef, where('retailerId', '==', user.storeId));
        
      default:
        return query(baseRef, where('id', '==', 'non-existent')); // Empty result
    }
  };
  
  return { getOrdersQuery };
};
```

---

## 6. User Management

### 6.1 User Creation (Admin Only)
```javascript
const createUser = async (userData) => {
  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    userData.email, 
    userData.password
  );
  
  // 2. Set custom claims
  await setCustomUserClaims(userCredential.user.uid, {
    role: userData.role,
    companyId: userData.companyId,
    distributorId: userData.distributorId,
    territoryId: userData.territoryId,
    storeId: userData.storeId,
    permissions: getRolePermissions(userData.role)
  });
  
  // 3. Create user profile in Firestore
  await setDoc(doc(db, 'companies', userData.companyId, 'users', userCredential.user.uid), {
    ...userData,
    uid: userCredential.user.uid,
    createdAt: serverTimestamp()
  });
};
```

### 6.2 Role-Based Permissions
```javascript
const getRolePermissions = (role) => {
  const permissions = {
    admin: [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'orders:read', 'orders:approve', 'orders:reject',
      'reports:view', 'system:configure'
    ],
    distributor: [
      'users:create', 'users:read', 'users:update', // only retailers
      'orders:read', 'orders:approve', 'orders:reject', // territory only
      'reports:view' // territory only
    ],
    retailer: [
      'orders:create', 'orders:read', 'orders:update', // own only
      'profile:update'
    ],
    sales: [
      'leads:create', 'leads:read', 'leads:update',
      'visits:schedule', 'visits:checkin',
      'onboarding:initiate'
    ]
  };
  
  return permissions[role] || [];
};
```

---

## 7. Implementation Phases

### Phase 1: Basic Authentication ✅
- [x] Firebase project setup
- [ ] Login/logout functionality
- [ ] User session management
- [ ] Basic route protection

### Phase 2: Role-Based Access
- [ ] Custom claims implementation
- [ ] Firestore security rules
- [ ] Data filtering by role
- [ ] Permission-based UI components

### Phase 3: User Management
- [ ] Admin user creation interface
- [ ] Role assignment functionality
- [ ] User profile management
- [ ] Account activation/deactivation

### Phase 4: Advanced Features
- [ ] Audit logging
- [ ] Session timeout handling
- [ ] Password reset flow
- [ ] Email verification

---

## 8. Frontend Route Structure

### 8.1 Route Mapping
```
Public Routes:
  /login
  /forgot-password

Protected Routes:
  /dashboard (role-based content)
  
Admin Only:
  /users
  /distributors
  /system-settings
  
Distributor Only:
  /my-retailers
  /territory-reports
  
Retailer Only:
  /orders
  /my-orders
  
Sales Staff Only:
  /leads
  /visits
  /performance
  
Shared (filtered by role):
  /orders (different data based on role)
  /reports (different scope based on role)
  /profile
```

### 8.2 Navigation Menu (Role-Based)
```javascript
const getNavigationItems = (userRole) => {
  const navigation = {
    admin: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Users', path: '/users' },
      { name: 'Orders', path: '/orders' },
      { name: 'Reports', path: '/reports' },
      { name: 'Settings', path: '/settings' }
    ],
    distributor: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'My Retailers', path: '/my-retailers' },
      { name: 'Orders', path: '/orders' },
      { name: 'Reports', path: '/reports' }
    ],
    retailer: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Orders', path: '/orders' },
      { name: 'Place Order', path: '/orders/new' },
      { name: 'Profile', path: '/profile' }
    ],
    sales: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Leads', path: '/leads' },
      { name: 'Visits', path: '/visits' },
      { name: 'Performance', path: '/performance' }
    ]
  };
  
  return navigation[userRole] || [];
};
```

---

## Next Steps

1. **Firebase Project Setup**
   - Create Firebase project
   - Enable Authentication
   - Configure Firestore
   - Set up Security Rules

2. **Frontend Implementation**
   - Install Firebase SDK
   - Create auth context
   - Implement login/logout
   - Add route protection

3. **User Management System**
   - Admin interface for user creation
   - Role assignment functionality
   - Custom claims management

4. **Testing & Security**
   - Test role-based access
   - Validate security rules
   - Performance testing

Ready to start implementing? We can begin with Firebase project setup and basic authentication flow.