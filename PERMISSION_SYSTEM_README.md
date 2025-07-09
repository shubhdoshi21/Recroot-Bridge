# Permission System Implementation

This document outlines the comprehensive permission management system implemented for the RecrootBridge application.

## Overview

The permission system provides granular access control based on roles and individual permissions. It supports:

- Role-based permissions (Administrator, Manager, Recruiter, User, Guest)
- Individual user permissions
- Permission checking middleware
- Frontend permission management UI
- Database persistence

## Architecture

### Backend Components

1. **Models** (`server/models/`)
   - `Permission.js` - Core permission entity
   - `UserPermission.js` - User-permission mapping

2. **Services** (`server/services/`)
   - `permissionService.js` - Business logic for permissions

3. **Controllers** (`server/controllers/`)
   - `permissionController.js` - HTTP request handlers

4. **Routes** (`server/routes/`)
   - `permissionRoutes.js` - API endpoints

5. **Middleware** (`server/middlewares/`)
   - `permissionMiddleware.js` - Permission checking middleware

### Frontend Components

1. **Services** (`client/services/`)
   - `permissionService.js` - API client for permissions

2. **Components** (`client/components/settings/`)
   - `permission-management.jsx` - Permission management UI

3. **Configuration** (`client/config/`)
   - `api.js` - API endpoint definitions

## Setup Instructions

### 1. Database Setup

The permission tables are already defined in the models. Ensure the database is synced:

```bash
# The tables will be created automatically when the server starts
npm run dev
```

### 2. Seed Default Permissions

Run the permission seeding script:

```bash
cd server
npm run seed:permissions
```

This will create all default permissions in the database.

### 3. Server Configuration

The permission routes are automatically registered in `server.js`. No additional configuration needed.

## API Endpoints

### Permission Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/permissions` | Get all permissions | Admin |
| GET | `/api/permissions/categories` | Get categorized permissions | Admin |
| GET | `/api/permissions/settings` | Get settings permissions | Admin |
| PUT | `/api/permissions/settings` | Update settings permissions | Admin |
| POST | `/api/permissions/seed` | Seed default permissions | Admin |

### Role-based Permissions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/permissions/role/:role` | Get permissions for role | Admin |
| PUT | `/api/permissions/role/:role` | Update role permissions | Admin |

### User Permissions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/permissions/user/:userId` | Get user permissions | Admin |
| GET | `/api/permissions/user/:userId/check/:permissionName` | Check user permission | Any |
| POST | `/api/permissions/user/:userId/grant` | Grant permission to user | Admin |
| DELETE | `/api/permissions/user/:userId/revoke/:permissionName` | Revoke user permission | Admin |

### Current User Permissions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/permissions/me` | Get current user permissions | Any |
| GET | `/api/permissions/me/check/:permissionName` | Check current user permission | Any |

## Permission Categories

The system includes permissions for the following categories:

### Dashboard
- `dashboard.view` - View dashboard
- `dashboard.edit_widgets` - Edit dashboard widgets
- `dashboard.view_analytics` - View analytics

### Candidates
- `candidates.view` - View candidates
- `candidates.create` - Create candidates
- `candidates.edit` - Edit candidates
- `candidates.delete` - Delete candidates
- `candidates.bulk_upload` - Bulk upload candidates

### Jobs
- `jobs.view` - View jobs
- `jobs.create` - Create jobs
- `jobs.edit` - Edit jobs
- `jobs.delete` - Delete jobs
- `jobs.publish` - Publish jobs

### Settings
- `settings.view` - View settings
- `settings.edit_system` - Edit system settings
- `settings.manage_users` - Manage users
- `settings.manage_integrations` - Manage integrations

### Companies
- `companies.view` - View companies
- `companies.create` - Create companies
- `companies.edit` - Edit companies
- `companies.delete` - Delete companies

### Recruiters
- `recruiters.view` - View recruiters
- `recruiters.create` - Create recruiters
- `recruiters.edit` - Edit recruiters
- `recruiters.delete` - Delete recruiters

### Teams
- `teams.view` - View teams
- `teams.create` - Create teams
- `teams.edit` - Edit teams
- `teams.delete` - Delete teams

### Documents
- `documents.view` - View documents
- `documents.create` - Create documents
- `documents.edit` - Edit documents
- `documents.delete` - Delete documents
- `documents.share` - Share documents

### Interviews
- `interviews.view` - View interviews
- `interviews.create` - Create interviews
- `interviews.edit` - Edit interviews
- `interviews.delete` - Delete interviews

### Communications
- `communications.view` - View communications
- `communications.create` - Create communications
- `communications.edit` - Edit communications

### Analytics
- `analytics.view` - View analytics
- `analytics.export` - Export analytics

### Onboarding
- `onboarding.view` - View onboarding
- `onboarding.create` - Create onboarding
- `onboarding.edit` - Edit onboarding
- `onboarding.delete` - Delete onboarding

## Role Hierarchy

The system uses a role hierarchy for permission inheritance:

1. **Guest** (Level 1) - Minimal access
2. **User** (Level 2) - Basic access
3. **Recruiter** (Level 3) - Recruiting operations
4. **Manager** (Level 4) - Management operations
5. **Administrator** (Level 5) - Full system access

## Usage Examples

### Backend Permission Checking

```javascript
// In route files
import { checkPermission, checkAnyPermission } from '../middlewares/permissionMiddleware.js';

// Check single permission
router.post('/candidates', 
  verifyToken, 
  checkPermission('candidates.create'), 
  createCandidate
);

// Check any of multiple permissions
router.get('/analytics', 
  verifyToken, 
  checkAnyPermission(['analytics.view', 'dashboard.view_analytics']), 
  getAnalytics
);

// Check all permissions
router.put('/settings', 
  verifyToken, 
  checkAllPermissions(['settings.view', 'settings.edit_system']), 
  updateSettings
);
```

### Frontend Permission Checking

```javascript
import { permissionService } from '../services/permissionService.js';

// Check current user's permission
const checkPermission = async (permissionName) => {
  try {
    const response = await permissionService.checkMyPermission(permissionName);
    return response.data.hasPermission;
  } catch (error) {
    console.log('Permission check failed:', error);
    return false;
  }
};

// Get user's permissions
const getUserPermissions = async () => {
  try {
    const response = await permissionService.getMyPermissions();
    return response.data;
  } catch (error) {
    console.log('Failed to get permissions:', error);
    return [];
  }
};
```

### Permission Management in Settings

The permission management UI is available in the Settings module under the "Access" tab. It allows administrators to:

- View permissions for each role
- Toggle individual permissions
- Reset permissions to defaults
- Save permission changes

## Database Schema

### Permissions Table
```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
);
```

### User Permissions Table
```sql
CREATE TABLE user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  permissionId INT NOT NULL,
  grantedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  grantedBy VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
);
```

## Security Considerations

1. **Authentication Required**: All permission endpoints require authentication
2. **Role-based Access**: Admin-only endpoints are protected by role middleware
3. **Permission Validation**: All permission names are validated against the database
4. **Audit Trail**: Permission grants/revokes are logged with timestamps and grantor information

## Testing

### Backend Testing

Test the permission endpoints:

```bash
# Test permission seeding
curl -X POST http://localhost:3001/api/permissions/seed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test getting permissions
curl -X GET http://localhost:3001/api/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test checking permission
curl -X GET http://localhost:3001/api/permissions/me/check/candidates.view \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. Navigate to Settings > Access
2. Test permission toggles
3. Verify permission changes are saved
4. Test role-based access restrictions

## Troubleshooting

### Common Issues

1. **Permission not found**: Ensure permissions are seeded in the database
2. **Access denied**: Check user role and individual permissions
3. **Database errors**: Verify database connection and table structure

### Debug Logging

The permission system includes comprehensive logging. Check server logs for:

- Permission check attempts
- Role validation
- Database operations
- Error details

## Future Enhancements

1. **Custom Roles**: Allow creation of custom roles with specific permission sets
2. **Permission Groups**: Group related permissions for easier management
3. **Temporary Permissions**: Time-limited permission grants
4. **Permission Analytics**: Track permission usage and access patterns
5. **Advanced Auditing**: Detailed audit logs for compliance

## Support

For issues or questions about the permission system:

1. Check the server logs for error details
2. Verify database connectivity and permissions
3. Test individual API endpoints
4. Review the permission hierarchy and role assignments 