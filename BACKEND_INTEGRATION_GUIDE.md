# Backend Integration Guide

This document outlines the changes made to prepare the frontend for backend integration with:
- **API 1 (api-maratoons)**: User management, betting, groups - Node.js/Express + MongoDB
- **API 2 (api-scoring)**: Race management, scoring, results - Symfony/PHP + Database

## Summary of Changes

The frontend has been updated to align with both backend API structures. All changes maintain backward compatibility with the mock API while preparing for real backend integration.

## Key Differences: Frontend vs Backend

### 1. Authentication Endpoints
- **Frontend (old)**: `/auth/login`, `/auth/register`
- **Backend (new)**: `/api/users/login`, `/api/users/register`

### 2. Login Response Format
- **Frontend expected**: `{ user, token }`
- **Backend returns**: `{ token }` only (user data must be decoded from JWT or fetched separately)

### 3. Terminology Changes
- **Frontend uses**: `points` (betting value)
- **Backend uses**:
  - `solde` (user's balance/wallet)
  - `cote` (odds/multiplier for bets)

### 4. Group Endpoints
- **Frontend (old)**: `/group/{id}`, `/group/{id}/join`, `/group/{id}/ban`
- **Backend (new)**: `/api/groups/{id}`, `/api/groups/join/{code}`, `/api/groups/{id}/ban`

### 5. Ban Endpoint Body
- **Frontend**: `{ userId }`
- **Backend**: `{ userToBan }`

## Files Modified

### 1. `src/services/api.ts`
**Changes**:
- Updated `groupService` endpoints to use `/api/groups/*` format
- Added `getAllGroups()`, `createGroup(name)` methods
- Updated `joinGroup()` to accept code instead of groupId
- Updated `banMember()` to use `userToBan` parameter
- Expanded `betService` with backend CRUD operations
- Added new `userBetService` for user-specific bet operations
- Added new `userService` for user management

**New Services Exported**:
```typescript
// User-specific bets (requires auth)
userBetService.getMyBets()
userBetService.createMyBet({ bet_id, solde, position_runner })
userBetService.deleteMyBet(betId)

// User management
userService.getAllUsers()
userService.getUserById(userId)
userService.updateUser(userId, userData)
userService.deleteUser(userId)

// Bet management
betService.getAllBets()
betService.getBetsByRace(raceId)
betService.getBetsByRunner(runnerId)
betService.getBetById(betId)
betService.createBet({ bet_id, solde, position_runner })
betService.updateBet(betId, betData)
betService.deleteBet(betId)

// Group management (updated)
groupService.getAllGroups()
groupService.getGroupMembers(groupId)
groupService.createGroup(name)
groupService.joinGroup(code)  // Now takes code, not groupId
groupService.leaveGroup(groupId)
groupService.banMember(groupId, userToBan)  // Now uses userToBan
```

### 2. `src/services/auth.ts`
**Changes**:
- Updated login endpoint: `/auth/login` → `/api/users/login`
- Updated register endpoint: `/auth/register` → `/api/users/register`
- Added JWT token decoding to extract user info from token
- Login now handles backend's token-only response format
- Import and use `transformBackendUser()` from dataTransform

**New Methods**:
```typescript
authService.decodeToken(token) // Decode JWT to extract user data
```

### 3. `src/services/dataTransform.ts` (NEW FILE)
**Purpose**: Provides transformation functions to map between frontend and backend data models.

**Key Functions**:
```typescript
// Transform backend data to frontend models
transformBackendUser(backendUser) → User
transformBackendBet(backendBet) → Bet
transformBackendRunner(backendRunner) → Runner
transformBackendGroupMember(backendMember, groupId) → GroupMember

// Transform frontend data to backend format
transformFrontendBetToBackend(betId, soldeAmount, positionRunner)
  → { bet_id, solde, position_runner }

// Utility functions
calculatePotentialWinnings(betAmount, odds) → number
transformSoldeToPoints(solde) → number  // Backend → Frontend
transformPointsToSolde(points) → number  // Frontend → Backend

// Batch transformations
transformBackendUsers(backendUsers[]) → User[]
transformBackendBets(backendBets[]) → Bet[]
transformBackendRunners(backendRunners[]) → Runner[]
```

**Usage Example**:
```typescript
import { transformBackendUser, transformFrontendBetToBackend } from '@/services/dataTransform';

// When receiving user data from backend
const frontendUser = transformBackendUser(backendUserData);

// When sending bet data to backend
const backendBetData = transformFrontendBetToBackend(betId, 100, 1);
// Returns: { bet_id: betId, solde: 100, position_runner: 1 }
```

### 4. `src/services/mockAdapter.ts`
**Changes**:
- Added backend-style endpoints alongside old endpoints for compatibility
- Login now returns `{ token }` only (with user data encoded in token)
- Added `/api/users/*` endpoints (GET all, GET by ID, user bets)
- Added `/api/groups/*` endpoints (GET all, GET members, create, join by code, leave, ban)
- Added `/api/bets/*` endpoints (GET all, GET by race, GET by runner, create)
- Ban endpoint now accepts `userToBan` field
- Old routes maintained for backward compatibility

### 5. `src/types/index.ts`
**Changes**:
- Added backend-specific TypeScript interfaces:
  - `BackendUser` - uses `solde` field
  - `BackendBet` - uses `solde` and `cote` fields
  - `BackendUserBetResponse` - includes `gains_potentiels`
  - `BackendGroup` - includes `code` field
  - `BackendRunner` - uses `cote` for odds
  - `BackendLoginResponse` - token only
  - `BackendRegisterResponse` - user + token

## Backend API Routes Reference

### User Routes (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | No | Register new user |
| POST | `/api/users/login` | No | Login (returns `{ token }`) |
| GET | `/api/users` | No | Get all users |
| GET | `/api/users/:id` | No | Get user by ID |
| PUT | `/api/users/:id` | Yes | Update user |
| DELETE | `/api/users/:id` | Yes | Delete user |
| GET | `/api/users/me/bets` | Yes | Get current user's bets |
| POST | `/api/users/me/bets` | Yes | Create bet for current user |
| DELETE | `/api/users/me/bets/:betId` | Yes | Delete user's bet |

### Group Routes (`/api/groups`) - All require auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/groups` | Yes | Get all groups |
| GET | `/api/groups/:id` | Yes | Get all users in group |
| POST | `/api/groups/create` | Yes | Create group (body: `{ name }`) |
| POST | `/api/groups/join/:code` | Yes | Join group by code |
| POST | `/api/groups/:id/leave` | Yes | Leave group |
| POST | `/api/groups/:id/ban` | Yes | Ban user (body: `{ userToBan }`) |

### Bet Routes (`/api/bets`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bets` | No | Get all bets |
| GET | `/api/bets/race/:raceId` | No | Get bets for a race |
| GET | `/api/bets/runner/:runnerId` | No | Get bets for a runner |
| GET | `/api/bets/:id` | No | Get bet by ID |
| POST | `/api/bets` | No | Create bet |
| PUT | `/api/bets/:id` | No | Update bet |
| DELETE | `/api/bets/:id` | No | Delete bet |

## How to Switch from Mock to Real Backend

### Step 1: Update Environment Variables
In your `.env` file:
```env
# Change this to false to use real backend
VITE_USE_MOCK=false

# Point to your backend URL
VITE_API_1_URL=http://localhost:3000
```

### Step 2: Ensure Backend is Running
```bash
cd D:\PROJETS YNOV\api-maratoons
npm install
npm start
```

### Step 3: Test Authentication
The login flow will now:
1. POST to `/api/users/login` with `{ email, password }`
2. Receive `{ token }` response
3. Decode JWT to extract user info
4. Store token and user data in localStorage

### Step 4: Test Betting Flow
When placing a bet:
1. Frontend transforms `points` to `solde` using `transformPointsToSolde()`
2. POST to `/api/users/me/bets` with `{ bet_id, solde, position_runner }`
3. Backend responds with bet data including `cote` and `gains_potentiels`
4. Frontend transforms response using `transformBackendBet()`

## Migration Checklist

- [x] Update API endpoints to match backend routes
- [x] Create data transformation layer for points/solde/cote
- [x] Update auth service to handle token-only login response
- [x] Update mock adapter to match backend response structures
- [x] Add TypeScript interfaces for backend data models
- [ ] Test with real backend (when ready to switch)
- [ ] Update components using `groupService.joinGroup()` to pass code instead of groupId
- [ ] Update components using `groupService.banMember()` to pass `userToBan` instead of `userId`
- [ ] Add error handling for backend-specific error responses
- [ ] Update API base URLs in `.env` when deploying

## Notes for Developers

1. **All existing frontend code continues to work** - The mock adapter supports both old and new endpoint formats
2. **Data transformations are automatic** - Import from `dataTransform.ts` when needed
3. **JWT token contains user data** - The auth service decodes it automatically
4. **Backward compatibility maintained** - You can switch between mock and real backend seamlessly

## Testing Recommendations

Before switching to the real backend:
1. Test all authentication flows (login, register, logout)
2. Test group operations (create, join, leave, ban)
3. Test betting operations (create bet, view bets, delete bet)
4. Verify data transformations (points ↔ solde/cote)
5. Check error handling for API failures

## Troubleshooting

### Issue: "User data not available after login"
**Solution**: The backend returns only a token. User data is decoded from the JWT. If decoding fails, the frontend will fetch user data on demand.

### Issue: "Group join not working"
**Solution**: The backend join endpoint expects a group code, not a group ID. Use `groupService.joinGroup(code)` instead of `groupService.joinGroup(groupId, code)`.

### Issue: "Ban user not working"
**Solution**: The backend expects `{ userToBan }` in the request body, not `{ userId }`. Update your component to use the correct field name.

### Issue: "Bet amounts showing as 0"
**Solution**: Make sure you're using the data transformation functions. The backend uses `solde` and `cote`, not `points`. Use `transformBackendBet()` to convert.

## API 2 (api-scoring) - Race Management Backend

### Overview
API 2 is a Symfony/PHP backend that handles:
- Race information and details
- Runner management
- Live race progress and results
- Real-time scoring

### API 2 Routes Reference

#### Race Routes (`/api/races`)
| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/api/races` | `status`, `sort` | Get all races with filtering |
| GET | `/api/races/{id}` | - | Get race details by ID |
| GET | `/api/races/{id}/results` | - | Get race results/rankings |
| GET | `/api/races/{id}/km` | - | Get current kilometer progress |

**Query Parameters**:
- `status`: Filter by `past`, `current`, or `future`
- `sort`: Sort by `date_asc` or `date_desc`

#### Runner Routes (`/api/runners`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/runners` | Get all runners |
| GET | `/api/runners/{id}` | Get runner by ID |
| GET | `/api/runners/{id}/results` | Get runner's results across races |

#### Result Routes (`/api/results`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results` | Get all results |
| GET | `/api/results/{id}` | Get result by ID |

### API 2 Data Models

#### Race Model
```typescript
{
  id: number;
  id_public_race: string;  // Public-facing race ID
  name: string;
  description?: string;
  startDate: string;       // ISO datetime
  createAt: string;        // ISO datetime
  updatedAt?: string;      // ISO datetime
  kilometer?: number;      // Current race progress
}
```

#### Runner Model
```typescript
{
  id: number;
  race: {
    id: number;
    name: string;
  };
  firstName: string;
  lastName: string;
  nationality: string;
  bibNumber: number;
  createAt: string;        // ISO datetime
  updatedAt?: string;      // ISO datetime
}
```

#### Result Model
```typescript
{
  id: number;
  runner: {
    id: number;
    firstName: string;
    lastName: string;
  };
  race: {
    id: number;
    name: string;
  };
  time: string;            // Format: HH:MM:SS
  runnerRank: number;      // Position in race
  hasFinished: boolean;
  createAt: string;
  updatedAt?: string;
}
```

### Frontend Services for API 2

#### raceService
```typescript
// Get races with optional filtering
raceService.getRaces(status?, sort?)  // Returns Race[]

// Get race details
raceService.getRaceDetails(raceId)    // Returns RaceDetails

// Get race results/rankings
raceService.getRaceResults(raceId)    // Returns Result[]

// Get race progress
raceService.getRaceProgress(raceId)   // Returns { kilometer: number }
```

#### runnerService
```typescript
// Get all runners
runnerService.getAllRunners()         // Returns Runner[]

// Get runner by ID
runnerService.getRunner(runnerId)     // Returns Runner

// Get runner's results
runnerService.getRunnerResults(runnerId) // Returns Result[]
```

#### resultService
```typescript
// Get all results
resultService.getAllResults()         // Returns Result[]

// Get result by ID
resultService.getResult(resultId)     // Returns Result
```

### Setting Up API 2

To run the Symfony backend:

```bash
cd D:\PROJETS YNOV\api-scoring
composer install
php bin/console doctrine:migrations:migrate  # Run database migrations
symfony server:start  # or php -S localhost:8000 -t public
```

Update your `.env` to point to API 2:
```env
VITE_API_2_URL=http://localhost:8000
```

### Key Differences: API 2

1. **Technology Stack**: Symfony/PHP vs Node.js (API 1)
2. **ID Format**: Uses numeric IDs (`id: number`) vs string IDs in frontend
3. **Naming Convention**: Uses `createAt` instead of `createdAt`
4. **Race Progress**: Uses `kilometer` field directly in race object
5. **Runner Names**: Split into `firstName` and `lastName` vs single `name` field

### Migration Notes for API 2

When switching from mock to real API 2:
1. Race IDs will be numeric (1, 2, 3) instead of string ('1', '2', '3')
2. Runner names are split - combine with `${firstName} ${lastName}`
3. Race status might need mapping (`current` → `ongoing`)
4. Time values are formatted as `HH:MM:SS` strings

## Contact

For questions about backend integration, refer to:
- **API 1**: `D:\PROJETS YNOV\api-maratoons\` (Node.js/Express)
- **API 2**: `D:\PROJETS YNOV\api-scoring\` (Symfony/PHP)
- Check respective `routes/` and `controllers/` directories
