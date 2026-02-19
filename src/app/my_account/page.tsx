"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { changeMyPasswordApi, fetchMyStaffProfileApi, updateMyStaffPhotoApi, updateMyStaffProfileApi } from "@/lib/staffApi";
import { sendVerificationEmailApi, verifyEmailCodeApi } from "@/lib/authApi";
import { isPasswordChangeRequired, setPasswordChangeRequired } from "@/lib/session";

export default function MyAccountPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);

  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [forcePasswordChange, setForcePasswordChange] = React.useState(false);
  const [verifyEmail, setVerifyEmail] = React.useState("");
  const [verifyCode, setVerifyCode] = React.useState("");
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = React.useState(false);
  const [verifyNotice, setVerifyNotice] = React.useState<string | null>(null);
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [firstPasswordChanged, setFirstPasswordChanged] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const passwordRuleLength: "pass" | "fail" | "idle" =
    newPassword.length === 0 ? "idle" : newPassword.trim().length >= 8 ? "pass" : "fail";
  const passwordRuleDifferent: "pass" | "fail" | "idle" =
    currentPassword.length === 0 || newPassword.length === 0
      ? "idle"
      : currentPassword !== newPassword
      ? "pass"
      : "fail";
  const passwordRuleConfirm: "pass" | "fail" | "idle" =
    confirmPassword.length === 0 || newPassword.length === 0
      ? "idle"
      : newPassword === confirmPassword
      ? "pass"
      : "fail";
  const passwordScore = [passwordRuleLength, passwordRuleDifferent, passwordRuleConfirm].filter((s) => s === "pass").length;
  const passwordScoreValue = (passwordScore / 3) * 100;

  const ruleIcon = (state: "pass" | "fail" | "idle") => {
    if (state === "pass") return <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#16a34a" }} />;
    if (state === "fail") return <HighlightOffRoundedIcon sx={{ fontSize: 16, color: "#dc2626" }} />;
    return <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />;
  };

  const loadProfile = React.useCallback(async () => {
    const me = await fetchMyStaffProfileApi();
    setUsername(me.username ?? "");
    setFullName(me.fullName ?? "");
    setPhone(me.phone ?? "");
    setPhotoUrl(me.photoUrl ?? null);
  }, []);

  React.useEffect(() => {
    const forcedByQuery = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("forcePasswordChange") === "1"
      : false;
    const forcedBySession = isPasswordChangeRequired();
    const required = forcedByQuery || forcedBySession;
    setForcePasswordChange(required);
    setFirstPasswordChanged(false);
    if (required) {
      setPasswordDialogOpen(true);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadProfile();
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "내 계정 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [loadProfile]);

  const handleProfileSave = async () => {
    try {
      setError(null);
      setNotice(null);
      await updateMyStaffProfileApi({ fullName: fullName.trim(), phone: phone.trim() });
      setProfileDialogOpen(false);
      setNotice("내 정보가 저장되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "내 정보 저장에 실패했습니다.");
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword.trim()) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword.trim().length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setError(null);
      setNotice(null);
      await changeMyPasswordApi(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      if (forcePasswordChange) {
        setFirstPasswordChanged(true);
        if (emailVerified) {
          setPasswordDialogOpen(false);
          setPasswordChangeRequired(false);
          setForcePasswordChange(false);
          setVerifyEmail("");
          setVerifyCode("");
          setVerifyNotice(null);
          setEmailVerified(false);
          setNotice("최초 비밀번호 변경 및 본인인증이 완료되었습니다.");
        } else {
          setNotice("비밀번호 변경이 완료되었습니다. 이어서 본인인증을 완료해주세요.");
        }
      } else {
        setPasswordDialogOpen(false);
        setPasswordChangeRequired(false);
        setForcePasswordChange(false);
        setVerifyEmail("");
        setVerifyCode("");
        setVerifyNotice(null);
        setEmailVerified(false);
        setNotice("비밀번호가 변경되었습니다.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "비밀번호 변경에 실패했습니다.");
    }
  };

  const handleSendVerification = async () => {
    try {
      setVerifyLoading(true);
      setVerifyNotice(null);
      setError(null);
      await sendVerificationEmailApi({ email: verifyEmail.trim() });
      setEmailVerified(false);
      setVerifyNotice("인증 코드 메일을 발송했습니다. 수신 메일함을 확인해주세요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증 메일 발송에 실패했습니다.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCheckVerificationCode = async () => {
    try {
      setVerifyCodeLoading(true);
      setVerifyNotice(null);
      setError(null);
      await verifyEmailCodeApi({ email: verifyEmail.trim(), code: verifyCode.trim() });
      setEmailVerified(true);
      setVerifyNotice("이메일 인증이 완료되었습니다.");
      if (forcePasswordChange && firstPasswordChanged) {
        setPasswordDialogOpen(false);
        setPasswordChangeRequired(false);
        setForcePasswordChange(false);
        setVerifyEmail("");
        setVerifyCode("");
        setVerifyNotice(null);
        setEmailVerified(false);
        setNotice("최초 비밀번호 변경 및 본인인증이 완료되었습니다.");
      }
    } catch (e) {
      setEmailVerified(false);
      setError(e instanceof Error ? e.message : "인증 코드 확인에 실패했습니다.");
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  const handlePhotoSave = async () => {
    if (!photoFile) {
      setError("변경할 사진 파일을 선택해주세요.");
      return;
    }

    try {
      setError(null);
      setNotice(null);
      const updated = await updateMyStaffPhotoApi(photoFile);
      setPhotoUrl(updated.photoUrl ?? null);
      setPhotoDialogOpen(false);
      setPhotoFile(null);
      setNotice("프로필 사진이 변경되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "프로필 사진 변경에 실패했습니다.");
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={2.25} sx={{ maxWidth: 920, mx: "auto" }}>
        <Typography sx={{ fontSize: { xs: 34, md: 42 }, fontWeight: 900, letterSpacing: -1 }}>계정정보</Typography>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {notice ? <Alert severity="success">{notice}</Alert> : null}
        {forcePasswordChange ? (
          <Alert severity="warning">
            초기 비밀번호로 로그인했습니다. 보안을 위해 비밀번호를 먼저 변경해주세요.
          </Alert>
        ) : null}

        <Card sx={{ borderRadius: 2, border: "1px solid var(--line)", background: "rgba(255,255,255,0.8)" }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography sx={{ fontSize: 28, fontWeight: 900, mb: 2 }}>프로필</Typography>
            <Stack divider={<Box sx={{ borderTop: "1px solid var(--line)" }} />}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.75 }}>
                <Typography sx={{ width: 120, color: "var(--muted)" }}>프로필 사진</Typography>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
                  <Avatar src={photoUrl ?? undefined} sx={{ width: 38, height: 38 }}>
                    {(fullName || username || "?").charAt(0)}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700 }}>개인 사진 관리</Typography>
                </Stack>
                <Button size="small" onClick={() => setPhotoDialogOpen(true)}>변경</Button>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.75 }}>
                <Typography sx={{ width: 120, color: "var(--muted)" }}>계정 ID</Typography>
                <Typography sx={{ flex: 1, fontWeight: 700 }}>{username}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.75 }}>
                <Typography sx={{ width: 120, color: "var(--muted)" }}>비밀번호</Typography>
                <Typography sx={{ flex: 1, fontWeight: 700 }}>현재 비밀번호 확인 후 변경</Typography>
                <Button size="small" onClick={() => setPasswordDialogOpen(true)}>변경</Button>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.75 }}>
                <Typography sx={{ width: 120, color: "var(--muted)" }}>이름</Typography>
                <Typography sx={{ flex: 1, fontWeight: 700 }}>{fullName || "-"}</Typography>
                <Button size="small" onClick={() => setProfileDialogOpen(true)}>변경</Button>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.75 }}>
                <Typography sx={{ width: 120, color: "var(--muted)" }}>휴대폰</Typography>
                <Typography sx={{ flex: 1, fontWeight: 700 }}>{phone || "-"}</Typography>
                <Button size="small" onClick={() => setProfileDialogOpen(true)}>변경</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Dialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4, border: "1px solid var(--line)" } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>계정정보 수정</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <TextField label="계정 ID" value={username} fullWidth disabled />
              <TextField label="이름" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
              <TextField label="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button onClick={() => setProfileDialogOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={handleProfileSave} disabled={loading}>
              저장
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={photoDialogOpen}
          onClose={() => setPhotoDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4, border: "1px solid var(--line)" } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>프로필 사진 변경</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                JPG/PNG 이미지를 권장합니다.
              </Alert>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Avatar src={photoUrl ?? undefined} sx={{ width: 56, height: 56 }}>
                  {(fullName || username || "?").charAt(0)}
                </Avatar>
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>현재 등록된 사진</Typography>
              </Stack>
              <Button component="label" variant="outlined">
                사진 파일 선택
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                선택 파일: {photoFile?.name ?? "없음"}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button onClick={() => setPhotoDialogOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={handlePhotoSave} disabled={!photoFile}>
              저장
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={passwordDialogOpen}
          onClose={() => {
            if (forcePasswordChange) return;
            setPasswordDialogOpen(false);
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4, border: "1px solid var(--line)" } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>비밀번호 변경</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {forcePasswordChange && firstPasswordChanged
                  ? "비밀번호 변경이 완료되었습니다. 본인인증을 마치면 계정 사용이 가능합니다."
                  : "현재 비밀번호 확인 후 새 비밀번호를 설정합니다."}
              </Alert>
              {forcePasswordChange ? (
                <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.72)" }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 13, fontWeight: 800 }}>최초 로그인 사용자 인증</Typography>
                      {emailVerified ? <Chip size="small" color="success" label="인증 완료" /> : null}
                    </Stack>
                    <TextField
                      size="small"
                      label="인증 이메일"
                      placeholder="example@domain.com"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSendVerification}
                      disabled={verifyLoading || !verifyEmail.trim()}
                    >
                      {verifyLoading ? "메일 발송 중..." : "인증 코드 발송"}
                    </Button>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <TextField
                        size="small"
                        label="인증 코드"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        onClick={handleCheckVerificationCode}
                        disabled={verifyCodeLoading || !verifyEmail.trim() || !verifyCode.trim()}
                      >
                        {verifyCodeLoading ? "확인 중..." : "코드 확인"}
                      </Button>
                    </Stack>
                    {verifyNotice ? <Alert severity="info">{verifyNotice}</Alert> : null}
                  </Stack>
                </Box>
              ) : null}
              <TextField
                type={showCurrentPassword ? "text" : "password"}
                label="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={forcePasswordChange && firstPasswordChanged}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowCurrentPassword((v) => !v)}>
                        {showCurrentPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
              <TextField
                type={showNewPassword ? "text" : "password"}
                label="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={forcePasswordChange && firstPasswordChanged}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowNewPassword((v) => !v)}>
                        {showNewPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={forcePasswordChange && firstPasswordChanged}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowConfirmPassword((v) => !v)}>
                        {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />

              <Box sx={{ px: 0.25 }}>
                <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 0.75 }}>비밀번호 안전도</Typography>
                <LinearProgress
                  variant="determinate"
                  value={passwordScoreValue}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "rgba(0,0,0,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundColor: passwordScore >= 3 ? "#16a34a" : passwordScore >= 2 ? "#f59e0b" : "#2563eb",
                    },
                  }}
                />
              </Box>

              <Stack spacing={0.5} sx={{ px: 0.25 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {ruleIcon(passwordRuleLength)}
                  <Typography sx={{ fontSize: 12, color: passwordRuleLength === "fail" ? "#dc2626" : "var(--muted)" }}>8자 이상 입력</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {ruleIcon(passwordRuleDifferent)}
                  <Typography sx={{ fontSize: 12, color: passwordRuleDifferent === "fail" ? "#dc2626" : "var(--muted)" }}>현재 비밀번호와 다르게 설정</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {ruleIcon(passwordRuleConfirm)}
                  <Typography sx={{ fontSize: 12, color: passwordRuleConfirm === "fail" ? "#dc2626" : "var(--muted)" }}>새 비밀번호 확인 일치</Typography>
                </Stack>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button onClick={() => setPasswordDialogOpen(false)} disabled={forcePasswordChange}>닫기</Button>
            <Button
              variant="contained"
              onClick={handlePasswordSave}
              disabled={forcePasswordChange && firstPasswordChanged}
            >
              {forcePasswordChange && firstPasswordChanged ? "비밀번호 변경 완료" : "변경"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
