import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getRaceStatus } from '../utils/date';
import {
  mockRaces,
  mockRaceDetails,
  mockRunners,
  mockRaceProgress,
  mockGroups,
  mockGroupMembers,
  mockBets,
  mockGroupRankings,
  paginate,
  updateRaceProgress
} from './mockData';

// Mock users for authentication
const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'admin', groups: ['group-1', 'group-2', 'group-3'] },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user', groups: ['group-1', 'group-2'] },
  { id: 'u3', name: 'Mike Johnson', email: 'mike@example.com', password: 'password123', role: 'user', groups: ['group-1', 'group-3'] },
];

// Simulate network delay for realism
const MOCK_DELAY = 300; // ms

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create mock response
function createMockResponse<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: config as any,
  };
}

// Parse query parameters
function parseQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryString = url.split('?')[1];

  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });
  }

  return params;
}

// Extract path segments
function extractPathParam(url: string, pattern: RegExp): string | null {
  const match = url.match(pattern);
  return match ? match[1] : null;
}

// Mock request handler
async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await delay(MOCK_DELAY);

  const url = config.url || '';
  const method = config.method?.toUpperCase();

  console.log(`[MOCK API] ${method} ${url}`);

  try {
    // POST /api/users/login - User login (Backend format)
    if (method === 'POST' && (url === '/api/users/login' || url === '/auth/login')) {
      const { email, password } = config.data;

      const user = mockUsers.find(u => u.email === email && u.password === password);

      if (!user) {
        return Promise.reject({
          response: {
            status: 401,
            statusText: 'Unauthorized',
            data: { error: 'Invalid email or password' }
          }
        });
      }

      // Generate mock token with user data encoded
      const tokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      const token = `mock_token_${user.id}_${Date.now()}.${btoa(JSON.stringify(tokenPayload))}`;

      // Backend returns ONLY token (no user object)
      return createMockResponse(config, {
        token
      });
    }

    // POST /api/users/register - User registration (Backend format)
    if (method === 'POST' && (url === '/api/users/register' || url === '/auth/register')) {
      const { name, email, password } = config.data;

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return Promise.reject({
          response: {
            status: 400,
            statusText: 'Bad Request',
            data: { error: 'Email already registered' }
          }
        });
      }

      // Create new user
      const newUser: User = {
        id: `u${mockUsers.length + 1}`,
        name,
        email,
        password,
        role: 'user'
      };

      mockUsers.push(newUser);

      // Generate mock token
      const token = `mock_token_${newUser.id}_${Date.now()}`;

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;

      // Backend returns both user and token for registration
      return createMockResponse(config, {
        user: userWithoutPassword,
        token
      }, 201);
    }

    // POST /auth/logout - User logout
    if (method === 'POST' && url === '/auth/logout') {
      return createMockResponse(config, {
        success: true,
        message: 'Logged out successfully'
      });
    }

    // GET /api/users - Get all users
    if (method === 'GET' && url === '/api/users') {
      const usersWithoutPasswords = mockUsers.map(({ password, ...user }) => user);
      return createMockResponse(config, usersWithoutPasswords);
    }

    // GET /api/users/:id - Get user by ID
    if (method === 'GET' && url.match(/^\/api\/users\/[^/]+$/)) {
      const userId = extractPathParam(url, /^\/api\/users\/([^/]+)$/);
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        return Promise.reject({
          response: {
            status: 404,
            statusText: 'Not Found',
            data: { error: 'User not found' }
          }
        });
      }
      const { password, ...userWithoutPassword } = user;
      return createMockResponse(config, userWithoutPassword);
    }

    // GET /api/users/me/bets - Get current user's bets
    if (method === 'GET' && url === '/api/users/me/bets') {
      // Mock return user bets
      return createMockResponse(config, []);
    }

    // POST /api/users/me/bets - Create bet for current user
    if (method === 'POST' && url === '/api/users/me/bets') {
      const { bet_id, solde, position_runner } = config.data;
      return createMockResponse(config, {
        id: `bet_${Date.now()}`,
        bet_id,
        solde,
        position_runner,
        createdAt: new Date().toISOString()
      }, 201);
    }

    // DELETE /api/users/me/bets/:betId - Delete user's bet
    if (method === 'DELETE' && url.match(/^\/api\/users\/me\/bets\/[^/]+$/)) {
      return createMockResponse(config, { message: 'Bet deleted successfully' });
    }

    // GET /races - List all races with pagination
    if (method === 'GET' && url.startsWith('/races')) {
      const params = parseQueryParams(url);
      const page = parseInt(params.page || '1');
      const pageSize = parseInt(params.pageSize || '12');

      const response = paginate(mockRaces, page, pageSize);
      return createMockResponse(config, response);
    }

    // GET /race/{raceId} - Get race details
    if (method === 'GET' && url.match(/^\/race\/[^/]+$/)) {
      const raceId = extractPathParam(url, /^\/race\/([^/]+)$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      const raceDetails = mockRaceDetails[raceId];
      if (!raceDetails) {
        // Return basic race info if details not found
        const race = mockRaces.find(r => r.id === raceId);
        if (race) {
          return createMockResponse(config, {
            ...race,
            totalRunners: 100,
            weather: 'Clear skies'
          });
        }
        throw new Error('Race not found');
      }

      return createMockResponse(config, raceDetails);
    }

    // GET /race/{raceId}/runners - Get race runners with pagination
    if (method === 'GET' && url.match(/^\/race\/[^/]+\/runners/)) {
      const raceId = extractPathParam(url, /^\/race\/([^/]+)\/runners/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      const params = parseQueryParams(url);
      const page = parseInt(params.page || '1');
      const pageSize = parseInt(params.pageSize || '20');

      const runners = mockRunners[raceId] || [];
      const response = paginate(runners, page, pageSize);
      return createMockResponse(config, response);
    }

    // GET /race/{raceId}/km - Get race progress
    if (method === 'GET' && url.match(/^\/race\/[^/]+\/km$/)) {
      const raceId = extractPathParam(url, /^\/race\/([^/]+)\/km$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      // Update progress before returning (simulates live updates)
      updateRaceProgress(raceId);

      const progress = mockRaceProgress[raceId];
      if (!progress) {
        throw new Error('Race progress not found');
      }

      return createMockResponse(config, progress);
    }

    // GET /group/{groupId} - Get group members
    if (method === 'GET' && url.match(/^\/group\/[^/]+$/)) {
      const groupId = extractPathParam(url, /^\/group\/([^/]+)$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }

      const members = mockGroupMembers[groupId] || [];
      return createMockResponse(config, members);
    }

    // GET /group/{groupId}/race/{raceId} - Get group bets for a race
    if (method === 'GET' && url.match(/^\/group\/[^/]+\/race\/[^/]+$/)) {
      const match = url.match(/^\/group\/([^/]+)\/race\/([^/]+)$/);
      if (!match) {
        throw new Error('Group ID or Race ID not found');
      }

      const groupId = match[1];
      const raceId = match[2];
      const key = `${groupId}-${raceId}`;

      const bets = mockBets[key] || [];
      return createMockResponse(config, bets);
    }

    // GET /race/{raceId}/bets/all - Get all bets for a race across all groups (aggregated)
    if (method === 'GET' && url.match(/^\/race\/[^/]+\/bets\/all$/)) {
      const raceId = extractPathParam(url, /^\/race\/([^/]+)\/bets\/all$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      // Aggregate bets from all groups for this race
      const aggregatedBets: Record<string, any> = {};

      Object.keys(mockBets).forEach(key => {
        if (key.endsWith(`-${raceId}`)) {
          const groupBets = mockBets[key];
          groupBets.forEach(bet => {
            const userId = bet.userId;
            if (!aggregatedBets[userId]) {
              aggregatedBets[userId] = {
                userId: bet.userId,
                userName: bet.userName,
                runnerId: bet.runnerId,
                runnerName: bet.runnerName,
                points: bet.points,
                placedAt: bet.placedAt,
                groups: []
              };
            }
            aggregatedBets[userId].groups.push({
              id: bet.groupId,
              name: bet.groupName
            });
          });
        }
      });

      return createMockResponse(config, Object.values(aggregatedBets));
    }

    // GET /group/{groupId}/rank - Get group rankings
    if (method === 'GET' && url.match(/^\/group\/[^/]+\/rank$/)) {
      const groupId = extractPathParam(url, /^\/group\/([^/]+)\/rank$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }

      const rankings = mockGroupRankings[groupId] || [];
      return createMockResponse(config, rankings);
    }

    // GET /api/groups - Get all groups (Backend format)
    if (method === 'GET' && url === '/api/groups') {
      return createMockResponse(config, mockGroups);
    }

    // GET /api/groups/:id - Get group members (Backend format)
    if (method === 'GET' && url.match(/^\/api\/groups\/[^/]+$/)) {
      const groupId = extractPathParam(url, /^\/api\/groups\/([^/]+)$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }
      const members = mockGroupMembers[groupId] || [];
      return createMockResponse(config, members);
    }

    // POST /api/groups/create - Create a group (Backend format)
    if (method === 'POST' && url === '/api/groups/create') {
      const { name } = config.data;
      const newGroup = {
        id: `group-${Date.now()}`,
        name,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: new Date().toISOString(),
        memberCount: 1
      };
      return createMockResponse(config, newGroup, 201);
    }

    // POST /api/groups/join/:code - Join group by code (Backend format)
    if (method === 'POST' && url.match(/^\/api\/groups\/join\/[^/]+$/)) {
      const code = extractPathParam(url, /^\/api\/groups\/join\/([^/]+)$/);
      // Find group with this code (simplified)
      return createMockResponse(config, {
        success: true,
        message: 'Successfully joined the group',
        code
      });
    }

    // POST /api/groups/:id/leave - Leave a group (Backend format)
    if (method === 'POST' && url.match(/^\/api\/groups\/[^/]+\/leave$/)) {
      const groupId = extractPathParam(url, /^\/api\/groups\/([^/]+)\/leave$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }
      return createMockResponse(config, {
        success: true,
        message: 'Successfully left the group',
        groupId
      });
    }

    // POST /api/groups/:id/ban - Ban a member (Backend format)
    if (method === 'POST' && url.match(/^\/api\/groups\/[^/]+\/ban$/)) {
      const groupId = extractPathParam(url, /^\/api\/groups\/([^/]+)\/ban$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }
      const userToBan = config.data?.userToBan; // Backend uses 'userToBan' not 'userId'
      if (!userToBan) {
        throw new Error('userToBan not provided');
      }
      return createMockResponse(config, {
        success: true,
        message: 'User successfully banned',
        userToBan
      });
    }

    // GET /api/bets - Get all bets (Backend format)
    if (method === 'GET' && url === '/api/bets') {
      const allBets: any[] = [];
      Object.values(mockBets).forEach(betGroup => {
        allBets.push(...betGroup);
      });
      return createMockResponse(config, allBets);
    }

    // GET /api/bets/race/:raceId - Get bets by race (Backend format)
    if (method === 'GET' && url.match(/^\/api\/bets\/race\/[^/]+$/)) {
      const raceId = extractPathParam(url, /^\/api\/bets\/race\/([^/]+)$/);
      const raceBets: any[] = [];
      Object.keys(mockBets).forEach(key => {
        if (key.endsWith(`-${raceId}`)) {
          raceBets.push(...mockBets[key]);
        }
      });
      return createMockResponse(config, raceBets);
    }

    // GET /api/bets/runner/:runnerId - Get bets by runner (Backend format)
    if (method === 'GET' && url.match(/^\/api\/bets\/runner\/[^/]+$/)) {
      const runnerId = extractPathParam(url, /^\/api\/bets\/runner\/([^/]+)$/);
      const runnerBets: any[] = [];
      Object.values(mockBets).forEach(betGroup => {
        betGroup.forEach(bet => {
          if (bet.runnerId === runnerId) {
            runnerBets.push(bet);
          }
        });
      });
      return createMockResponse(config, runnerBets);
    }

    // POST /api/bets - Create bet (Backend format)
    if (method === 'POST' && url === '/api/bets') {
      const { bet_id, solde, position_runner } = config.data;
      return createMockResponse(config, {
        id: `bet_${Date.now()}`,
        bet_id,
        solde,
        cote: 2.5, // Mock odds
        position_runner,
        createdAt: new Date().toISOString()
      }, 201);
    }

    // OLD ROUTES (Keep for backward compatibility)
    // POST /group/{groupId}/join - Join a group
    if (method === 'POST' && url.match(/^\/group\/[^/]+\/join$/)) {
      const groupId = extractPathParam(url, /^\/group\/([^/]+)\/join$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }

      // Simulate successful join
      return createMockResponse(config, {
        success: true,
        message: 'Successfully joined the group',
        groupId
      });
    }

    // POST /group/{groupId}/leave - Leave a group
    if (method === 'POST' && url.match(/^\/group\/[^/]+\/leave$/)) {
      const groupId = extractPathParam(url, /^\/group\/([^/]+)\/leave$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }

      // Simulate successful leave
      return createMockResponse(config, {
        success: true,
        message: 'Successfully left the group',
        groupId
      });
    }

    // POST /group/{groupId}/ban - Ban a member
    if (method === 'POST' && url.match(/^\/group\/[^/]+\/ban$/)) {
      const groupId = extractPathParam(url, /^\/group\/([^/]+)\/ban$/);
      if (!groupId) {
        throw new Error('Group ID not found');
      }

      const userId = config.data?.userId;
      if (!userId) {
        throw new Error('User ID not provided');
      }

      // Simulate successful ban
      return createMockResponse(config, {
        success: true,
        message: 'User successfully banned',
        userId
      });
    }

    // POST /race/{raceId}/bet - Place a bet
    if (method === 'POST' && url.match(/^\/race\/[^/]+\/bet$/)) {
      const raceId = extractPathParam(url, /^\/race\/([^/]+)\/bet$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      const runnerId = config.data?.runnerId;
      if (!runnerId) {
        throw new Error('Runner ID not provided');
      }

      // Find runner to get details
      const runners = mockRunners[raceId] || [];
      const runner = runners.find(r => r.id === runnerId);

      // Simulate successful bet placement
      return createMockResponse(config, {
        success: true,
        message: 'Bet placed successfully',
        bet: {
          raceId,
          runnerId,
          runnerName: runner?.name || 'Unknown Runner',
          points: runner?.points || 10,
          placedAt: new Date().toISOString()
        }
      });
    }

    // ==================== API 2 ROUTES (api-scoring) ====================

    // GET /api/races - Get all races with filtering (Backend format)
    if (method === 'GET' && url.startsWith('/api/races') && !url.match(/\/api\/races\/\d+/)) {
      const params = parseQueryParams(url);
      const status = params.status; // 'past', 'current', 'future'
      const sort = params.sort; // 'date_asc', 'date_desc'

      let filteredRaces = [...mockRaces];

      // Apply status filter
      if (status) {
        filteredRaces = filteredRaces.filter(race => getRaceStatus(race.startDate) === status);
      }

      // Apply sorting
      if (sort === 'date_asc') {
        filteredRaces.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      } else if (sort === 'date_desc') {
        filteredRaces.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }

      return createMockResponse(config, filteredRaces);
    }

    // GET /api/races/{id} - Get race details (Backend format)
    if (method === 'GET' && url.match(/^\/api\/races\/\d+$/)) {
      const raceId = extractPathParam(url, /^\/api\/races\/(\d+)$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      const raceDetails = mockRaceDetails[raceId];
      if (!raceDetails) {
        const race = mockRaces.find(r => r.id === raceId);
        if (race) {
          return createMockResponse(config, {
            ...race,
            totalRunners: 100,
            weather: 'Clear skies'
          });
        }
        throw new Error('Race not found');
      }

      return createMockResponse(config, raceDetails);
    }

    // GET /api/races/{id}/results - Get race results/rankings (Backend format)
    if (method === 'GET' && url.match(/^\/api\/races\/\d+\/results$/)) {
      const raceId = extractPathParam(url, /^\/api\/races\/(\d+)\/results$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      const progress = mockRaceProgress[raceId];
      if (!progress) {
        return createMockResponse(config, []);
      }

      // Transform rankings to results format
      const results = progress.rankings.map((ranking, index) => ({
        id: index + 1,
        runner: {
          id: ranking.runnerId,
          firstName: ranking.runnerName.split(' ')[0] || '',
          lastName: ranking.runnerName.split(' ').slice(1).join(' ') || '',
        },
        race: {
          id: parseInt(raceId),
          name: mockRaceDetails[raceId]?.name || 'Unknown Race'
        },
        time: ranking.estimatedTime || '00:00:00',
        runnerRank: ranking.position,
        hasFinished: progress.currentKm >= progress.totalKm,
        createAt: progress.lastUpdate,
        updatedAt: progress.lastUpdate
      }));

      return createMockResponse(config, results);
    }

    // GET /api/races/{id}/km - Get race kilometer progress (Backend format)
    if (method === 'GET' && url.match(/^\/api\/races\/\d+\/km$/)) {
      const raceId = extractPathParam(url, /^\/api\/races\/(\d+)\/km$/);
      if (!raceId) {
        throw new Error('Race ID not found');
      }

      const progress = mockRaceProgress[raceId];
      if (!progress) {
        return createMockResponse(config, { kilometer: 0 });
      }

      return createMockResponse(config, { kilometer: progress.currentKm });
    }

    // GET /api/runners - Get all runners (Backend format)
    if (method === 'GET' && url === '/api/runners') {
      const allRunners: any[] = [];
      Object.entries(mockRunners).forEach(([raceId, runners]) => {
        runners.forEach(runner => {
          allRunners.push({
            id: runner.id,
            race: {
              id: parseInt(raceId),
              name: mockRaceDetails[raceId]?.name || 'Unknown Race'
            },
            firstName: runner.name.split(' ')[0] || '',
            lastName: runner.name.split(' ').slice(1).join(' ') || '',
            nationality: runner.country || 'Unknown',
            bibNumber: runner.bibNumber,
            createAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      });
      return createMockResponse(config, allRunners);
    }

    // GET /api/runners/{id} - Get runner by ID (Backend format)
    if (method === 'GET' && url.match(/^\/api\/runners\/\d+$/)) {
      const runnerId = extractPathParam(url, /^\/api\/runners\/(\d+)$/);
      if (!runnerId) {
        throw new Error('Runner ID not found');
      }

      // Find runner across all races
      let foundRunner: any = null;
      let foundRaceId: string | null = null;

      Object.entries(mockRunners).forEach(([raceId, runners]) => {
        const runner = runners.find(r => r.id === runnerId);
        if (runner) {
          foundRunner = runner;
          foundRaceId = raceId;
        }
      });

      if (!foundRunner || !foundRaceId) {
        throw new Error('Runner not found');
      }

      return createMockResponse(config, {
        id: foundRunner.id,
        race: {
          id: parseInt(foundRaceId),
          name: mockRaceDetails[foundRaceId]?.name || 'Unknown Race'
        },
        firstName: foundRunner.name.split(' ')[0] || '',
        lastName: foundRunner.name.split(' ').slice(1).join(' ') || '',
        nationality: foundRunner.country || 'Unknown',
        bibNumber: foundRunner.bibNumber,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // GET /api/runners/{id}/results - Get runner's results (Backend format)
    if (method === 'GET' && url.match(/^\/api\/runners\/\d+\/results$/)) {
      const runnerId = extractPathParam(url, /^\/api\/runners\/(\d+)\/results$/);
      if (!runnerId) {
        throw new Error('Runner ID not found');
      }

      const results: any[] = [];
      // Mock: return empty or generate sample results
      return createMockResponse(config, results);
    }

    // GET /api/results - Get all results (Backend format)
    if (method === 'GET' && url === '/api/results') {
      const allResults: any[] = [];
      Object.entries(mockRaceProgress).forEach(([raceId, progress]) => {
        progress.rankings.forEach((ranking, index) => {
          allResults.push({
            id: `${raceId}-${index}`,
            runner: {
              id: ranking.runnerId,
              firstName: ranking.runnerName.split(' ')[0] || '',
              lastName: ranking.runnerName.split(' ').slice(1).join(' ') || '',
            },
            race: {
              id: parseInt(raceId),
              name: mockRaceDetails[raceId]?.name || 'Unknown Race'
            },
            time: ranking.estimatedTime || '00:00:00',
            runnerRank: ranking.position,
            hasFinished: progress.currentKm >= progress.totalKm,
            createAt: progress.lastUpdate,
            updatedAt: progress.lastUpdate
          });
        });
      });
      return createMockResponse(config, allResults);
    }

    // GET /api/results/{id} - Get result by ID (Backend format)
    if (method === 'GET' && url.match(/^\/api\/results\/\d+$/)) {
      const resultId = extractPathParam(url, /^\/api\/results\/(\d+)$/);
      if (!resultId) {
        throw new Error('Result ID not found');
      }

      // Mock single result
      return createMockResponse(config, {
        id: resultId,
        runner: {
          id: 'r1-1',
          firstName: 'John',
          lastName: 'Doe',
        },
        race: {
          id: 1,
          name: 'Paris Marathon 2024'
        },
        time: '02:15:30',
        runnerRank: 1,
        hasFinished: true,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // If no route matches, throw error
    throw new Error(`Mock endpoint not implemented: ${method} ${url}`);

  } catch (error: any) {
    console.error('[MOCK API ERROR]', error.message);

    // Return error response
    return Promise.reject({
      response: {
        status: 404,
        statusText: 'Not Found',
        data: {
          error: error.message || 'Mock API Error'
        }
      }
    });
  }
}

// Helper to setup interceptors for an API instance
function setupInterceptors(api: AxiosInstance): void {
  api.interceptors.request.use(
    async (config) => {
      const mockResponse = await handleMockRequest(config);
      const error: any = new Error('MOCK_RESPONSE');
      error.mockResponse = mockResponse;
      throw error;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.message === 'MOCK_RESPONSE' && error.mockResponse) {
        return Promise.resolve(error.mockResponse);
      }
      return Promise.reject(error);
    }
  );
}

// Setup mock adapter for API instances
export function setupMockAdapter(...apis: AxiosInstance[]): void {
  console.log('[MOCK MODE] Mock API adapter enabled');

  apis.forEach(api => setupInterceptors(api));
}
