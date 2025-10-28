import type { Race, RaceDetails, Runner, RaceProgress, GroupMember, Bet, GroupRanking, PaginatedResponse, Group } from '../types';

// Mock Groups Data
export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Boston Runners Club',
    description: 'Enthusiastic marathon runners from Boston area',
    createdAt: '2024-01-15T10:00:00Z',
    memberCount: 6
  },
  {
    id: 'group-2',
    name: 'Weekend Warriors',
    description: 'Casual runners who love weekend marathons',
    createdAt: '2024-02-01T14:00:00Z',
    memberCount: 4
  },
  {
    id: 'group-3',
    name: 'Elite Marathon Society',
    description: 'Competitive marathon betting group',
    createdAt: '2024-03-10T09:00:00Z',
    memberCount: 3
  }
];

// Mock Races Data
export const mockRaces: Race[] = [
  {
    id: '1',
    name: 'Paris Marathon 2024',
    location: 'Paris, France',
    startDate: '2024-04-07T09:00:00Z',
    distance: 42.195,
    description: 'The iconic Paris Marathon through the streets of the City of Light'
  },
  {
    id: '2',
    name: 'London Marathon 2024',
    location: 'London, UK',
    startDate: '2024-04-21T10:00:00Z',
    distance: 42.195,
    description: 'One of the six World Marathon Majors'
  },
  {
    id: '3',
    name: 'Boston Marathon 2025',
    location: 'Boston, USA',
    startDate: '2025-04-21T10:00:00Z',
    distance: 42.195,
    description: 'The world\'s oldest annual marathon, currently in progress!'
  },
  {
    id: '4',
    name: 'Berlin Marathon 2025',
    location: 'Berlin, Germany',
    startDate: '2025-09-28T09:00:00Z',
    distance: 42.195,
    description: 'Known for its fast, flat course and world records'
  },
  {
    id: '5',
    name: 'Tokyo Marathon 2025',
    location: 'Tokyo, Japan',
    startDate: '2025-03-02T09:00:00Z',
    distance: 42.195,
    description: 'One of the most prestigious marathons in Asia'
  },
  {
    id: '6',
    name: 'New York Marathon 2025',
    location: 'New York, USA',
    startDate: '2025-11-02T09:00:00Z',
    distance: 42.195,
    description: 'The largest marathon in the world by participants'
  },
  {
    id: '7',
    name: 'Chicago Marathon 2025',
    location: 'Chicago, USA',
    startDate: '2025-10-12T08:00:00Z',
    distance: 42.195,
    description: 'Fast and flat course through Chicago neighborhoods'
  },
  {
    id: '8',
    name: 'Athens Marathon 2024',
    location: 'Athens, Greece',
    startDate: '2024-11-10T09:00:00Z',
    distance: 42.195,
    description: 'The authentic marathon route from Marathon to Athens'
  },
  {
    id: '9',
    name: 'Dubai Marathon 2025',
    location: 'Dubai, UAE',
    startDate: '2025-01-26T07:00:00Z',
    distance: 42.195,
    description: 'Known for its generous prize money'
  },
  {
    id: '10',
    name: 'Amsterdam Marathon 2025',
    location: 'Amsterdam, Netherlands',
    startDate: '2025-10-19T09:00:00Z',
    distance: 42.195,
    description: 'Fast course through the beautiful Dutch capital'
  },
  {
    id: '11',
    name: 'Stockholm Marathon 2025',
    location: 'Stockholm, Sweden',
    startDate: '2025-05-31T14:00:00Z',
    distance: 42.195,
    description: 'Scandinavia\'s largest running event'
  },
  {
    id: '12',
    name: 'Barcelona Marathon 2025',
    location: 'Barcelona, Spain',
    startDate: '2025-03-16T08:30:00Z',
    distance: 42.195,
    description: 'Running along the Mediterranean coast'
  }
];

// Mock Race Details
export const mockRaceDetails: Record<string, RaceDetails> = {
  '1': {
    id: '1',
    name: 'Paris Marathon 2024',
    location: 'Paris, France',
    startDate: '2024-04-07T09:00:00Z',
    distance: 42.195,
    description: 'The iconic Paris Marathon through the streets of the City of Light',
    totalRunners: 98,
    weather: 'Cloudy, 15°C'
  },
  '2': {
    id: '2',
    name: 'London Marathon 2024',
    location: 'London, UK',
    startDate: '2024-04-21T10:00:00Z',
    distance: 42.195,
    description: 'One of the six World Marathon Majors',
    totalRunners: 105,
    weather: 'Rainy, 12°C'
  },
  '3': {
    id: '3',
    name: 'Boston Marathon 2025',
    location: 'Boston, USA',
    startDate: '2025-04-21T10:00:00Z',
    distance: 42.195,
    description: 'The world\'s oldest annual marathon, currently in progress!',
    totalRunners: 125,
    weather: 'Sunny, 18°C, Light wind'
  },
  '4': {
    id: '4',
    name: 'Berlin Marathon 2025',
    location: 'Berlin, Germany',
    startDate: '2025-09-28T09:00:00Z',
    distance: 42.195,
    description: 'Known for its fast, flat course and world records',
    totalRunners: 110,
    weather: 'Expected: Clear skies'
  },
  '5': {
    id: '5',
    name: 'Tokyo Marathon 2025',
    location: 'Tokyo, Japan',
    startDate: '2025-03-02T09:00:00Z',
    distance: 42.195,
    description: 'One of the most prestigious marathons in Asia',
    totalRunners: 95,
    weather: 'Expected: Mild'
  },
  '8': {
    id: '8',
    name: 'Athens Marathon 2024',
    location: 'Athens, Greece',
    startDate: '2024-11-10T09:00:00Z',
    distance: 42.195,
    description: 'The authentic marathon route from Marathon to Athens',
    totalRunners: 88,
    weather: 'Sunny, 20°C'
  }
};

// Mock Runners Data
export const mockRunners: Record<string, Runner[]> = {
  '1': [ // Paris Marathon 2024 (Past)
    { id: 'r1-1', name: 'Eliud Kipchoge', bibNumber: 1, points: 25, country: 'Kenya', category: 'Elite Men' },
    { id: 'r1-2', name: 'Kenenisa Bekele', bibNumber: 2, points: 30, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r1-3', name: 'Brigid Kosgei', bibNumber: 3, points: 28, country: 'Kenya', category: 'Elite Women' },
    { id: 'r1-4', name: 'Geoffrey Kamworor', bibNumber: 4, points: 45, country: 'Kenya', category: 'Elite Men' },
    { id: 'r1-5', name: 'Mary Keitany', bibNumber: 5, points: 35, country: 'Kenya', category: 'Elite Women' },
    { id: 'r1-6', name: 'Wilson Kipsang', bibNumber: 6, points: 60, country: 'Kenya', category: 'Elite Men' },
    { id: 'r1-7', name: 'Tirunesh Dibaba', bibNumber: 7, points: 40, country: 'Ethiopia', category: 'Elite Women' },
    { id: 'r1-8', name: 'Lelisa Desisa', bibNumber: 8, points: 55, country: 'Ethiopia', category: 'Elite Men' }
  ],
  '2': [ // London Marathon 2024 (Past)
    { id: 'r2-1', name: 'Mo Farah', bibNumber: 1, points: 40, country: 'UK', category: 'Elite Men' },
    { id: 'r2-2', name: 'Gladys Cherono', bibNumber: 2, points: 45, country: 'Kenya', category: 'Elite Women' },
    { id: 'r2-3', name: 'Galen Rupp', bibNumber: 3, points: 65, country: 'USA', category: 'Elite Men' },
    { id: 'r2-4', name: 'Vivian Cheruiyot', bibNumber: 4, points: 55, country: 'Kenya', category: 'Elite Women' },
    { id: 'r2-5', name: 'Tamirat Tola', bibNumber: 5, points: 62, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r2-6', name: 'Edna Kiplagat', bibNumber: 6, points: 70, country: 'Kenya', category: 'Elite Women' },
    { id: 'r2-7', name: 'Dickson Chumba', bibNumber: 7, points: 85, country: 'Kenya', category: 'Elite Men' }
  ],
  '3': [ // Boston Marathon 2025 (Ongoing)
    { id: 'r1', name: 'Eliud Kipchoge', bibNumber: 1, points: 25, country: 'Kenya', category: 'Elite Men' },
    { id: 'r2', name: 'Kenenisa Bekele', bibNumber: 2, points: 32, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r3', name: 'Mo Farah', bibNumber: 3, points: 41, country: 'UK', category: 'Elite Men' },
    { id: 'r4', name: 'Brigid Kosgei', bibNumber: 4, points: 28, country: 'Kenya', category: 'Elite Women' },
    { id: 'r5', name: 'Mary Keitany', bibNumber: 5, points: 35, country: 'Kenya', category: 'Elite Women' },
    { id: 'r6', name: 'Geoffrey Kamworor', bibNumber: 6, points: 50, country: 'Kenya', category: 'Elite Men' },
    { id: 'r7', name: 'Wilson Kipsang', bibNumber: 7, points: 62, country: 'Kenya', category: 'Elite Men' },
    { id: 'r8', name: 'Gladys Cherono', bibNumber: 8, points: 48, country: 'Kenya', category: 'Elite Women' },
    { id: 'r9', name: 'Lelisa Desisa', bibNumber: 9, points: 55, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r10', name: 'Tirunesh Dibaba', bibNumber: 10, points: 42, country: 'Ethiopia', category: 'Elite Women' },
    { id: 'r11', name: 'Galen Rupp', bibNumber: 11, points: 70, country: 'USA', category: 'Elite Men' },
    { id: 'r12', name: 'Shalane Flanagan', bibNumber: 12, points: 65, country: 'USA', category: 'Elite Women' },
    { id: 'r13', name: 'Yuki Kawauchi', bibNumber: 13, points: 82, country: 'Japan', category: 'Elite Men' },
    { id: 'r14', name: 'Vivian Cheruiyot', bibNumber: 14, points: 58, country: 'Kenya', category: 'Elite Women' },
    { id: 'r15', name: 'Tamirat Tola', bibNumber: 15, points: 68, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r16', name: 'Edna Kiplagat', bibNumber: 16, points: 75, country: 'Kenya', category: 'Elite Women' },
    { id: 'r17', name: 'Dickson Chumba', bibNumber: 17, points: 90, country: 'Kenya', category: 'Elite Men' },
    { id: 'r18', name: 'Rose Chelimo', bibNumber: 18, points: 85, country: 'Bahrain', category: 'Elite Women' },
    { id: 'r19', name: 'Abel Kirui', bibNumber: 19, points: 102, country: 'Kenya', category: 'Elite Men' },
    { id: 'r20', name: 'Yemane Tsegay', bibNumber: 20, points: 110, country: 'Ethiopia', category: 'Elite Men' }
  ],
  '4': [ // Berlin Marathon 2025 (Future)
    { id: 'r4-1', name: 'Kelvin Kiptum', bibNumber: 1, points: 22, country: 'Kenya', category: 'Elite Men' },
    { id: 'r4-2', name: 'Sifan Hassan', bibNumber: 2, points: 27, country: 'Netherlands', category: 'Elite Women' },
    { id: 'r4-3', name: 'Joshua Cheptegei', bibNumber: 3, points: 35, country: 'Uganda', category: 'Elite Men' },
    { id: 'r4-4', name: 'Peres Jepchirchir', bibNumber: 4, points: 30, country: 'Kenya', category: 'Elite Women' },
    { id: 'r4-5', name: 'Birhanu Legese', bibNumber: 5, points: 48, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r4-6', name: 'Ruth Chepngetich', bibNumber: 6, points: 38, country: 'Kenya', category: 'Elite Women' }
  ],
  '5': [ // Tokyo Marathon 2025 (Future)
    { id: 'r5-1', name: 'Suguru Osako', bibNumber: 1, points: 45, country: 'Japan', category: 'Elite Men' },
    { id: 'r5-2', name: 'Mao Ichiyama', bibNumber: 2, points: 50, country: 'Japan', category: 'Elite Women' },
    { id: 'r5-3', name: 'Eliud Kipchoge', bibNumber: 3, points: 28, country: 'Kenya', category: 'Elite Men' },
    { id: 'r5-4', name: 'Brigid Kosgei', bibNumber: 4, points: 32, country: 'Kenya', category: 'Elite Women' },
    { id: 'r5-5', name: 'Kengo Suzuki', bibNumber: 5, points: 65, country: 'Japan', category: 'Elite Men' }
  ],
  '8': [ // Athens Marathon 2024 (Past)
    { id: 'r8-1', name: 'Sisay Lemma', bibNumber: 1, points: 35, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r8-2', name: 'Helen Tola', bibNumber: 2, points: 42, country: 'Ethiopia', category: 'Elite Women' },
    { id: 'r8-3', name: 'Leul Gebresilase', bibNumber: 3, points: 50, country: 'Ethiopia', category: 'Elite Men' },
    { id: 'r8-4', name: 'Nazret Weldu', bibNumber: 4, points: 60, country: 'Eritrea', category: 'Elite Women' }
  ]
};

// Mock Race Progress (for ongoing and past races)
export const mockRaceProgress: Record<string, RaceProgress> = {
  '1': {
    raceId: '1',
    currentKm: 42,
    totalKm: 42,
    lastUpdate: '2024-04-07T12:15:00Z',
    rankings: [
      { runnerId: 'r1-1', runnerName: 'Kenenisa Bekele', bibNumber: 1, position: 1, currentKm: 42, estimatedTime: '02:01:15' },
      { runnerId: 'r1-2', runnerName: 'Haile Gebrselassie', bibNumber: 2, position: 2, currentKm: 42, estimatedTime: '02:02:45' },
      { runnerId: 'r1-3', runnerName: 'Dennis Kimetto', bibNumber: 3, position: 3, currentKm: 42, estimatedTime: '02:03:30' },
      { runnerId: 'r1-4', runnerName: 'Wilson Kipsang', bibNumber: 4, position: 4, currentKm: 42, estimatedTime: '02:05:10' },
      { runnerId: 'r1-5', runnerName: 'Patrick Makau', bibNumber: 5, position: 5, currentKm: 42, estimatedTime: '02:06:20' }
    ]
  },
  '2': {
    raceId: '2',
    currentKm: 42,
    totalKm: 42,
    lastUpdate: '2024-04-21T13:20:00Z',
    rankings: [
      { runnerId: 'r2-1', runnerName: 'Mo Farah', bibNumber: 1, position: 1, currentKm: 42, estimatedTime: '02:02:05' },
      { runnerId: 'r2-2', runnerName: 'Eliud Kipchoge', bibNumber: 2, position: 2, currentKm: 42, estimatedTime: '02:02:30' },
      { runnerId: 'r2-3', runnerName: 'Kenenisa Bekele', bibNumber: 3, position: 3, currentKm: 42, estimatedTime: '02:03:15' },
      { runnerId: 'r2-4', runnerName: 'Emmanuel Mutai', bibNumber: 4, position: 4, currentKm: 42, estimatedTime: '02:04:50' },
      { runnerId: 'r2-5', runnerName: 'Abel Kirui', bibNumber: 5, position: 5, currentKm: 42, estimatedTime: '02:05:35' }
    ]
  },
  '8': {
    raceId: '8',
    currentKm: 42,
    totalKm: 42,
    lastUpdate: '2024-11-10T12:45:00Z',
    rankings: [
      { runnerId: 'r8-1', runnerName: 'Sisay Lemma', bibNumber: 1, position: 1, currentKm: 42, estimatedTime: '02:09:36' },
      { runnerId: 'r8-2', runnerName: 'Helen Tola', bibNumber: 2, position: 2, currentKm: 42, estimatedTime: '02:25:20' },
      { runnerId: 'r8-3', runnerName: 'Leul Gebresilase', bibNumber: 3, position: 3, currentKm: 42, estimatedTime: '02:10:15' },
      { runnerId: 'r8-4', runnerName: 'Nazret Weldu', bibNumber: 4, position: 4, currentKm: 42, estimatedTime: '02:26:45' }
    ]
  },
  '3': {
    raceId: '3',
    currentKm: 28,
    totalKm: 42,
    lastUpdate: new Date().toISOString(),
    rankings: [
      { runnerId: 'r1', runnerName: 'Eliud Kipchoge', bibNumber: 1, position: 1, currentKm: 28, estimatedTime: '02:01:30' },
      { runnerId: 'r2', runnerName: 'Kenenisa Bekele', bibNumber: 2, position: 2, currentKm: 28, estimatedTime: '02:01:45' },
      { runnerId: 'r6', runnerName: 'Geoffrey Kamworor', bibNumber: 6, position: 3, currentKm: 27, estimatedTime: '02:02:10' },
      { runnerId: 'r9', runnerName: 'Lelisa Desisa', bibNumber: 9, position: 4, currentKm: 27, estimatedTime: '02:02:25' },
      { runnerId: 'r3', runnerName: 'Mo Farah', bibNumber: 3, position: 5, currentKm: 27, estimatedTime: '02:02:40' },
      { runnerId: 'r7', runnerName: 'Wilson Kipsang', bibNumber: 7, position: 6, currentKm: 26, estimatedTime: '02:03:05' },
      { runnerId: 'r15', runnerName: 'Tamirat Tola', bibNumber: 15, position: 7, currentKm: 26, estimatedTime: '02:03:20' },
      { runnerId: 'r11', runnerName: 'Galen Rupp', bibNumber: 11, position: 8, currentKm: 26, estimatedTime: '02:03:45' },
      { runnerId: 'r13', runnerName: 'Yuki Kawauchi', bibNumber: 13, position: 9, currentKm: 25, estimatedTime: '02:04:10' },
      { runnerId: 'r17', runnerName: 'Dickson Chumba', bibNumber: 17, position: 10, currentKm: 25, estimatedTime: '02:04:30' }
    ]
  }
};

// Mock Group Members
export const mockGroupMembers: Record<string, any[]> = {
  'group-1': [
    {
      id: 'u1',
      nom: 'John Doe',
      email: 'john.doe@example.com',
      points: 150,
      joinedAt: '2024-01-15T10:00:00Z',
      role: 'admin',
      groupId: 'group-1'
    },
    {
      id: 'u2',
      nom: 'Jane Smith',
      email: 'jane.smith@example.com',
      points: 200,
      joinedAt: '2024-01-16T11:30:00Z',
      role: 'user',
      groupId: 'group-1'
    },
    {
      id: 'u3',
      nom: 'Mike Johnson',
      email: 'mike.j@example.com',
      points: 175,
      joinedAt: '2024-01-20T14:15:00Z',
      role: 'user',
      groupId: 'group-1'
    },
    {
      id: 'u4',
      nom: 'Sarah Williams',
      email: 'sarah.w@example.com',
      points: 180,
      joinedAt: '2024-02-01T09:00:00Z',
      role: 'user',
      groupId: 'group-1'
    },
    {
      id: 'u5',
      nom: 'David Brown',
      email: 'david.brown@example.com',
      points: 125,
      joinedAt: '2024-02-10T16:45:00Z',
      role: 'user',
      groupId: 'group-1'
    },
    {
      id: 'u6',
      nom: 'Emma Davis',
      email: 'emma.d@example.com',
      points: 165,
      joinedAt: '2024-02-15T12:00:00Z',
      role: 'user',
      groupId: 'group-1'
    }
  ],
  'group-2': [
    {
      id: 'u1',
      nom: 'John Doe',
      email: 'john.doe@example.com',
      points: 95,  // Different points - joined later
      joinedAt: '2024-02-10T14:00:00Z',
      role: 'user',
      groupId: 'group-2'
    },
    {
      id: 'u2',
      nom: 'Jane Smith',
      email: 'jane.smith@example.com',
      points: 145,
      joinedAt: '2024-02-01T14:00:00Z',
      role: 'admin',
      groupId: 'group-2'
    },
    {
      id: 'u4',
      nom: 'Sarah Williams',
      email: 'sarah.w@example.com',
      points: 120,
      joinedAt: '2024-02-05T10:00:00Z',
      role: 'user',
      groupId: 'group-2'
    },
    {
      id: 'u7',
      nom: 'Robert Taylor',
      email: 'robert.t@example.com',
      points: 110,
      joinedAt: '2024-02-12T16:00:00Z',
      role: 'user',
      groupId: 'group-2'
    }
  ],
  'group-3': [
    {
      id: 'u1',
      nom: 'John Doe',
      email: 'john.doe@example.com',
      points: 220,  // Higher points - joined early
      joinedAt: '2024-03-10T09:00:00Z',
      role: 'admin',
      groupId: 'group-3'
    },
    {
      id: 'u3',
      nom: 'Mike Johnson',
      email: 'mike.j@example.com',
      points: 190,
      joinedAt: '2024-03-11T10:00:00Z',
      role: 'user',
      groupId: 'group-3'
    },
    {
      id: 'u8',
      nom: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      points: 185,
      joinedAt: '2024-03-15T12:00:00Z',
      role: 'user',
      groupId: 'group-3'
    }
  ]
};

// Mock Bets (storing bets per group-race combination)
export const mockBets: Record<string, Bet[]> = {
  'group-1-3': [ // group-1, race-3 (Boston Marathon - ongoing)
    {
      userId: 'u1',
      userName: 'John Doe',
      runnerId: 'r1',
      runnerName: 'Eliud Kipchoge',
      points: 25,
      placedAt: '2025-04-20T15:30:00Z',
      groupId: 'group-1',
      groupName: 'Boston Runners Club'
    },
    {
      userId: 'u2',
      userName: 'Jane Smith',
      runnerId: 'r2',
      runnerName: 'Kenenisa Bekele',
      points: 32,
      placedAt: '2025-04-20T16:00:00Z',
      groupId: 'group-1',
      groupName: 'Boston Runners Club'
    },
    {
      userId: 'u3',
      userName: 'Mike Johnson',
      runnerId: 'r1',
      runnerName: 'Eliud Kipchoge',
      points: 25,
      placedAt: '2025-04-20T17:15:00Z',
      groupId: 'group-1',
      groupName: 'Boston Runners Club'
    },
    {
      userId: 'u4',
      userName: 'Sarah Williams',
      runnerId: 'r6',
      runnerName: 'Geoffrey Kamworor',
      points: 50,
      placedAt: '2025-04-21T08:00:00Z',
      groupId: 'group-1',
      groupName: 'Boston Runners Club'
    },
    {
      userId: 'u5',
      userName: 'David Brown',
      runnerId: 'r3',
      runnerName: 'Mo Farah',
      points: 41,
      placedAt: '2025-04-21T08:30:00Z',
      groupId: 'group-1',
      groupName: 'Boston Runners Club'
    }
  ],
  'group-2-3': [ // group-2, race-3 (Boston Marathon - ongoing)
    {
      userId: 'u1',
      userName: 'John Doe',
      runnerId: 'r1',
      runnerName: 'Eliud Kipchoge',
      points: 25,
      placedAt: '2025-04-20T14:00:00Z',
      groupId: 'group-2',
      groupName: 'Weekend Warriors'
    },
    {
      userId: 'u2',
      userName: 'Jane Smith',
      runnerId: 'r2',
      runnerName: 'Kenenisa Bekele',
      points: 32,
      placedAt: '2025-04-20T14:30:00Z',
      groupId: 'group-2',
      groupName: 'Weekend Warriors'
    },
    {
      userId: 'u4',
      userName: 'Sarah Williams',
      runnerId: 'r4',
      runnerName: 'Wilson Kipsang',
      points: 44,
      placedAt: '2025-04-20T15:00:00Z',
      groupId: 'group-2',
      groupName: 'Weekend Warriors'
    }
  ],
  'group-3-3': [ // group-3, race-3 (Boston Marathon - ongoing)
    {
      userId: 'u1',
      userName: 'John Doe',
      runnerId: 'r2',
      runnerName: 'Kenenisa Bekele',
      points: 32,
      placedAt: '2025-04-20T16:00:00Z',
      groupId: 'group-3',
      groupName: 'Elite Marathon Society'
    },
    {
      userId: 'u3',
      userName: 'Mike Johnson',
      runnerId: 'r1',
      runnerName: 'Eliud Kipchoge',
      points: 25,
      placedAt: '2025-04-20T16:15:00Z',
      groupId: 'group-3',
      groupName: 'Elite Marathon Society'
    }
  ]
};

// Mock Group Rankings
export const mockGroupRankings: Record<string, GroupRanking[]> = {
  'group-1': [
    { userId: 'u2', userName: 'Jane Smith', totalPoints: 200, wins: 4, position: 1, groupId: 'group-1' },
    { userId: 'u4', userName: 'Sarah Williams', totalPoints: 180, wins: 3, position: 2, groupId: 'group-1' },
    { userId: 'u3', userName: 'Mike Johnson', totalPoints: 175, wins: 3, position: 3, groupId: 'group-1' },
    { userId: 'u6', userName: 'Emma Davis', totalPoints: 165, wins: 2, position: 4, groupId: 'group-1' },
    { userId: 'u1', userName: 'John Doe', totalPoints: 150, wins: 2, position: 5, groupId: 'group-1' },
    { userId: 'u5', userName: 'David Brown', totalPoints: 125, wins: 1, position: 6, groupId: 'group-1' }
  ],
  'group-2': [
    { userId: 'u2', userName: 'Jane Smith', totalPoints: 145, wins: 3, position: 1, groupId: 'group-2' },
    { userId: 'u4', userName: 'Sarah Williams', totalPoints: 120, wins: 2, position: 2, groupId: 'group-2' },
    { userId: 'u7', userName: 'Robert Taylor', totalPoints: 110, wins: 2, position: 3, groupId: 'group-2' },
    { userId: 'u1', userName: 'John Doe', totalPoints: 95, wins: 1, position: 4, groupId: 'group-2' }
  ],
  'group-3': [
    { userId: 'u1', userName: 'John Doe', totalPoints: 220, wins: 5, position: 1, groupId: 'group-3' },
    { userId: 'u3', userName: 'Mike Johnson', totalPoints: 190, wins: 4, position: 2, groupId: 'group-3' },
    { userId: 'u8', userName: 'Lisa Anderson', totalPoints: 185, wins: 3, position: 3, groupId: 'group-3' }
  ]
};

// Helper function to paginate data
export function paginate<T>(data: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    page,
    pageSize,
    total,
    totalPages
  };
}

// Simulate live race progress updates (using whole kilometers for WebSocket simulation)
export function updateRaceProgress(raceId: string): void {
  const progress = mockRaceProgress[raceId];
  if (!progress) return;

  // Increment every km (simulate getting updates when runners pass km markers)
  if (progress.currentKm < progress.totalKm) {
    progress.currentKm = Math.min(progress.currentKm + 1, progress.totalKm);
  }

  progress.lastUpdate = new Date().toISOString();

  // Update runner positions with variations (some runners progress faster)
  progress.rankings.forEach(ranking => {
    // 70% chance runner advances 1km, 20% chance stays same, 10% chance falls back
    const dice = Math.random();
    if (dice < 0.7) {
      // Advance 1 km
      ranking.currentKm = Math.min(ranking.currentKm + 1, progress.totalKm);
    } else if (dice < 0.9) {
      // Stay at same km (falling behind)
      // No change
    } else {
      // Rare case: runner speeds up and advances 2 km
      ranking.currentKm = Math.min(ranking.currentKm + 2, progress.totalKm);
    }

    // Update estimated time based on progress
    const remainingKm = progress.totalKm - ranking.currentKm;
    const minutesRemaining = remainingKm * 3; // Assume ~3 min per km
    const hours = Math.floor((120 + minutesRemaining) / 60);
    const minutes = Math.floor((120 + minutesRemaining) % 60);
    const seconds = Math.floor(((120 + minutesRemaining) % 1) * 60);
    ranking.estimatedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  // Re-sort rankings by currentKm (descending order - highest km first)
  progress.rankings.sort((a, b) => b.currentKm - a.currentKm);

  // Update positions
  progress.rankings.forEach((ranking, index) => {
    ranking.position = index + 1;
  });
}
