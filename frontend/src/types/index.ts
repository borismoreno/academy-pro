export type UserRole =
  | 'saas_owner'
  | 'academy_director'
  | 'coach'
  | 'parent';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface Academy {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
}

export interface Member {
  userId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: UserRole;
}

export interface Team {
  id: string;
  academyId: string;
  name: string;
  category: string;
  schedule: string;
  field: string;
  isActive: boolean;
}

export interface Player {
  id: string;
  academyId: string;
  teamId: string;
  fullName: string;
  birthDate: string;
  position: string;
  photoUrl: string | null;
  isActive: boolean;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface Field {
  id: string;
  academyId: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface TeamInfo {
  id: string;
  name: string;
}

export interface PlayerInfo {
  id: string;
  fullName: string;
  position: string | null;
  teamId: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  playerId: string;
  present: boolean;
  createdAt: string;
  player: PlayerInfo;
}

/** Full session with records (returned by GET /attendance/sessions/:id and POST /attendance/sessions) */
export interface Session {
  id: string;
  teamId: string;
  coachId: string;
  sessionDate: string;
  notes: string | null;
  createdAt: string;
  team: TeamInfo;
  records: AttendanceRecord[];
  totalPresent: number;
  totalAbsent: number;
}

/** Session list item — no records array (returned by GET /attendance/sessions) */
export interface SessionListItem {
  id: string;
  teamId: string;
  coachId: string;
  sessionDate: string;
  notes: string | null;
  createdAt: string;
  team: TeamInfo;
  totalPresent: number;
  totalAbsent: number;
}

export interface PlayerAttendanceSummaryItem {
  sessionId: string;
  sessionDate: string;
  present: boolean;
}

export interface PlayerAttendanceSummary {
  playerId: string;
  totalSessions: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  sessions: PlayerAttendanceSummaryItem[];
}

// ─── Evaluations ──────────────────────────────────────────────────────────────

export interface EvaluationScore {
  id: string;
  metricId: string;
  metricName: string;
  score: number;
}

export interface EvaluationPlayerInfo {
  id: string;
  fullName: string;
  position: string | null;
  teamId: string;
}

export interface EvaluationCoachInfo {
  id: string;
  fullName: string;
}

export interface Evaluation {
  id: string;
  playerId: string;
  coachId: string;
  evaluatedAt: string;
  coachNotes: string | null;
  createdAt: string;
  player: EvaluationPlayerInfo;
  coach: EvaluationCoachInfo;
  scores: EvaluationScore[];
}

export interface Metric {
  id: string;
  academyId: string;
  metricName: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface PlayerProgressItem {
  evaluatedAt: string;
  coachNotes: string | null;
  scores: EvaluationScore[];
}

export interface PlayerProgress {
  player: EvaluationPlayerInfo;
  evaluations: PlayerProgressItem[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
