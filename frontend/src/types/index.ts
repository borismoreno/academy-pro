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
  city: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
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
