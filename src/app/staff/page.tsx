"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  approveRegisterRequestApi,
  rejectRegisterRequestApi,
} from "@/lib/authApi";

import {
  createDepartmentApi,
  deleteStaffApi,
  createPositionApi,
  createStaffApi,
  createStaffCredentialApi,
  deactivateDepartmentApi,
  deactivatePositionApi,
  checkStaffUsernameApi,
  fetchStaffCredentialsApi,
  fetchDepartmentsApi,
  fetchMyStaffProfileApi,
  fetchPositionsApi,
  fetchStaffHistoryApi,
  fetchStaffListApi,
  changeMyPasswordApi,
  resetStaffPasswordApi,
  updateStaffAssignmentApi,
  updateStaffAdminProfileApi,
  updateStaffStatusApi,
  updateMyStaffPhotoApi,
  updateMyStaffProfileApi,
  updateDepartmentApi,
  updatePositionApi,
} from "@/lib/staffApi";
import { getSessionUser, setPasswordChangeRequired } from "@/lib/session";
import { normalizeRole } from "@/lib/roleAccess";
import { toHistoryEventLabel } from "@/lib/historyLabels";
import type {
  DepartmentOption,
  StaffCreateReq,
  PositionOption,
  StaffCredentialItem,
  StaffHistoryItem,
  StaffListItem,
} from "@/features/staff/staffTypes";

type ProfileForm = {
  fullName: string;
  phone: string;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직" },
  { value: "ON_LEAVE", label: "휴직" },
  { value: "RESIGNED", label: "퇴사" },
  { value: "SUSPENDED", label: "정지" },
];

const STATUS_REASON_OPTIONS = ["신규 입사", "인사 발령", "휴직 처리", "복직 처리", "퇴사 처리", "징계 처리"];
const ASSIGN_REASON_OPTIONS = ["신규 배정", "정기 인사이동", "조직 개편", "결원 대체", "운영 요청 반영"];

const SHAKE_ANIMATION_MS = 340;

const toText = (value?: string | null, fallback = "-") => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const toProfileForm = (staff: StaffListItem | null): ProfileForm => ({
  fullName: staff?.fullName ?? "",
  phone: staff?.phone ?? "",
});

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
};

const formatDepartmentLocation = (dept: DepartmentOption) => {
  const building = toText(dept.buildingNo, "");
  const floor = toText(dept.floorNo, "");
  const room = toText(dept.roomNo, "");
  if (!building && !floor && !room) return "위치 미지정";
  return `${building ? `${building}동 ` : ""}${floor ? `${floor}층 ` : ""}${room ? `${room}호` : ""}`.trim();
};

export default function StaffPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [panelQuery, setPanelQuery] = React.useState("staff");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const [staffs, setStaffs] = React.useState<StaffListItem[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"overview" | "history">("overview");
  const [detailSectionTab, setDetailSectionTab] = React.useState<"profile" | "security" | "credentials" | "admin">("profile");

  const [history, setHistory] = React.useState<StaffHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [credentials, setCredentials] = React.useState<StaffCredentialItem[]>([]);
  const [credentialLoading, setCredentialLoading] = React.useState(false);

  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [positions, setPositions] = React.useState<PositionOption[]>([]);

  const [profileForm, setProfileForm] = React.useState<ProfileForm>(toProfileForm(null));
  const [statusCode, setStatusCode] = React.useState("ACTIVE");
  const [statusReason, setStatusReason] = React.useState("");
  const [assignDeptId, setAssignDeptId] = React.useState<number | "">("");
  const [assignPositionId, setAssignPositionId] = React.useState<number | "">("");
  const [assignReason, setAssignReason] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [credentialFile, setCredentialFile] = React.useState<File | null>(null);
  const [credentialType, setCredentialType] = React.useState<"LICENSE" | "CERT">("LICENSE");
  const [credentialName, setCredentialName] = React.useState("");
  const [credentialNumber, setCredentialNumber] = React.useState("");
  const [credentialIssuer, setCredentialIssuer] = React.useState("");
  const [credentialExpiresAt, setCredentialExpiresAt] = React.useState("");
  const [viewTab, setViewTab] = React.useState<"STAFF" | "DEPARTMENT" | "POSITION" | "APPROVAL">("STAFF");
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [filterStatusCode, setFilterStatusCode] = React.useState("");
  const [filterDeptId, setFilterDeptId] = React.useState<number | "">("");
  const [filterPositionId, setFilterPositionId] = React.useState<number | "">("");

  const [createStaffOpen, setCreateStaffOpen] = React.useState(false);
  const [createStaffForm, setCreateStaffForm] = React.useState<StaffCreateReq>({
    username: "",
    password: "1111",
    fullName: "",
    phone: "",
    domainRole: "STAFF",
    deptId: null,
    positionId: null,
    statusCode: "ACTIVE",
  });

  const [newDepartmentName, setNewDepartmentName] = React.useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = React.useState("");
  const [newDepartmentLocation, setNewDepartmentLocation] = React.useState("");
  const [newDepartmentBuildingNo, setNewDepartmentBuildingNo] = React.useState("");
  const [newDepartmentFloorNo, setNewDepartmentFloorNo] = React.useState("");
  const [newDepartmentRoomNo, setNewDepartmentRoomNo] = React.useState("");
  const [newDepartmentExt, setNewDepartmentExt] = React.useState("");
  const [newDepartmentHeadStaffId, setNewDepartmentHeadStaffId] = React.useState<number | "">("");
  const [newPositionTitle, setNewPositionTitle] = React.useState("");
  const [newPositionCode, setNewPositionCode] = React.useState("");
  const [createDepartmentOpen, setCreateDepartmentOpen] = React.useState(false);
  const [createPositionOpen, setCreatePositionOpen] = React.useState(false);
  const [createStaffShake, setCreateStaffShake] = React.useState(false);
  const [createDepartmentShake, setCreateDepartmentShake] = React.useState(false);
  const [createPositionShake, setCreatePositionShake] = React.useState(false);
  const [validationDialog, setValidationDialog] = React.useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "입력 확인",
    message: "",
  });
  const [staffListTab, setStaffListTab] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [departmentListTab, setDepartmentListTab] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [positionListTab, setPositionListTab] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [departmentKeyword, setDepartmentKeyword] = React.useState("");
  const [positionKeyword, setPositionKeyword] = React.useState("");
  const [usernameCheckLoading, setUsernameCheckLoading] = React.useState(false);
  const [usernameCheckResult, setUsernameCheckResult] = React.useState<"unknown" | "available" | "duplicated">("unknown");

  const [editDepartment, setEditDepartment] = React.useState<DepartmentOption | null>(null);
  const [editPosition, setEditPosition] = React.useState<PositionOption | null>(null);
  const [saveAllLoading, setSaveAllLoading] = React.useState(false);
  const [closeDetailConfirmOpen, setCloseDetailConfirmOpen] = React.useState(false);

  const profileNameInputRef = React.useRef<HTMLInputElement | null>(null);
  const statusReasonInputRef = React.useRef<HTMLInputElement | null>(null);
  const assignReasonInputRef = React.useRef<HTMLInputElement | null>(null);

  const me = React.useMemo(() => getSessionUser(), []);
  const role = normalizeRole(me?.role);
  const isAdmin = role === "ADMIN";
  const isSettingsPage = pathname.startsWith("/staff/setting");
  const isApprovalPage = pathname.startsWith("/staff/approval");

  const selectedStaff = React.useMemo(
    () => staffs.find((staff) => staff.id === selectedId) ?? null,
    [staffs, selectedId]
  );

  const isMeSelected =
    !!selectedStaff?.id && !!me?.staffId && Number(selectedStaff.id) === Number(me.staffId);
  const canEditProfile = Boolean(selectedStaff && (isMeSelected || isAdmin));

  const visibleStaffs = staffs.filter((s) => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (keyword) {
      const haystack = `${s.fullName ?? ""} ${s.username ?? ""} ${s.departmentName ?? ""} ${s.positionName ?? ""}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (filterStatusCode && (s.statusCode ?? "").toUpperCase() !== filterStatusCode.toUpperCase()) return false;
    if (filterDeptId !== "" && Number(s.deptId ?? -1) !== Number(filterDeptId)) return false;
    if (filterPositionId !== "" && Number(s.positionId ?? -1) !== Number(filterPositionId)) return false;
    return true;
  });
  const visibleDepartments = departments.filter((d) => {
    const keyword = departmentKeyword.trim().toLowerCase();
    if (!keyword) return true;
    return `${d.name ?? ""} ${d.extension ?? ""}`.toLowerCase().includes(keyword);
  });
  const visiblePositions = positions.filter((p) => {
    const keyword = positionKeyword.trim().toLowerCase();
    if (!keyword) return true;
    return `${p.title ?? ""} ${p.positionCode ?? ""}`.toLowerCase().includes(keyword);
  });
  const pendingSignupStaffs = staffs.filter(
    (s) => (s.statusCode ?? "").toUpperCase() === "PENDING_APPROVAL" || (s.status ?? "").toUpperCase() === "PENDING_APPROVAL"
  );
  const activeStaffs = visibleStaffs.filter((s) => {
    const status = (s.statusCode ?? s.status ?? "").toUpperCase();
    return status === "ACTIVE";
  });
  const inactiveStaffs = visibleStaffs.filter((s) => {
    const status = (s.statusCode ?? s.status ?? "").toUpperCase();
    return status !== "ACTIVE" && status !== "PENDING_APPROVAL";
  });
  const activeDepartments = visibleDepartments.filter((d) => (d.isActive ?? "Y") === "Y");
  const inactiveDepartments = visibleDepartments.filter((d) => (d.isActive ?? "Y") !== "Y");
  const activePositions = visiblePositions.filter((p) => (p.isActive ?? "Y") === "Y");
  const inactivePositions = visiblePositions.filter((p) => (p.isActive ?? "Y") !== "Y");
  const positionStaffCountMap = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const staff of staffs) {
      if (staff.positionId == null) continue;
      const key = Number(staff.positionId);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [staffs]);

  const departmentStaffCountMap = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const staff of staffs) {
      if (staff.deptId == null) continue;
      const key = Number(staff.deptId);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [staffs]);
  const staffNameById = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const staff of staffs) {
      if (staff.id == null) continue;
      map.set(Number(staff.id), staff.fullName || staff.username || `ID:${staff.id}`);
    }
    return map;
  }, [staffs]);
  const departmentNameById = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const dept of departments) {
      if (dept.id == null) continue;
      map.set(Number(dept.id), dept.name);
    }
    return map;
  }, [departments]);
  const positionNameById = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const position of positions) {
      if (position.id == null) continue;
      map.set(Number(position.id), position.title);
    }
    return map;
  }, [positions]);

  const resolveDepartmentName = React.useCallback(
    (staff: StaffListItem) => {
      if (staff.departmentName) return staff.departmentName;
      if (staff.deptId == null) return "-";
      return departmentNameById.get(Number(staff.deptId)) ?? "-";
    },
    [departmentNameById]
  );

  const resolvePositionName = React.useCallback(
    (staff: StaffListItem) => {
      if (staff.positionName) return staff.positionName;
      if (staff.positionId == null) return "-";
      return positionNameById.get(Number(staff.positionId)) ?? "-";
    },
    [positionNameById]
  );
  const activeCount = staffs.filter((s) => (s.statusCode ?? "").toUpperCase() === "ACTIVE").length;

  React.useEffect(() => {
    if (!isAdmin && pathname === "/staff") {
      router.replace("/staff/notices");
      return;
    }

    if (isSettingsPage) return;
    if (isApprovalPage && isAdmin) {
      setViewTab("APPROVAL");
      return;
    }
    const panel = (panelQuery || "staff").toLowerCase();
    if (panel === "approval") {
      setViewTab("APPROVAL");
      return;
    }
    if (panel === "department" && isAdmin) {
      setViewTab("DEPARTMENT");
      return;
    }
    if (panel === "position" && isAdmin) {
      setViewTab("POSITION");
      return;
    }
    setViewTab("STAFF");
  }, [panelQuery, isAdmin, isSettingsPage, isApprovalPage, pathname, router]);

  React.useEffect(() => {
    if (isSettingsPage) return;
    if (isApprovalPage) return;
    const syncFromUrl = () => {
      const panel = new URLSearchParams(window.location.search).get("panel") || "staff";
      setPanelQuery(panel.toLowerCase());
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [isSettingsPage, isApprovalPage]);

  React.useEffect(() => {
    if (!isSettingsPage) return;
    if (!isAdmin) {
      router.replace("/staff/notices");
      return;
    }
    setViewTab("DEPARTMENT");
  }, [isSettingsPage, isAdmin, router]);

  const moveStaffPanel = React.useCallback((panel: "staff" | "approval") => {
    setPanelQuery(panel);
    router.replace(panel === "staff" ? "/staff" : "/staff/approval");
  }, [router]);
  const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile]);

  const detailDraft = React.useMemo(() => {
    const currentName = (selectedStaff?.fullName ?? "").trim();
    const currentPhone = (selectedStaff?.phone ?? "").trim();
    const nextName = profileForm.fullName.trim();
    const nextPhone = profileForm.phone.trim();
    const profileChanged = currentName !== nextName || currentPhone !== nextPhone;

    const currentStatus = (selectedStaff?.statusCode ?? "ACTIVE").toUpperCase();
    const statusChanged = Boolean(isAdmin && statusCode !== currentStatus);

    const currentDeptId = selectedStaff?.deptId ?? null;
    const currentPositionId = selectedStaff?.positionId ?? null;
    const nextDeptId = assignDeptId === "" ? null : Number(assignDeptId);
    const nextPositionId = assignPositionId === "" ? null : Number(assignPositionId);
    const assignmentChanged = Boolean(isAdmin && (currentDeptId !== nextDeptId || currentPositionId !== nextPositionId));

    return {
      nextName,
      nextPhone,
      nextDeptId,
      nextPositionId,
      profileChanged,
      statusChanged,
      assignmentChanged,
      photoChanged: Boolean(photoFile),
    };
  }, [selectedStaff, profileForm.fullName, profileForm.phone, isAdmin, statusCode, assignDeptId, assignPositionId, photoFile]);

  const hasDetailChanges =
    detailDraft.profileChanged || detailDraft.statusChanged || detailDraft.assignmentChanged || detailDraft.photoChanged;

  const resetDetailDraft = React.useCallback(() => {
    setProfileForm(toProfileForm(selectedStaff));
    setStatusCode((selectedStaff?.statusCode ?? "ACTIVE").toUpperCase());
    setAssignDeptId(selectedStaff?.deptId ?? "");
    setAssignPositionId(selectedStaff?.positionId ?? "");
    setStatusReason("");
    setAssignReason("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPhotoFile(null);
    setCredentialFile(null);
    setCredentialType("LICENSE");
    setCredentialName("");
    setCredentialNumber("");
    setCredentialIssuer("");
    setCredentialExpiresAt("");
  }, [selectedStaff]);

  const requestCloseDetailModal = React.useCallback(() => {
    if (saveAllLoading) return;
    if (hasDetailChanges) {
      setCloseDetailConfirmOpen(true);
      return;
    }
    setDetailModalOpen(false);
  }, [hasDetailChanges, saveAllLoading]);

  const reloadStaffs = React.useCallback(async () => {
    if (!me) return;
    if (isAdmin) {
      const [list, deptList, positionList] = await Promise.all([
        fetchStaffListApi(false),
        fetchDepartmentsApi(false).catch(() => []),
        fetchPositionsApi(false).catch(() => []),
      ]);
      setStaffs(list);
      setDepartments(deptList);
      setPositions(positionList);
      if (!list.length) setSelectedId(null);
      return;
    }

    const myProfile = await fetchMyStaffProfileApi();
    setStaffs([myProfile]);
    if (!selectedId) setSelectedId(myProfile.id ?? null);
  }, [isAdmin, me, selectedId]);

  const triggerModalShake = React.useCallback((setShake: React.Dispatch<React.SetStateAction<boolean>>) => {
    setShake(false);
    window.setTimeout(() => {
      setShake(true);
      window.setTimeout(() => setShake(false), SHAKE_ANIMATION_MS);
    }, 0);
  }, []);

  const openValidationDialog = React.useCallback((title: string, message: string) => {
    setValidationDialog({ open: true, title, message });
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await reloadStaffs();
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "의료진 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [reloadStaffs]);

  React.useEffect(() => {
    resetDetailDraft();
  }, [resetDetailDraft]);

  React.useEffect(() => {
    let mounted = true;
    const loadHistory = async () => {
      if (!selectedStaff?.id) {
        setHistory([]);
        return;
      }
      try {
        setHistoryLoading(true);
        const items = await fetchStaffHistoryApi(selectedStaff.id);
        if (mounted) setHistory(items);
      } catch {
        if (mounted) setHistory([]);
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };
    if (detailModalOpen) {
      void loadHistory();
    }
    return () => {
      mounted = false;
    };
  }, [selectedStaff?.id, detailModalOpen]);

  React.useEffect(() => {
    let mounted = true;
    const loadCredentials = async () => {
      if (!selectedStaff?.id || !detailModalOpen) {
        setCredentials([]);
        return;
      }
      try {
        setCredentialLoading(true);
        const list = await fetchStaffCredentialsApi(selectedStaff.id);
        if (mounted) setCredentials(list);
      } catch {
        if (mounted) setCredentials([]);
      } finally {
        if (mounted) setCredentialLoading(false);
      }
    };
    void loadCredentials();
    return () => {
      mounted = false;
    };
  }, [selectedStaff?.id, detailModalOpen]);

  const handleSaveAll = async () => {
    if (!selectedStaff?.id) return;

    if (!detailDraft.nextName) {
      setError("이름은 필수 입력 항목입니다.");
      profileNameInputRef.current?.focus();
      return;
    }
    if (!hasDetailChanges) {
      setNotice("변경된 항목이 없습니다.");
      return;
    }
    if (detailDraft.statusChanged && !statusReason.trim()) {
      setError("상태 변경 사유를 선택해주세요.");
      statusReasonInputRef.current?.focus();
      return;
    }
    if (detailDraft.assignmentChanged && !assignReason.trim()) {
      setError("배정 변경 사유를 선택해주세요.");
      assignReasonInputRef.current?.focus();
      return;
    }

    try {
      setSaveAllLoading(true);
      setError(null);
      setNotice(null);

      if (detailDraft.profileChanged || detailDraft.photoChanged) {
        if (isAdmin && !isMeSelected) {
          if (!selectedStaff.username) throw new Error("선택한 직원의 계정 정보가 없어 저장할 수 없습니다.");
          await updateStaffAdminProfileApi(selectedStaff.id, {
            username: selectedStaff.username,
            fullName: detailDraft.nextName,
            phone: detailDraft.nextPhone,
            domainRole: selectedStaff.domainRole ?? null,
            deptId: selectedStaff.deptId ?? null,
            positionId: selectedStaff.positionId ?? null,
            statusCode: selectedStaff.statusCode ?? null,
          }, photoFile ?? undefined);
        } else {
          if (detailDraft.profileChanged) {
            await updateMyStaffProfileApi({ fullName: detailDraft.nextName, phone: detailDraft.nextPhone });
          }
          if (detailDraft.photoChanged && photoFile) {
            await updateMyStaffPhotoApi(photoFile);
          }
        }
      }

      if (detailDraft.statusChanged) {
        await updateStaffStatusApi(selectedStaff.id, {
          statusCode,
          reason: statusReason.trim(),
        });
      }
      if (detailDraft.assignmentChanged) {
        await updateStaffAssignmentApi(selectedStaff.id, {
          deptId: detailDraft.nextDeptId,
          positionId: detailDraft.nextPositionId,
          reason: assignReason.trim(),
        });
      }

      await reloadStaffs();
      const historyItems = await fetchStaffHistoryApi(selectedStaff.id);
      setHistory(historyItems);
      setPhotoFile(null);
      const savedItems: string[] = [];
      if (detailDraft.profileChanged || detailDraft.photoChanged) savedItems.push("프로필");
      if (detailDraft.statusChanged) savedItems.push("재직 상태");
      if (detailDraft.assignmentChanged) savedItems.push("부서/직책 배정");
      setNotice(savedItems.length ? `${savedItems.join(", ")} 저장 완료` : "저장 완료");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaveAllLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!selectedStaff?.id) return;
    if (newPassword.trim().length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setError(null);
      setNotice(null);

      if (isAdmin && !isMeSelected) {
        await resetStaffPasswordApi(selectedStaff.id, newPassword);
        setNotice("비밀번호가 즉시 초기화되었습니다.");
      } else {
        if (!currentPassword.trim()) {
          setError("현재 비밀번호를 입력해주세요.");
          return;
        }
        await changeMyPasswordApi(currentPassword, newPassword);
        setPasswordChangeRequired(false);
        setNotice("비밀번호가 변경되었습니다.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "비밀번호 저장에 실패했습니다.");
    }
  };

  const handleCreateCredential = async () => {
    if (!selectedStaff?.id) return;
    try {
      if (!credentialName.trim()) {
        setError("면허/자격명은 필수입니다.");
        return;
      }
      setError(null);
      await createStaffCredentialApi({
        staffId: selectedStaff.id,
        credType: credentialType,
        name: credentialName.trim(),
        credNumber: credentialNumber.trim() || undefined,
        issuer: credentialIssuer.trim() || undefined,
        expiresAt: credentialExpiresAt || undefined,
        file: credentialFile ?? undefined,
      });
      setCredentialType("LICENSE");
      setCredentialName("");
      setCredentialNumber("");
      setCredentialIssuer("");
      setCredentialExpiresAt("");
      setCredentialFile(null);
      setCredentials(await fetchStaffCredentialsApi(selectedStaff.id));
      setNotice("면허/자격 파일이 등록되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "면허/자격 등록에 실패했습니다.");
    }
  };

  const handleCreateStaff = async () => {
    try {
      if (!createStaffForm.username.trim() || !createStaffForm.fullName.trim()) {
        setError("필수 항목(계정 ID, 이름)을 입력해주세요.");
        triggerModalShake(setCreateStaffShake);
        openValidationDialog("필수 입력 누락", "신규 의료진 등록에 필요한 필수 항목(계정 ID, 이름)을 입력해주세요.");
        return;
      }
      if (usernameCheckResult !== "available") {
        setError("계정 ID 중복확인을 먼저 완료해주세요.");
        triggerModalShake(setCreateStaffShake);
        openValidationDialog("중복확인 필요", "계정 ID 중복확인을 완료한 뒤 등록할 수 있습니다.");
        return;
      }
      setError(null);
      setNotice(null);
      await createStaffApi({
        ...createStaffForm,
        username: createStaffForm.username.trim(),
        fullName: createStaffForm.fullName.trim(),
        phone: createStaffForm.phone?.trim() || undefined,
      });
      setCreateStaffOpen(false);
      setCreateStaffForm({
        username: "",
        password: "1111",
        fullName: "",
        phone: "",
        domainRole: "STAFF",
        deptId: null,
        positionId: null,
        statusCode: "ACTIVE",
      });
      await reloadStaffs();
      setNotice("신규 의료진이 등록되었습니다. 초기 비밀번호는 1111이며 최초 로그인 시 변경이 필요합니다.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "의료진 등록에 실패했습니다.";
      setError(message);
      triggerModalShake(setCreateStaffShake);
      openValidationDialog("등록 실패", message);
    }
  };

  const handleCheckUsername = async () => {
    try {
      const username = createStaffForm.username.trim();
      if (!username) {
        setError("중복확인할 계정 ID를 입력해주세요.");
        return;
      }
      setError(null);
      setUsernameCheckLoading(true);
      const exists = await checkStaffUsernameApi(username);
      setUsernameCheckResult(exists ? "duplicated" : "available");
      if (exists) {
        setNotice("이미 사용 중인 계정 ID입니다.");
      } else {
        setNotice("사용 가능한 계정 ID입니다.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "중복확인에 실패했습니다.");
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  const handleApproveSignup = async (staffId: number) => {
    try {
      setError(null);
      await approveRegisterRequestApi(staffId);
      setStaffs((prev) =>
        prev.map((staff) =>
          staff.id === staffId
            ? { ...staff, statusCode: "ACTIVE", status: "ACTIVE" }
            : staff
        )
      );
      setNotice("가입 신청을 승인했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "가입 승인에 실패했습니다.");
    }
  };

  const handleRejectSignup = async (staffId: number) => {
    try {
      setError(null);
      await rejectRegisterRequestApi(staffId);
      setStaffs((prev) =>
        prev.map((staff) =>
          staff.id === staffId
            ? { ...staff, statusCode: "RESIGNED", status: "REJECTED_SIGNUP" }
            : staff
        )
      );
      setNotice("가입 신청을 반려했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "가입 반려에 실패했습니다.");
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!window.confirm("해당 의료진을 삭제(퇴사 처리)하시겠습니까?")) return;
    try {
      setError(null);
      await deleteStaffApi(staffId);
      await reloadStaffs();
      setNotice("의료진을 삭제 처리했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "의료진 삭제에 실패했습니다.");
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm("해당 부서를 삭제하시겠습니까?")) return;
    try {
      await deactivateDepartmentApi(id);
      setDepartments(await fetchDepartmentsApi(false));
      setNotice("부서를 삭제했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "부서 삭제에 실패했습니다.");
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (!window.confirm("해당 직책을 삭제하시겠습니까?")) return;
    try {
      await deactivatePositionApi(id);
      setPositions(await fetchPositionsApi(false));
      setNotice("직책을 삭제했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "직책 삭제에 실패했습니다.");
    }
  };

  const handleCreateDepartment = async () => {
    try {
      if (!newDepartmentName.trim()) {
        setError("부서명을 입력해주세요.");
        triggerModalShake(setCreateDepartmentShake);
        openValidationDialog("필수 입력 누락", "부서 등록을 위해 부서명을 입력해주세요.");
        return false;
      }
      setError(null);
      await createDepartmentApi({
        name: newDepartmentName.trim(),
        description: newDepartmentDescription.trim() || undefined,
        location: newDepartmentLocation.trim() || undefined,
        buildingNo: newDepartmentBuildingNo.trim() || undefined,
        floorNo: newDepartmentFloorNo.trim() || undefined,
        roomNo: newDepartmentRoomNo.trim() || undefined,
        extension: newDepartmentExt.trim() || undefined,
        headStaffId: newDepartmentHeadStaffId === "" ? null : Number(newDepartmentHeadStaffId),
      });
      setNewDepartmentName("");
      setNewDepartmentDescription("");
      setNewDepartmentLocation("");
      setNewDepartmentBuildingNo("");
      setNewDepartmentFloorNo("");
      setNewDepartmentRoomNo("");
      setNewDepartmentExt("");
      setNewDepartmentHeadStaffId("");
      setDepartments(await fetchDepartmentsApi(false));
      setNotice("부서를 등록했습니다.");
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "부서 등록에 실패했습니다.";
      setError(message);
      triggerModalShake(setCreateDepartmentShake);
      openValidationDialog("등록 실패", message);
      return false;
    }
  };

  const handleCreatePosition = async () => {
    try {
      if (!newPositionTitle.trim()) {
        setError("직책명을 입력해주세요.");
        triggerModalShake(setCreatePositionShake);
        openValidationDialog("필수 입력 누락", "직책 등록을 위해 직책명을 입력해주세요.");
        return false;
      }
      setError(null);
      await createPositionApi({ title: newPositionTitle.trim(), positionCode: newPositionCode.trim() || undefined });
      setNewPositionTitle("");
      setNewPositionCode("");
      setPositions(await fetchPositionsApi(false));
      setNotice("직책을 등록했습니다.");
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "직책 등록에 실패했습니다.";
      setError(message);
      triggerModalShake(setCreatePositionShake);
      openValidationDialog("등록 실패", message);
      return false;
    }
  };

  const handleDeactivateDepartment = async (id: number) => {
    try {
      await deactivateDepartmentApi(id);
      setDepartments(await fetchDepartmentsApi(false));
      setNotice("부서를 비활성화했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "부서 비활성화에 실패했습니다.");
    }
  };

  const handleDeactivatePosition = async (id: number) => {
    try {
      await deactivatePositionApi(id);
      setPositions(await fetchPositionsApi(false));
      setNotice("직책을 비활성화했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "직책 비활성화에 실패했습니다.");
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editDepartment?.id) return;
    try {
      if (!editDepartment.name?.trim()) {
        setError("부서명을 입력해주세요.");
        return;
      }
      await updateDepartmentApi(editDepartment.id, {
        name: editDepartment.name.trim(),
        description: editDepartment.description ?? null,
        location: editDepartment.location ?? null,
        extension: editDepartment.extension ?? null,
        headStaffId: editDepartment.headStaffId ?? null,
        sortOrder: editDepartment.sortOrder ?? 0,
        buildingNo: editDepartment.buildingNo ?? null,
        floorNo: editDepartment.floorNo ?? null,
        roomNo: editDepartment.roomNo ?? null,
        isActive: editDepartment.isActive ?? "Y",
      });
      setEditDepartment(null);
      setDepartments(await fetchDepartmentsApi(false));
      setNotice("부서 정보를 수정했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "부서 수정에 실패했습니다.");
    }
  };

  const handleUpdatePosition = async () => {
    if (!editPosition?.id) return;
    try {
      if (!editPosition.title?.trim()) {
        setError("직책명을 입력해주세요.");
        return;
      }
      await updatePositionApi(editPosition.id, {
        title: editPosition.title.trim(),
        positionCode: editPosition.positionCode ?? null,
        description: editPosition.description ?? null,
        sortOrder: editPosition.sortOrder ?? 0,
        isActive: editPosition.isActive ?? "Y",
      });
      setEditPosition(null);
      setPositions(await fetchPositionsApi(false));
      setNotice("직책 정보를 수정했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "직책 수정에 실패했습니다.");
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={3600}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar
          open={Boolean(notice)}
          autoHideDuration={2600}
          onClose={() => setNotice(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => setNotice(null)} severity="success" variant="filled" sx={{ width: "100%" }}>
            {notice}
          </Alert>
        </Snackbar>

        {isSettingsPage ? (
          <Tabs
            value={viewTab === "POSITION" ? "POSITION" : "DEPARTMENT"}
            onChange={(_, v) => setViewTab(v === "POSITION" ? "POSITION" : "DEPARTMENT")}
            sx={{
              bgcolor: "rgba(255,255,255,0.65)",
              borderRadius: 2,
              px: 1,
              border: "1px solid var(--line)",
            }}
          >
            <Tab value="DEPARTMENT" label="부서 관리" />
            <Tab value="POSITION" label="직책 관리" />
          </Tabs>
        ) : (
          <Tabs
            value={viewTab === "APPROVAL" ? "APPROVAL" : "STAFF"}
            onChange={(_, v) => moveStaffPanel(v === "APPROVAL" ? "approval" : "staff")}
            sx={{
              bgcolor: "rgba(255,255,255,0.65)",
              borderRadius: 2,
              px: 1,
              border: "1px solid var(--line)",
            }}
          >
            <Tab value="STAFF" label="의료진" />
            {isAdmin ? <Tab value="APPROVAL" label="가입 승인" /> : null}
          </Tabs>
        )}

            {!isSettingsPage && viewTab === "STAFF" ? (
        <Card sx={{ borderRadius: 3, border: "1px solid var(--line)", minHeight: 540 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography fontWeight={800}>의료진 목록</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip icon={<GroupsOutlinedIcon />} label={`총 ${visibleStaffs.length}명`} size="small" />
                <Chip label={`재직 ${activeCount}명`} size="small" color="success" variant="outlined" />
                {isAdmin ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setUsernameCheckResult("unknown");
                      setCreateStaffOpen(true);
                    }}
                  >
                    신규 등록
                  </Button>
                ) : null}
                <Tooltip title="목록 새로고침">
                  <span>
                    <IconButton size="small" onClick={() => void reloadStaffs()} disabled={loading}>
                      <RefreshRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
                mb: 1.5,
              }}
            >
              <TextField
                size="small"
                label="검색"
                placeholder="이름/계정/부서/직책"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <FormControl size="small">
                <InputLabel id="filter-status-label">상태</InputLabel>
                <Select
                  labelId="filter-status-label"
                  label="상태"
                  value={filterStatusCode}
                  onChange={(e) => setFilterStatusCode(e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel id="filter-dept-label">부서</InputLabel>
                <Select
                  labelId="filter-dept-label"
                  label="부서"
                  value={filterDeptId}
                  onChange={(e) => {
                    const v = String(e.target.value);
                    setFilterDeptId(v === "" ? "" : Number(v));
                  }}
                >
                  <MenuItem value="">전체</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel id="filter-pos-label">직책</InputLabel>
                <Select
                  labelId="filter-pos-label"
                  label="직책"
                  value={filterPositionId}
                  onChange={(e) => {
                    const v = String(e.target.value);
                    setFilterPositionId(v === "" ? "" : Number(v));
                  }}
                >
                  <MenuItem value="">전체</MenuItem>
                  {positions.map((position) => (
                    <MenuItem key={position.id} value={position.id}>{position.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Tabs
              value={staffListTab}
              onChange={(_, v) => setStaffListTab(v === "INACTIVE" ? "INACTIVE" : "ACTIVE")}
              sx={{ mb: 1 }}
            >
              <Tab value="ACTIVE" label={`재직 목록(${activeStaffs.length})`} />
              <Tab value="INACTIVE" label={`비활성 목록(${inactiveStaffs.length})`} />
            </Tabs>

            <Stack spacing={1}>
              {(staffListTab === "ACTIVE" ? activeStaffs : inactiveStaffs).map((staff) => {
                const selected = selectedId === staff.id;
                return (
                  <Box
                    key={staff.id ?? staff.username ?? Math.random()}
                    onClick={() => {
                      setSelectedId(staff.id ?? null);
                      setTab("overview");
                      setDetailSectionTab("profile");
                      setDetailModalOpen(true);
                    }}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: selected ? "rgba(11, 91, 143, 0.08)" : "rgba(255,255,255,0.72)",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={800}>{toText(staff.fullName)}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip label={toText(staff.statusCode, "ACTIVE")} size="small" />
                        {staffListTab === "INACTIVE" && isAdmin ? (
                          <>
                            <Tooltip title="관리">
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedId(staff.id ?? null);
                                  setTab("overview");
                                  setDetailSectionTab("admin");
                                  setDetailModalOpen(true);
                                }}
                              >
                                <ManageAccountsRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="삭제">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (staff.id) void handleDeleteStaff(staff.id);
                                }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </Stack>
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.5 }}>
                      {toText(staff.departmentName)} · {toText(staff.positionName)}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>{toText(staff.username)}</Typography>
                  </Box>
                );
              })}
              {(staffListTab === "ACTIVE" ? activeStaffs : inactiveStaffs).length === 0 && !loading ? (
                <Typography sx={{ color: "var(--muted)", py: 2, textAlign: "center" }}>
                  {staffListTab === "ACTIVE" ? "조회된 의료진이 없습니다." : "비활성 의료진이 없습니다."}
                </Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
        ) : null}

        {viewTab === "DEPARTMENT" ? (
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                <Typography fontWeight={800}>부서 마스터</Typography>
                {isAdmin ? (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setNewDepartmentName("");
                      setNewDepartmentDescription("");
                      setNewDepartmentLocation("");
                      setNewDepartmentBuildingNo("");
                      setNewDepartmentFloorNo("");
                      setNewDepartmentRoomNo("");
                      setNewDepartmentExt("");
                      setNewDepartmentHeadStaffId("");
                      setCreateDepartmentOpen(true);
                    }}
                  >
                    부서 등록
                  </Button>
                ) : null}
              </Stack>
              <TextField
                size="small"
                label="부서 검색"
                placeholder="부서명/내선"
                value={departmentKeyword}
                onChange={(e) => setDepartmentKeyword(e.target.value)}
                sx={{ mb: 1.5, maxWidth: 360 }}
              />
              <Tabs
                value={departmentListTab}
                onChange={(_, v) => setDepartmentListTab(v === "INACTIVE" ? "INACTIVE" : "ACTIVE")}
                sx={{ mb: 1 }}
              >
                <Tab value="ACTIVE" label={`활성 부서(${activeDepartments.length})`} />
                <Tab value="INACTIVE" label={`비활성 부서(${inactiveDepartments.length})`} />
              </Tabs>
              <Stack spacing={1}>
                {(departmentListTab === "ACTIVE" ? activeDepartments : inactiveDepartments).map((dept) => (
                  <Stack
                    key={dept.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={isAdmin && departmentListTab === "ACTIVE" ? () => setEditDepartment(dept) : undefined}
                    sx={{
                      p: 1.25,
                      border: "1px solid var(--line)",
                      borderRadius: 2,
                      cursor: isAdmin && departmentListTab === "ACTIVE" ? "pointer" : "default",
                    }}
                  >
                    <Box>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography fontWeight={700}>{dept.name}</Typography>
                        <Chip size="small" label={`소속 ${departmentStaffCountMap.get(dept.id) ?? dept.staffCount ?? 0}명`} />
                      </Stack>
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                        {formatDepartmentLocation(dept)} · 내선 {toText(dept.extension)} · 부서장 {toText(staffNameById.get(dept.headStaffId ?? -1), "미지정")} · {dept.isActive === "Y" ? "활성" : "비활성"}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {isAdmin ? (
                        <Tooltip title="관리">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditDepartment(dept);
                            }}
                          >
                            <ManageAccountsRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {isAdmin && departmentListTab === "ACTIVE" ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={(departmentStaffCountMap.get(dept.id) ?? dept.staffCount ?? 0) > 0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeactivateDepartment(dept.id);
                          }}
                        >
                          비활성
                        </Button>
                      ) : isAdmin ? (
                        <>
                          <Tooltip title="삭제">
                            <IconButton size="small" color="error" onClick={() => handleDeleteDepartment(dept.id)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : null}
                    </Stack>
                  </Stack>
                ))}
                {(departmentListTab === "ACTIVE" ? activeDepartments : inactiveDepartments).length === 0 ? (
                  <Typography sx={{ color: "var(--muted)", py: 2, textAlign: "center" }}>
                    {departmentListTab === "ACTIVE" ? "활성 부서가 없습니다." : "비활성 부서가 없습니다."}
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {viewTab === "POSITION" ? (
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                <Typography fontWeight={800}>직책 마스터</Typography>
                {isAdmin ? (
                  <Button size="small" variant="contained" onClick={() => setCreatePositionOpen(true)}>
                    직책 등록
                  </Button>
                ) : null}
              </Stack>
              <TextField
                size="small"
                label="직책 검색"
                placeholder="직책명/직책 코드"
                value={positionKeyword}
                onChange={(e) => setPositionKeyword(e.target.value)}
                sx={{ mb: 1.5, maxWidth: 360 }}
              />
              <Tabs
                value={positionListTab}
                onChange={(_, v) => setPositionListTab(v === "INACTIVE" ? "INACTIVE" : "ACTIVE")}
                sx={{ mb: 1 }}
              >
                <Tab value="ACTIVE" label={`활성 직책(${activePositions.length})`} />
                <Tab value="INACTIVE" label={`비활성 직책(${inactivePositions.length})`} />
              </Tabs>
              <Stack spacing={1}>
                {(positionListTab === "ACTIVE" ? activePositions : inactivePositions).map((position) => (
                  <Stack
                    key={position.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={isAdmin && positionListTab === "ACTIVE" ? () => setEditPosition(position) : undefined}
                    sx={{
                      p: 1.25,
                      border: "1px solid var(--line)",
                      borderRadius: 2,
                      cursor: isAdmin && positionListTab === "ACTIVE" ? "pointer" : "default",
                    }}
                  >
                    <Box>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography fontWeight={700}>{position.title}</Typography>
                        <Chip size="small" label={`배정 ${positionStaffCountMap.get(position.id) ?? 0}명`} />
                      </Stack>
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                        코드 {toText(position.positionCode)} · 배정 {positionStaffCountMap.get(position.id) ?? 0}명 · {position.isActive === "Y" ? "활성" : "비활성"}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {isAdmin ? (
                        <Tooltip title="관리">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditPosition(position);
                            }}
                          >
                            <ManageAccountsRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {isAdmin && positionListTab === "ACTIVE" ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={(positionStaffCountMap.get(position.id) ?? 0) > 0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeactivatePosition(position.id);
                          }}
                        >
                          비활성
                        </Button>
                      ) : isAdmin ? (
                        <>
                          <Tooltip title="삭제">
                            <IconButton size="small" color="error" onClick={() => handleDeletePosition(position.id)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : null}
                    </Stack>
                  </Stack>
                ))}
                {(positionListTab === "ACTIVE" ? activePositions : inactivePositions).length === 0 ? (
                  <Typography sx={{ color: "var(--muted)", py: 2, textAlign: "center" }}>
                    {positionListTab === "ACTIVE" ? "활성 직책이 없습니다." : "비활성 직책이 없습니다."}
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {!isSettingsPage && viewTab === "APPROVAL" && isAdmin ? (
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)", minHeight: 420 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography fontWeight={800}>회원가입 승인 대기</Typography>
                <Chip size="small" label={`${pendingSignupStaffs.length}건`} color="warning" />
              </Stack>
              <Stack spacing={1}>
                {pendingSignupStaffs.map((staff) => (
                  <Box key={staff.id} sx={{ p: 1.25, border: "1px solid var(--line)", borderRadius: 2, bgcolor: "rgba(255,255,255,0.72)" }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={800}>{toText(staff.fullName)}</Typography>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.25 }}>
                          아이디: {toText(staff.username)} · 연락처: {toText(staff.phone)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => void handleApproveSignup(staff.id!)}>승인</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => void handleRejectSignup(staff.id!)}>반려</Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
                {!pendingSignupStaffs.length ? (
                  <Typography sx={{ color: "var(--muted)", py: 3, textAlign: "center" }}>승인 대기 중인 가입 신청이 없습니다.</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}
        

        <Dialog
          open={createStaffOpen}
          onClose={() => setCreateStaffOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              ...(createStaffShake
                ? {
                    animation: `modalShake ${SHAKE_ANIMATION_MS}ms ease-in-out`,
                    "@keyframes modalShake": {
                      "0%": { transform: "translateX(0)" },
                      "20%": { transform: "translateX(-6px)" },
                      "40%": { transform: "translateX(6px)" },
                      "60%": { transform: "translateX(-4px)" },
                      "80%": { transform: "translateX(4px)" },
                      "100%": { transform: "translateX(0)" },
                    },
                  }
                : {}),
            },
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Stack spacing={0.5} sx={{ mb: 1.25 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>신규 의료진 등록</Typography>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                기본 계정과 근무 정보를 함께 입력해 바로 업무 배정 가능한 상태로 등록합니다.
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>* 표시는 필수 입력 항목입니다.</Typography>
              <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.72)" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 1 }}>기본 정보</Typography>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="계정 ID"
                    required
                    helperText="영문/숫자 계정을 권장합니다. 등록 전 중복확인을 진행해주세요."
                    value={createStaffForm.username}
                    onChange={(e) => {
                      setCreateStaffForm((p) => ({ ...p, username: e.target.value }));
                      setUsernameCheckResult("unknown");
                    }}
                    fullWidth
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="outlined" size="small" onClick={handleCheckUsername} disabled={usernameCheckLoading || !createStaffForm.username.trim()}>
                      {usernameCheckLoading ? "확인중..." : "중복확인"}
                    </Button>
                    <Typography sx={{ fontSize: 12, color: usernameCheckResult === "duplicated" ? "error.main" : usernameCheckResult === "available" ? "success.main" : "var(--muted)" }}>
                      {usernameCheckResult === "unknown" ? "등록 전 중복확인을 해주세요." : usernameCheckResult === "available" ? "사용 가능한 계정 ID" : "이미 사용 중인 계정 ID"}
                    </Typography>
                  </Stack>
                  <Alert severity="info">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label="초기 비밀번호 1111" />
                      <Typography sx={{ fontSize: 12 }}>최초 로그인 시 비밀번호 변경이 필수입니다.</Typography>
                    </Stack>
                  </Alert>
                  <TextField
                    size="small"
                    label="이름"
                    required
                    helperText="직원 실명을 입력해주세요."
                    value={createStaffForm.fullName}
                    onChange={(e) => setCreateStaffForm((p) => ({ ...p, fullName: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="연락처"
                    helperText="예: 010-1234-5678"
                    value={createStaffForm.phone ?? ""}
                    onChange={(e) => setCreateStaffForm((p) => ({ ...p, phone: e.target.value }))}
                    fullWidth
                  />
                </Stack>
              </Box>

              <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.72)" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 1 }}>근무/권한 정보</Typography>
                <Stack spacing={1}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                    <FormControl size="small" fullWidth required>
                      <InputLabel id="create-role-label">역할</InputLabel>
                      <Select labelId="create-role-label" label="역할" value={createStaffForm.domainRole} onChange={(e) => setCreateStaffForm((p) => ({ ...p, domainRole: e.target.value }))}>
                        <MenuItem value="ADMIN">관리자</MenuItem>
                        <MenuItem value="DOCTOR">의사</MenuItem>
                        <MenuItem value="NURSE">간호사</MenuItem>
                        <MenuItem value="RECEPTION">원무</MenuItem>
                        <MenuItem value="STAFF">일반 직원</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth required>
                      <InputLabel id="create-status-label">상태</InputLabel>
                      <Select labelId="create-status-label" label="상태" value={createStaffForm.statusCode ?? "ACTIVE"} onChange={(e) => setCreateStaffForm((p) => ({ ...p, statusCode: e.target.value }))}>
                        {STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="create-dept-label">부서</InputLabel>
                      <Select
                        labelId="create-dept-label"
                        label="부서"
                        value={createStaffForm.deptId ?? ""}
                        onChange={(e) => {
                          const v = String(e.target.value);
                          setCreateStaffForm((p) => ({ ...p, deptId: v === "" ? null : Number(v) }));
                        }}
                      >
                        <MenuItem value="">미배정</MenuItem>
                        {departments.filter((d) => d.isActive === "Y").map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="create-pos-label">직책</InputLabel>
                      <Select
                        labelId="create-pos-label"
                        label="직책"
                        value={createStaffForm.positionId ?? ""}
                        onChange={(e) => {
                          const v = String(e.target.value);
                          setCreateStaffForm((p) => ({ ...p, positionId: v === "" ? null : Number(v) }));
                        }}
                      >
                        <MenuItem value="">미배정</MenuItem>
                        {positions.filter((d) => d.isActive === "Y").map((position) => (
                          <MenuItem key={position.id} value={position.id}>{position.title}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              </Box>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                <Button onClick={() => setCreateStaffOpen(false)}>닫기</Button>
                <Button
                  variant="contained"
                  onClick={handleCreateStaff}
                  disabled={!createStaffForm.username.trim() || !createStaffForm.fullName.trim() || usernameCheckResult !== "available"}
                >
                  등록
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Dialog>

        <Dialog
          open={createDepartmentOpen}
          onClose={() => setCreateDepartmentOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              ...(createDepartmentShake
                ? {
                    animation: `modalShake ${SHAKE_ANIMATION_MS}ms ease-in-out`,
                    "@keyframes modalShake": {
                      "0%": { transform: "translateX(0)" },
                      "20%": { transform: "translateX(-6px)" },
                      "40%": { transform: "translateX(6px)" },
                      "60%": { transform: "translateX(-4px)" },
                      "80%": { transform: "translateX(4px)" },
                      "100%": { transform: "translateX(0)" },
                    },
                  }
                : {}),
            },
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.25 }}>부서 등록</Typography>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>* 표시는 필수 입력 항목입니다.</Typography>
              <TextField
                size="small"
                label="부서명"
                required
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="부서 설명"
                value={newDepartmentDescription}
                onChange={(e) => setNewDepartmentDescription(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="위치 설명"
                value={newDepartmentLocation}
                onChange={(e) => setNewDepartmentLocation(e.target.value)}
                fullWidth
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField size="small" label="건물번호" value={newDepartmentBuildingNo} onChange={(e) => setNewDepartmentBuildingNo(e.target.value)} fullWidth />
                <TextField size="small" label="층" value={newDepartmentFloorNo} onChange={(e) => setNewDepartmentFloorNo(e.target.value)} sx={{ width: { md: 120 } }} />
                <TextField size="small" label="호실" value={newDepartmentRoomNo} onChange={(e) => setNewDepartmentRoomNo(e.target.value)} sx={{ width: { md: 140 } }} />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField size="small" label="내선번호" value={newDepartmentExt} onChange={(e) => setNewDepartmentExt(e.target.value)} fullWidth />
                <FormControl size="small" fullWidth>
                  <InputLabel id="new-dept-head-label">담당 부서장</InputLabel>
                  <Select
                    labelId="new-dept-head-label"
                    label="담당 부서장"
                    value={newDepartmentHeadStaffId}
                    onChange={(e) => {
                      const v = String(e.target.value);
                      setNewDepartmentHeadStaffId(v === "" ? "" : Number(v));
                    }}
                  >
                    <MenuItem value="">미지정</MenuItem>
                    {staffs.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id ?? ""}>
                        {toText(staff.fullName)} ({toText(staff.username)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                <Button onClick={() => setCreateDepartmentOpen(false)}>닫기</Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    const ok = await handleCreateDepartment();
                    if (ok) setCreateDepartmentOpen(false);
                  }}
                >
                  등록
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Dialog>

        <Dialog
          open={createPositionOpen}
          onClose={() => setCreatePositionOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              ...(createPositionShake
                ? {
                    animation: `modalShake ${SHAKE_ANIMATION_MS}ms ease-in-out`,
                    "@keyframes modalShake": {
                      "0%": { transform: "translateX(0)" },
                      "20%": { transform: "translateX(-6px)" },
                      "40%": { transform: "translateX(6px)" },
                      "60%": { transform: "translateX(-4px)" },
                      "80%": { transform: "translateX(4px)" },
                      "100%": { transform: "translateX(0)" },
                    },
                  }
                : {}),
            },
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.25 }}>직책 등록</Typography>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>* 표시는 필수 입력 항목입니다.</Typography>
              <TextField
                size="small"
                label="직책명"
                required
                value={newPositionTitle}
                onChange={(e) => setNewPositionTitle(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="직책 코드"
                value={newPositionCode}
                onChange={(e) => setNewPositionCode(e.target.value)}
                fullWidth
              />
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                <Button onClick={() => setCreatePositionOpen(false)}>닫기</Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    const ok = await handleCreatePosition();
                    if (ok) setCreatePositionOpen(false);
                  }}
                >
                  등록
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Dialog>

        <Dialog open={Boolean(editDepartment)} onClose={() => setEditDepartment(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
          <Box sx={{ p: 2.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.25 }}>부서 정보 수정</Typography>
            <Stack spacing={1}>
              <TextField
                size="small"
                label="부서명"
                value={editDepartment?.name ?? ""}
                onChange={(e) => setEditDepartment((p) => (p ? { ...p, name: e.target.value } : p))}
                fullWidth
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="부서 설명"
                  value={editDepartment?.description ?? ""}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, description: e.target.value } : p))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="정렬순"
                  value={editDepartment?.sortOrder ?? 0}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, sortOrder: Number(e.target.value || 0) } : p))}
                  sx={{ width: { md: 140 } }}
                />
              </Stack>
              <TextField
                size="small"
                label="위치 설명"
                value={editDepartment?.location ?? ""}
                onChange={(e) => setEditDepartment((p) => (p ? { ...p, location: e.target.value } : p))}
                fullWidth
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="건물번호"
                  value={editDepartment?.buildingNo ?? ""}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, buildingNo: e.target.value } : p))}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="층"
                  value={editDepartment?.floorNo ?? ""}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, floorNo: e.target.value } : p))}
                  sx={{ width: { md: 120 } }}
                />
                <TextField
                  size="small"
                  label="호실"
                  value={editDepartment?.roomNo ?? ""}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, roomNo: e.target.value } : p))}
                  sx={{ width: { md: 140 } }}
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="내선번호"
                  value={editDepartment?.extension ?? ""}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, extension: e.target.value } : p))}
                  fullWidth
                />
                <FormControl size="small" fullWidth>
                  <InputLabel id="edit-dept-head-label">담당 부서장</InputLabel>
                  <Select
                    labelId="edit-dept-head-label"
                    label="담당 부서장"
                    value={editDepartment?.headStaffId ?? ""}
                    onChange={(e) => {
                      const v = String(e.target.value);
                      setEditDepartment((p) => (p ? { ...p, headStaffId: v === "" ? null : Number(v) } : p));
                    }}
                  >
                    <MenuItem value="">미지정</MenuItem>
                    {staffs.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id ?? ""}>
                        {toText(staff.fullName)} ({toText(staff.username)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <FormControl size="small" fullWidth>
                <InputLabel id="edit-dept-active-label">상태</InputLabel>
                <Select
                  labelId="edit-dept-active-label"
                  label="상태"
                  value={editDepartment?.isActive ?? "Y"}
                  onChange={(e) => setEditDepartment((p) => (p ? { ...p, isActive: e.target.value } : p))}
                >
                  <MenuItem value="Y">활성</MenuItem>
                  <MenuItem value="N">비활성</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                <Button onClick={() => setEditDepartment(null)}>닫기</Button>
                <Button variant="contained" onClick={handleUpdateDepartment}>저장</Button>
              </Stack>
            </Stack>
          </Box>
        </Dialog>

        <Dialog open={Boolean(editPosition)} onClose={() => setEditPosition(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
          <Box sx={{ p: 2.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.25 }}>직책 정보 수정</Typography>
            <Stack spacing={1}>
              <TextField
                size="small"
                label="직책명"
                value={editPosition?.title ?? ""}
                onChange={(e) => setEditPosition((p) => (p ? { ...p, title: e.target.value } : p))}
                fullWidth
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="직책 코드"
                  value={editPosition?.positionCode ?? ""}
                  onChange={(e) => setEditPosition((p) => (p ? { ...p, positionCode: e.target.value } : p))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="정렬순"
                  value={editPosition?.sortOrder ?? 0}
                  onChange={(e) => setEditPosition((p) => (p ? { ...p, sortOrder: Number(e.target.value || 0) } : p))}
                  sx={{ width: { md: 140 } }}
                />
              </Stack>
              <FormControl size="small" fullWidth>
                <InputLabel id="edit-pos-active-label">상태</InputLabel>
                <Select
                  labelId="edit-pos-active-label"
                  label="상태"
                  value={editPosition?.isActive ?? "Y"}
                  onChange={(e) => setEditPosition((p) => (p ? { ...p, isActive: e.target.value } : p))}
                >
                  <MenuItem value="Y">활성</MenuItem>
                  <MenuItem value="N">비활성</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                <Button onClick={() => setEditPosition(null)}>닫기</Button>
                <Button variant="contained" onClick={handleUpdatePosition}>저장</Button>
              </Stack>
            </Stack>
          </Box>
        </Dialog>

        <Dialog
          open={detailModalOpen && Boolean(selectedStaff)}
          onClose={requestCloseDetailModal}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
            },
          }}
        >
          {selectedStaff ? (
            <Box sx={{ p: 2.25 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={photoPreviewUrl ?? selectedStaff.photoUrl ?? undefined}
                    sx={{
                      width: { xs: 72, md: 92 },
                      height: { xs: 72, md: 92 },
                      border: "2px solid var(--line)",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    {(selectedStaff.fullName || selectedStaff.username || "?").charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 22, fontWeight: 900 }}>{toText(selectedStaff.fullName)}</Typography>
                    <Typography sx={{ color: "var(--muted)" }}>
                      {toText(selectedStaff.departmentName)} / {toText(selectedStaff.positionName)}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      {photoPreviewUrl ? "선택한 새 사진 미리보기" : "현재 프로필 사진"}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Chip label={toText(selectedStaff.statusCode, "ACTIVE")} size="small" color="primary" />
                  <IconButton onClick={requestCloseDetailModal}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider sx={{ mt: 1.25, mb: 1.25 }} />

              <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mt: 1.5 }}>
                <Tab value="overview" label="기본/운영" />
                <Tab value="history" icon={<HistoryOutlinedIcon />} iconPosition="start" label="변경 이력" />
              </Tabs>
              <Divider sx={{ mb: 2 }} />

              {tab === "overview" ? (
                <Stack spacing={2.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                      변경 후 저장은 아래 버튼 한 번으로 처리됩니다.
                    </Typography>
                    <Tooltip title="즉시 저장">
                      <span>
                        <IconButton
                          onClick={handleSaveAll}
                          disabled={!selectedStaff || !hasDetailChanges || saveAllLoading}
                          sx={{ bgcolor: "rgba(11, 91, 143, 0.1)" }}
                        >
                          {saveAllLoading ? (
                            <CircularProgress size={18} sx={{ color: "var(--brand)" }} />
                          ) : (
                            <SaveRoundedIcon sx={{ color: "var(--brand)" }} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>

                  <Tabs
                    value={detailSectionTab}
                    onChange={(_, next) => setDetailSectionTab(next)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mt: -0.5 }}
                  >
                    <Tab value="profile" label="프로필" />
                    <Tab value="security" label="보안" />
                    <Tab value="credentials" label="자격/파일" />
                    {isAdmin ? <Tab value="admin" label="운영 관리" /> : null}
                  </Tabs>

                  {detailSectionTab === "profile" ? (
                    <Stack spacing={2}>
                      <Box>
                        <Typography fontWeight={800}>프로필 정보</Typography>
                        <Box
                          sx={{
                            mt: 1,
                            display: "grid",
                            gap: 1,
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          }}
                        >
                          <TextField
                            label="이름"
                            required
                            inputRef={profileNameInputRef}
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                            fullWidth
                            disabled={!canEditProfile}
                          />
                          <TextField
                            label="연락처"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                            fullWidth
                            disabled={!canEditProfile}
                          />
                        </Box>
                      </Box>

                      {isAdmin || isMeSelected ? (
                        <Box>
                          <Typography fontWeight={800}>프로필 사진(MinIO)</Typography>
                          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1 }}>
                            <Button variant="outlined" component="label" size="small">
                              사진 선택
                              <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                              />
                            </Button>
                            <Typography sx={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>
                              {photoFile ? photoFile.name : "선택된 파일 없음"}
                            </Typography>
                          </Stack>
                          {selectedStaff.photoUrl ? (
                            <Typography sx={{ fontSize: 12, mt: 0.75 }}>
                              현재 사진: <a href={selectedStaff.photoUrl} target="_blank" rel="noreferrer">열기</a>
                            </Typography>
                          ) : null}
                        </Box>
                      ) : null}
                    </Stack>
                  ) : null}

                  {detailSectionTab === "security" ? (
                  <Box>
                    <Typography fontWeight={800}>비밀번호 {isAdmin && !isMeSelected ? "즉시 초기화" : "변경"}</Typography>
                    <Box
                      sx={{
                        mt: 1,
                        display: "grid",
                        gap: 1,
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      }}
                    >
                      {!isAdmin || isMeSelected ? (
                        <TextField
                          type="password"
                          label="현재 비밀번호"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          fullWidth
                        />
                      ) : null}
                      <TextField
                        type="password"
                        label="새 비밀번호"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        type="password"
                        label="새 비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.25 }}>
                      <Tooltip title={isAdmin && !isMeSelected ? "비밀번호 즉시 초기화" : "비밀번호 변경"}>
                        <span>
                          <IconButton onClick={handlePasswordSave} sx={{ bgcolor: "rgba(11, 91, 143, 0.1)" }}>
                            <LockResetRoundedIcon sx={{ color: "var(--brand)" }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Box>
                  ) : null}

                  {detailSectionTab === "credentials" ? (
                  <Box>
                    <Typography fontWeight={800}>면허/자격 파일(MinIO)</Typography>
                    {isAdmin ? (
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="credential-type-label">유형</InputLabel>
                            <Select
                              labelId="credential-type-label"
                              label="유형"
                              value={credentialType}
                              onChange={(e) => setCredentialType(e.target.value as "LICENSE" | "CERT")}
                            >
                              <MenuItem value="LICENSE">면허</MenuItem>
                              <MenuItem value="CERT">자격</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField size="small" label="명칭" value={credentialName} onChange={(e) => setCredentialName(e.target.value)} fullWidth />
                          <TextField size="small" label="번호" value={credentialNumber} onChange={(e) => setCredentialNumber(e.target.value)} fullWidth />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField size="small" label="발급기관" value={credentialIssuer} onChange={(e) => setCredentialIssuer(e.target.value)} fullWidth />
                          <TextField size="small" type="date" label="만료일" InputLabelProps={{ shrink: true }} value={credentialExpiresAt} onChange={(e) => setCredentialExpiresAt(e.target.value)} sx={{ width: { md: 180 } }} />
                          <Button variant="outlined" component="label" size="small">
                            파일 선택
                            <input hidden type="file" onChange={(e) => setCredentialFile(e.target.files?.[0] ?? null)} />
                          </Button>
                          <Button variant="contained" size="small" onClick={handleCreateCredential}>파일 등록</Button>
                        </Stack>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                          {credentialFile ? `선택 파일: ${credentialFile.name}` : "선택된 파일 없음"}
                        </Typography>
                      </Stack>
                    ) : null}
                    <Stack spacing={0.75} sx={{ mt: 1 }}>
                      {credentialLoading ? (
                        <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>자격 파일 조회 중...</Typography>
                      ) : credentials.length ? (
                        credentials.map((item) => (
                          <Box key={item.id} sx={{ p: 1, border: "1px solid var(--line)", borderRadius: 1.5 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                              [{item.credType === "LICENSE" ? "면허" : "자격"}] {toText(item.name)}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                              {toText(item.issuer)} · 만료 {formatDateTime(item.expiresAt)}
                            </Typography>
                            {item.evidenceUrl ? (
                              <Typography sx={{ fontSize: 12 }}>
                                <a href={item.evidenceUrl} target="_blank" rel="noreferrer">첨부파일 열기</a>
                              </Typography>
                            ) : null}
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>등록된 면허/자격 파일이 없습니다.</Typography>
                      )}
                    </Stack>
                  </Box>
                  ) : null}

                  {isAdmin && detailSectionTab === "admin" ? (
                    <>
                      <Divider />
                      <Box>
                        <Typography fontWeight={800}>재직 상태 변경</Typography>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1 }}>
                          <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="status-code-label">상태</InputLabel>
                            <Select
                              labelId="status-code-label"
                              label="상태"
                              value={statusCode}
                              onChange={(e) => setStatusCode(e.target.value)}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel id="status-reason-label">변경 사유</InputLabel>
                            <Select
                              labelId="status-reason-label"
                              label="변경 사유"
                              inputRef={statusReasonInputRef}
                              value={statusReason}
                              onChange={(e) => setStatusReason(e.target.value)}
                            >
                              <MenuItem value="">사유 선택</MenuItem>
                              {STATUS_REASON_OPTIONS.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                  {reason}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography fontWeight={800}>부서/직책 배정 변경</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                            <FormControl fullWidth>
                              <InputLabel id="dept-select-label">부서</InputLabel>
                              <Select
                                labelId="dept-select-label"
                                value={assignDeptId}
                                label="부서"
                                onChange={(e) => {
                                  const value = String(e.target.value);
                                  setAssignDeptId(value === "" ? "" : Number(value));
                                }}
                              >
                                <MenuItem value="">미배정</MenuItem>
                                {departments.map((dept) => (
                                  <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl fullWidth>
                              <InputLabel id="position-select-label">직책</InputLabel>
                              <Select
                                labelId="position-select-label"
                                value={assignPositionId}
                                label="직책"
                                onChange={(e) => {
                                  const value = String(e.target.value);
                                  setAssignPositionId(value === "" ? "" : Number(value));
                                }}
                              >
                                <MenuItem value="">미배정</MenuItem>
                                {positions.map((position) => (
                                  <MenuItem key={position.id} value={position.id}>
                                    {position.title}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>
                          <FormControl fullWidth>
                            <InputLabel id="assignment-reason-label">배정 변경 사유</InputLabel>
                            <Select
                              labelId="assignment-reason-label"
                              label="배정 변경 사유"
                              inputRef={assignReasonInputRef}
                              value={assignReason}
                              onChange={(e) => setAssignReason(e.target.value)}
                            >
                              <MenuItem value="">사유 선택</MenuItem>
                              {ASSIGN_REASON_OPTIONS.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                  {reason}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>
                    </>
                  ) : null}
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Typography fontWeight={800}>변경 이력</Typography>
                  {historyLoading ? (
                    <Typography sx={{ color: "var(--muted)" }}>이력 동기화 중...</Typography>
                  ) : history.length ? (
                    history.map((item) => (
                      <Box
                        key={`${item.id}-${item.changedAt}`}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: "1px solid var(--line)",
                          bgcolor: "rgba(255,255,255,0.72)",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography fontWeight={800}>{toHistoryEventLabel(item.eventType)}</Typography>
                          <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                            {formatDateTime(item.changedAt)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                          {toText(item.fieldName)}: {toText(item.oldValue)} → {toText(item.newValue)}
                        </Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                          변경자: {toText(item.changedBy)} / 사유: {toText(item.reason)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ color: "var(--muted)" }}>기록된 이력이 없습니다.</Typography>
                  )}
                </Stack>
              )}
            </Box>
          ) : null}
        </Dialog>

        <Dialog
          open={validationDialog.open}
          onClose={() => setValidationDialog((prev) => ({ ...prev, open: false }))}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>{validationDialog.title}</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>{validationDialog.message}</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setValidationDialog((prev) => ({ ...prev, open: false }))}
            >
              확인
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={closeDetailConfirmOpen}
          onClose={() => setCloseDetailConfirmOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>변경사항이 있습니다</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
              저장하지 않은 변경사항이 있습니다. 닫으면 입력한 내용이 사라집니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button onClick={() => setCloseDetailConfirmOpen(false)}>계속 편집</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                resetDetailDraft();
                setCloseDetailConfirmOpen(false);
                setDetailModalOpen(false);
              }}
            >
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
