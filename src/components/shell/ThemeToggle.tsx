"use client";

import { THEME_COOKIE, type Theme } from "@/lib/theme";

function setThemeCookie(theme: Theme) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next: Theme = current === "dark" ? "light" : "dark";
    setThemeCookie(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="label-caps border border-rule px-2 py-1 text-ink-muted hover:border-rule-strong hover:text-ink"
      aria-label="Toggle colour theme"
    >
      Theme
    </button>
  );
}
