# Mock API Service Guide

## Overview

This application includes a complete mock API service that simulates all backend endpoints. This allows you to develop and test the frontend without requiring the real APIs to be ready.

## Features

- **Complete API Coverage**: All endpoints from both API 1 and API 2 are mocked
- **Realistic Data**: Mock data includes 12 races, 20+ runners, 6 group members, and more
- **Live Updates Simulation**: The ongoing race (Boston Marathon 2025) has live progress updates
- **Network Delay Simulation**: 300ms delay to simulate real network conditions
- **Pagination Support**: All list endpoints support pagination
- **Console Logging**: All mock API calls are logged to the browser console

## Quick Start

### Enable Mock Mode

Edit your `.env` file:

```env
VITE_USE_MOCK=true
```

### Disable Mock Mode (Use Real APIs)

```env
VITE_USE_MOCK=false
```

After changing the `.env` file, restart your development server:

```bash
npm run dev
```

## Mock Data Available

### Races
- **12 races total** (past, ongoing, and future)
- **Ongoing race**: Boston Marathon 2025 (race ID: `3`) - has live updates
- Pagination: 12 items per page by default

### Runners
- **20 elite runners** for the Boston Marathon
- Includes famous marathoners: Eliud Kipchoge, Kenenisa Bekele, Mo Farah, etc.
- Each runner has realistic odds, bib numbers, countries, and categories

### Group
- **Default group ID**: `default-group` (hardcoded in views)
- **6 members**: John Doe (admin), Jane Smith, Mike Johnson, Sarah Williams, David Brown, Emma Davis
- **Rankings**: Members ranked by total points (125-200 range)

### Bets
- **5 sample bets** for the Boston Marathon
- Distributed across different users betting on different runners

### Live Race Progress
- **Boston Marathon** (race ID: `3`) has live progress simulation
- Updates every 10 seconds when viewing race details
- Runners advance ~0.15km per update
- Rankings dynamically update based on progress

## API Endpoints Mocked

### Race Service (API 1 & 2)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/races?page=X&pageSize=Y` | GET | List all races with pagination |
| `/race/{raceId}` | GET | Get race details (API 2) |
| `/race/{raceId}/runners?page=X&pageSize=Y` | GET | List race runners with pagination |
| `/race/{raceId}/km` | GET | Get live race progress (API 2) |

### Group Service (API 1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/group/{groupId}` | GET | Get group members |
| `/group/{groupId}/race/{raceId}` | GET | Get group bets for a race |
| `/group/{groupId}/rank` | GET | Get group rankings |
| `/group/{groupId}/join` | POST | Join a group |
| `/group/{groupId}/leave` | POST | Leave a group |
| `/group/{groupId}/ban` | POST | Ban a member |

### Bet Service (API 1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/race/{raceId}/bet` | POST | Place a bet on a runner |

## File Structure

```
src/services/
├── api.ts              # Main API service (integrates mock adapter)
├── mockAdapter.ts      # Mock request interceptor
└── mockData.ts         # Mock data and helper functions
```

## Customizing Mock Data

### Adding More Races

Edit `src/services/mockData.ts` and add entries to the `mockRaces` array:

```typescript
export const mockRaces: Race[] = [
  // ... existing races
  {
    id: '13',
    name: 'Your Marathon',
    location: 'City, Country',
    startDate: '2025-06-01T09:00:00Z',
    distance: 42.195,
    status: 'future',
    description: 'Description here'
  }
];
```

### Adding Runners to a Race

Add entries to `mockRunners` object with the race ID as key:

```typescript
export const mockRunners: Record<string, Runner[]> = {
  '3': [ /* Boston Marathon runners */ ],
  '4': [ /* Add runners for Berlin Marathon */ ]
};
```

### Simulating Live Updates for Other Races

Add entries to `mockRaceProgress` and `mockRaceDetails`:

```typescript
export const mockRaceProgress: Record<string, RaceProgress> = {
  '3': { /* Boston Marathon progress */ },
  '4': { /* Add progress for another race */ }
};
```

### Adjusting Network Delay

Edit `MOCK_DELAY` in `src/services/mockAdapter.ts`:

```typescript
const MOCK_DELAY = 300; // Change to 0 for instant responses, or 1000 for slower
```

## Debugging

All mock API calls are logged to the browser console with the prefix `[MOCK API]`:

```
[MOCK API] GET /races?page=1&pageSize=12
[MOCK API] GET /race/3
[MOCK API] GET /race/3/runners?page=1&pageSize=20
[MOCK API] GET /race/3/km
```

Errors are logged with `[MOCK API ERROR]`.

## Testing Specific Scenarios

### Test Ongoing Race with Live Updates

1. Navigate to `/race/3` (Boston Marathon)
2. The race progress will update every 10 seconds
3. Watch the rankings change dynamically

### Test Pagination

1. Navigate to `/races` - should show 12 races on first page
2. Navigate to `/race/3` and scroll to runners section
3. Should show 20 runners with pagination controls

### Test Group Features

1. Navigate to `/group`
2. View 6 group members
3. Check group rankings (sorted by points)
4. View group bets for ongoing race

### Test Betting

1. Go to an ongoing race detail page
2. Select a runner and place a bet
3. Mock service will return success response

## Switching to Real APIs

When your real APIs are ready:

1. Update `.env`:
   ```env
   VITE_USE_MOCK=false
   VITE_API_1_URL=https://your-api-1-url.com
   VITE_API_2_URL=https://your-api-2-url.com
   ```

2. Restart the dev server:
   ```bash
   npm run dev
   ```

3. The application will seamlessly switch to using real APIs
4. No code changes required!

## Notes

- Mock data is stored in memory and resets on page refresh
- POST requests (bets, join/leave group, ban) return success responses but don't persist data
- Live race progress simulation only works when viewing the race detail page
- The mock adapter intercepts requests at the axios level, so all error handling in your components works the same way

## Troubleshooting

**Mock mode not working?**
- Check that `.env` has `VITE_USE_MOCK=true`
- Restart your dev server after changing `.env`
- Check browser console for `[MOCK MODE] Mock API adapter enabled`

**No data showing?**
- Open browser console and check for `[MOCK API]` logs
- Verify the endpoint URLs match what's in `mockAdapter.ts`

**Live updates not working?**
- Make sure you're viewing race ID `3` (Boston Marathon)
- Check that the component is calling `getRaceProgress` in an interval
- Look for `[MOCK API] GET /race/3/km` logs every 10 seconds

## Future Enhancements

Consider adding:
- Local storage persistence for POST operations
- More realistic error scenarios (random failures, timeouts)
- Admin panel to modify mock data in real-time
- Export/import mock data sets
- Mock WebSocket support for even more realistic live updates
