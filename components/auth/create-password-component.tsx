'use client';

// Kept for backward compatibility. The real reset flow is implemented in:
// - `app/auth/create-password/page.tsx` (reads token+uid from query)
// - `components/auth/reset-password.tsx` (submits new password to backend)
//
// Some older imports still reference this component; keep it as a safe wrapper.
import ResetPasswordComponent from "@/components/auth/reset-password";

export default ResetPasswordComponent;
