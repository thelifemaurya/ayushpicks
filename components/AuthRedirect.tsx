"use client";
import { useEffect } from "react";
// If a Supabase sign-in link lands on any page other than /admin (e.g. because the
// redirect URL was not allow-listed), forward the visitor to /admin with the tokens intact.
export function AuthRedirect() {
  useEffect(() => {
    try {
      const { pathname, search, hash } = window.location;
      if (pathname.startsWith("/admin")) return;
      if (/[#&](access_token|error_code|error_description)=/.test(hash) || /[?&]code=[\w-]{20,}/.test(search)) {
        window.location.replace("/admin" + search + hash);
      }
    } catch {}
  }, []);
  return null;
}
