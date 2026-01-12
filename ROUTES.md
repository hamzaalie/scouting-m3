# Route Structure Documentation

Complete route hierarchy for the Sports Scouting Platform.

## Route Overview

```
Route hierarchy:

Public Routes:
├── / → Redirect to /login or dashboard based on auth
├── /login → LoginPage
├── /register → RegisterPage
└── /forgot-password → ForgotPasswordPage (to be built)

Admin Routes (role: admin):
├── /admin → AdminDashboard
├── /admin/players → PlayerListPage
├── /admin/teams → TeamListPage
├── /admin/matches → MatchListPage
├── /admin/users → UserManagementPage
├── /admin/settings → SettingsPage
└── /admin/profile → ProfilePage

Player Routes (role: player):
├── /player → PlayerDashboard
├── /player/profile → PlayerProfile
├── /player/settings → PlayerSettings
├── /player/matches → PlayerMatches (to be built in M3)
└── /player/highlights → PlayerHighlights (to be built in M3)

Scout Routes (role: scout):
├── /scout → ScoutDashboard (player discovery)
├── /scout/profile → ScoutProfile
├── /scout/settings → ScoutSettings
├── /scout/players/:id → PlayerDetailPage (to be built in M3)
└── /scout/favorites → FavoritesPage (optional, future)

Error Routes:
├── /403 → AccessDeniedPage
├── /404 → NotFoundPage
└── /500 → ServerErrorPage
```

## Route Details

### Public Routes

These routes are accessible without authentication. If a user is already authenticated, they will be redirected to their role-based dashboard.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | RoleBasedRedirect | Redirects to `/login` if not authenticated, or to role-based dashboard if authenticated |
| `/login` | LoginPage | User login form |
| `/register` | RegisterPage | User registration form |
| `/forgot-password` | ForgotPasswordPage | Password reset request (to be built) |

### Admin Routes

Requires `role: 'admin'`. All admin routes are protected with `ProtectedRoute allowedRoles={['admin']}`.

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/admin` | AdminDashboard | ✅ Complete | Main admin dashboard with overview |
| `/admin/players` | PlayersPage | ✅ Placeholder | Manage all players in the system |
| `/admin/teams` | TeamsPage | ✅ Placeholder | Manage teams and rosters |
| `/admin/matches` | MatchesPage | ✅ Placeholder | Schedule and manage matches |
| `/admin/users` | UsersPage | ✅ Placeholder | User management |
| `/admin/settings` | SettingsPage | ✅ Placeholder | Platform settings |
| `/admin/profile` | ProfilePage | ✅ Placeholder | Admin profile page |

**Future Routes (to be built):**
- `/admin/stats` → StatsPage (Module 3)

### Player Routes

Requires `role: 'player'`. All player routes are protected with `ProtectedRoute allowedRoles={['player']}`.

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/player` | PlayerDashboard | ✅ Complete | Player performance dashboard |
| `/player/profile` | PlayerProfilePage | ✅ Placeholder | Player profile management |
| `/player/settings` | PlayerSettingsPage | ✅ Placeholder | Account settings |

**Future Routes (to be built):**
- `/player/matches` → PlayerMatches (Module 3)
- `/player/highlights` → PlayerHighlights (Module 3)

### Scout Routes

Requires `role: 'scout'`. All scout routes are protected with `ProtectedRoute allowedRoles={['scout']}`.

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/scout` | ScoutDashboard | ✅ Complete | Player discovery dashboard |
| `/scout/profile` | ScoutProfilePage | ✅ Placeholder | Scout profile |
| `/scout/settings` | ScoutSettingsPage | ✅ Placeholder | Account settings |

**Future Routes (to be built):**
- `/scout/players/:id` → PlayerDetailPage (Module 3)
- `/scout/favorites` → FavoritesPage (Optional, future)

### Error Routes

These routes don't require authentication and are used for error handling.

| Route | Component | Description |
|-------|-----------|-------------|
| `/403` | AccessDeniedPage | Access denied - user doesn't have required role |
| `/404` | NotFoundPage | Page not found |
| `/500` | ServerErrorPage | Server error occurred |

## Route Protection

### ProtectedRoute Component

All protected routes use the `ProtectedRoute` component with the following security checks:

1. **Authentication Check**: Verifies user is logged in
2. **Token Expiration**: Checks if JWT token is still valid
3. **Role Authorization**: Verifies user has required role(s)

**Usage:**
```tsx
// Require any authenticated user
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require specific role
<ProtectedRoute allowedRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

// Require multiple roles (admin OR scout)
<ProtectedRoute allowedRoles={['admin', 'scout']}>
  <ManagementPanel />
</ProtectedRoute>
```

### Security Features

- ✅ Automatic redirect to `/login` if not authenticated
- ✅ Preserves intended destination URL (redirects back after login)
- ✅ Automatic redirect to `/403` if wrong role
- ✅ Token expiration handling
- ✅ Loading state during auth checks

## Navigation Flow

### Unauthenticated User
1. Accesses protected route → Redirected to `/login`
2. Logs in → Redirected back to intended destination

### Authenticated User (Wrong Role)
1. Accesses route requiring different role → Redirected to `/403`
2. Can navigate back or go to dashboard

### Authenticated User (Correct Role)
1. Accesses route → Content rendered
2. All security checks pass

## Future Routes (Planned)

### Module 2 (Data Management)
- `/admin/players/:id` - Player detail/edit
- `/admin/matches/:id` - Match detail/edit
- `/admin/teams/:id` - Team detail/edit

### Module 3 (Advanced Features)
- `/admin/stats` - Statistics dashboard
- `/player/matches` - Player's match history
- `/player/highlights` - Player highlights/videos
- `/scout/players/:id` - Player detail for scouts
- `/scout/favorites` - Favorite players

