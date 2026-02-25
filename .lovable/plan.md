

# Aqui na Feira — Dev Hub (Updated Plan)

## Overview
An internal engineering control panel for the Aqui na Feira technical team. Built as a single-page application with a purple/green technical aesthetic, connecting to the existing backend API with JWT-based authentication and role-based access control.

---

## Pages & Features

### 1. Login Page
- JWT-based login form using the existing Aqui na Feira API
- After login, verify the user has a technical role (DEV / ADMIN_TECH); reject non-technical users with a clear message
- Persistent session with token storage
- Environment badge visible even on the login screen (DEV / STAGING / PROD)

### 2. Sidebar Navigation
- Fixed left sidebar with the Dev Hub branding ("Aqui na Feira — Dev Hub")
- Navigation items: Dashboard, Logs, API Tester, Notifications, Users & Roles, Integrations
- Environment indicator (colored badge: green for DEV, yellow for STAGING, red for PROD)
- User info at the bottom with logout button
- Collapsible on smaller screens

### 3. Technical Dashboard (Home)
- **API Health Panel**: Cards showing the status of key API endpoints (healthy/degraded/down) with response times and last-checked timestamps
- **Clear visual differentiation** between healthy (green), degraded (yellow), and down (red) states using distinct icons, colors, and labels
- **System Overview**: Quick stats — active users, API calls today, error rate, uptime
- **Average API response time** displayed prominently in the system overview section
- **Recent Activity Feed**: Last 10 system events at a glance
- **Environment Selector**: Switch between DEV / STAGING / PROD configurations (changes the API base URL)
- **Auto-refresh toggle**: Enable/disable auto-refresh (default: every 30 seconds) with a visible on/off control
- **"Last updated" timestamp** indicator always visible, showing when data was last fetched
- Manual refresh button

### 4. Logs Viewer
- Table of recent API/system logs with columns: timestamp, level (info/warn/error), service, message
- Color-coded log levels (green info, yellow warnings, red errors)
- Filters: by level, by service, by date range
- **Quick filter by requestId or correlationId** for fast trace navigation
- Search within log messages
- Auto-scroll to newest logs with pause button
- Click a log row to see full details in a side panel
- **Expandable structured metadata** in the detail panel: requestId, userId, endpoint, correlationId
- **Copy full log entry as JSON** button on each log row / detail panel
- **Download logs as JSON or CSV** (read-only export of currently filtered results)

### 5. API Endpoint Tester (Phase 2 — placeholder nav item)
- Marked as "Coming Soon" in the sidebar for now

### 6. Notification Simulator (Phase 2 — placeholder nav item)
- Marked as "Coming Soon" in the sidebar for now

### 7. Users & Roles Inspector (Phase 2 — placeholder nav item)
- Marked as "Coming Soon" in the sidebar for now

### 8. Integrations Monitor (Phase 2 — placeholder nav item)
- Marked as "Coming Soon" in the sidebar for now

---

## Design System

### Color Palette
- **Primary**: Purple tones (sidebar background, buttons, active states)
- **Accent/Success**: Green (health indicators, active badges, success states)
- **Warning**: Amber/Yellow
- **Error/Danger**: Red
- **Background**: Dark-tinted surfaces for the engineering tool feel
- **Text**: Light text on dark surfaces, high contrast

### Layout
- Fixed sidebar + scrollable main content area
- Card-based modular layout for dashboard widgets
- Tables with sorting, filtering, and pagination
- Monospace font for logs and technical data
- Clean spacing, minimal decorative elements

### Environment Indicators
- Persistent colored badge in the sidebar showing current environment — **must always remain visible in the UI**
- DEV = green badge, STAGING = yellow badge, PROD = red badge with caution styling
- **Persistent top-level warning banner when connected to PROD** with high-visibility styling (red/orange background, warning icon, always visible at the top of the page)

---

## Security

- Access restricted to technical roles only (DEV / ADMIN_TECH)
- Strong JWT-based authentication required
- Clear environment indicators (DEV, STAGING, PROD)
- Logging of sensitive technical actions
- Safeguards to prevent accidental production impact
- **Automatic logout when the JWT expires** — detect token expiration and redirect to login with an explanatory message
- **Token expiration warning** displayed before session timeout (e.g., a toast/banner warning the user 5 minutes before the token expires, with an option to re-authenticate)
- **Clear visual indication when the authentication token is invalid or expired** — show an error state and redirect to login rather than failing silently
- **Production environment warning banner** displayed prominently when connected to PROD (persistent, non-dismissible)
- **Prefer HTTP-only cookies for token storage** when supported by the backend; fall back to localStorage if necessary
- **If localStorage is used**, clearly document in the codebase and UI that the Dev Hub is restricted to internal technical users only (e.g., a notice on the login page)

---

## Operational Safeguards

- **Clear separation between read-only and mutation operations** — read-only actions (viewing logs, checking health) are always safe; mutation actions (triggering notifications, changing roles) are visually distinct and require confirmation
- **Confirmation dialogs required for any destructive or state-changing actions** — a modal with clear description of the action and its consequences before executing
- **Additional confirmation step for actions executed in the PROD environment** — a secondary "Are you sure? This will affect PRODUCTION" dialog with the environment name highlighted in red
- **Persistent top-level banner when connected to PROD** with high-visibility warning styling (cannot be dismissed)
- **Environment switching requires re-authentication** — switching environments forces a session reset and requires the user to log in again to prevent cross-environment confusion
- **Environment base URLs are predefined and not manually editable** — controlled via environment variables; users select from a fixed list, they cannot type in arbitrary URLs

---

## Environment Management

- Switching environments forces session reset and re-authentication
- Environment configurations are controlled via environment variables and cannot be manually edited by users
- Visual environment badge must always remain visible in the UI (sidebar + top banner for PROD)
- Environment selector available on the Dashboard page with the fixed list of predefined environments

---

## Technical Approach
- API base URL configurable per environment via environment variables
- JWT token stored securely (HTTP-only cookies preferred, localStorage as fallback with documentation)
- Token expiration monitoring with automatic logout and pre-expiry warnings
- Protected routes that redirect to login if no valid session
- All API calls go through a centralized HTTP client with error handling
- Mock/demo mode available when no real API is connected, so the UI can be previewed with sample data
- Modular page structure so Phase 2 features can be added independently
- Read-only vs. mutation operations clearly separated in the HTTP client layer

