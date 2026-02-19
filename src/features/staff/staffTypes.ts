export interface StaffListItem {
  id?: number;
  username?: string | null;
  statusCode?: string | null;
  status?: string | null;
  domainRole?: string | null;
  fullName?: string | null;
  officeLocation?: string | null;
  photoKey?: string | null;
  bio?: string | null;
  phone?: string | null;
  deptId?: number | null;
  positionId?: number | null;
  departmentName?: string | null;
  positionName?: string | null;
  photoUrl?: string | null;
}

export interface StaffSelfUpdateReq {
  fullName?: string;
  phone?: string;
  officeLocation?: string;
  bio?: string;
}

export interface AdminStaffUpdateReq {
  username: string;
  fullName?: string | null;
  phone?: string | null;
  officeLocation?: string | null;
  bio?: string | null;
  domainRole?: string | null;
  deptId?: number | null;
  positionId?: number | null;
  statusCode?: string | null;
}

export interface StaffStatusUpdateReq {
  statusCode: string;
  reason?: string;
}

export interface StaffAssignmentUpdateReq {
  deptId?: number | null;
  positionId?: number | null;
  reason?: string;
}

export interface StaffHistoryItem {
  id: number;
  staffId: number;
  eventType?: string | null;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
}

export interface StaffCredentialItem {
  id: number;
  staffId: number;
  credType?: string | null;
  name?: string | null;
  credNumber?: string | null;
  issuer?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  status?: string | null;
  evidenceKey?: string | null;
  evidenceUrl?: string | null;
}

export interface DepartmentOption {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  buildingNo?: string | null;
  floorNo?: string | null;
  roomNo?: string | null;
  extension?: string | null;
  headStaffId?: number | null;
  isActive?: string | null;
  staffCount?: number;
  sortOrder?: number | null;
}

export interface PositionOption {
  id: number;
  title: string;
  positionCode?: string | null;
  description?: string | null;
  isActive?: string | null;
  sortOrder?: number | null;
}

export interface StaffCreateReq {
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  domainRole: string;
  deptId?: number | null;
  positionId?: number | null;
  statusCode?: string;
}

export interface StaffChangeRequestItem {
  id: number;
  staffId: number;
  requestType: string;
  reason?: string | null;
  status: string;
  requestedBy?: string | null;
  requestedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  payload?: string | null;
}

export interface StaffAuditLogItem {
  id: number;
  actionType?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  actor?: string | null;
  actorRole?: string | null;
  reason?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string | null;
}
