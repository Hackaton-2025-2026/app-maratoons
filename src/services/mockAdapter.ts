import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { User } from '../types';
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
    // POST /auth/login - User login
    if (method === 'POST' && url === '/auth/login') {
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

      // Generate mock token
      const token = `mock_token_${user.id}_${Date.now()}`;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return createMockResponse(config, {
        user: userWithoutPassword,
        token
      });
    }

    // POST /auth/register - User registration
    if (method === 'POST' && url === '/auth/register') {
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
