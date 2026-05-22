export const queryKeys = {
  // Dashboard
  dashboard: {
    summary: (academyId: string) =>
      ["dashboard", "summary", academyId] as const,
    lowAttendance: (academyId: string) =>
      ["dashboard", "low-attendance", academyId] as const,
  },

  // Teams
  teams: {
    all: () => ["teams"] as const,
    detail: (teamId: string) => ["team", teamId] as const,
  },

  // Players
  players: {
    all: (filters?: { teamId?: string; position?: string }) =>
      filters ? (["players", filters] as const) : (["players"] as const),
    detail: (playerId: string) => ["player", playerId] as const,
    // Pass playerId for specific cache entry, omit to get prefix for broad invalidation
    attendanceSummary: (playerId?: string) =>
      playerId
        ? (["player-attendance", playerId] as const)
        : (["player-attendance"] as const),
    // Pass playerId for specific cache entry, omit to get prefix for broad invalidation
    evaluationProgress: (playerId?: string) =>
      playerId
        ? (["player-evaluations", playerId] as const)
        : (["player-evaluations"] as const),
    seasonStats: (playerId: string, filters?: { teamId?: string }) =>
      filters
        ? (["player-season-stats", playerId, filters] as const)
        : (["player-season-stats", playerId] as const),
  },

  // Attendance
  attendance: {
    sessions: (filters?: Record<string, unknown>) =>
      filters ? (["sessions", filters] as const) : (["sessions"] as const),
    session: (sessionId: string) => ["session", sessionId] as const,
  },

  // Evaluations
  evaluations: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["evaluations", filters] as const)
        : (["evaluations"] as const),
    detail: (evaluationId: string) => ["evaluation", evaluationId] as const,
    metrics: () => ["evaluation-metrics"] as const,
  },

  // Notifications
  notifications: {
    all: (options?: { unreadOnly?: boolean }) =>
      options !== undefined
        ? (["notifications", options] as const)
        : (["notifications"] as const),
    unreadCount: () => ["notifications", "unread-count"] as const,
  },

  // Fields
  fields: {
    all: () => ["fields"] as const,
  },

  // Academies
  academies: {
    all: () => ["academies"] as const,
    coaches: () => ["academy-coaches"] as const,
  },

  // Academy settings
  settings: {
    academy: () => ["academy"] as const,
    members: () => ["members"] as const,
    metrics: () => ["metrics"] as const,
    pendingInvitations: () => ["pending-invitations"] as const,
  },

  // Parent portal
  portal: {
    myPlayers: () => ["my-players"] as const,
    player: (playerId: string) => ["portal-player", playerId] as const,
    attendance: (playerId: string) => ["portal-attendance", playerId] as const,
    progress: (playerId: string) => ["portal-progress", playerId] as const,
    nextSession: (playerId: string) =>
      ["portal-next-session", playerId] as const,
    payments: (academyId: string, playerId: string) =>
      ["portal-payments", academyId, playerId] as const,
    matches: (academyId: string, playerId: string) =>
      ["portal-matches", academyId, playerId] as const,
    seasonStats: (academyId: string, playerId: string) =>
      ["portal-season-stats", academyId, playerId] as const,
  },

  // Owner panel
  owner: {
    stats: () => ["owner-stats"] as const,
    academies: (search?: string) => ["owner-academies", search ?? ""] as const,
    academy: (academyId: string) => ["owner-academy", academyId] as const,
    planLimits: () => ["owner-plan-limits"] as const,
    users: (search?: string) => ["owner-users", search ?? ""] as const,
  },

  // Payments
  payments: {
    all: (academyId: string) => ["payments", academyId] as const,
    concepts: (
      academyId: string,
      filters?: { teamId?: string; search?: string },
    ) =>
      filters
        ? (["payments", "concepts", academyId, filters] as const)
        : (["payments", "concepts", academyId] as const),
    concept: (conceptId: string) => ["payments", "concept", conceptId] as const,
    summary: (academyId: string) => ["payments", "summary", academyId] as const,
  },

  // Auth flows
  auth: {
    verifyEmail: (token: string) => ["verify-email", token] as const,
  },

  // Matches
  matches: {
    all: (academyId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["matches", academyId, filters] as const)
        : (["matches", academyId] as const),
    detail: (matchId: string) => ["match", matchId] as const,
    metrics: (academyId: string) => ["match-metrics", academyId] as const,
  },
} as const;
