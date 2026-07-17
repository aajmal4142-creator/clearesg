export const THEME_COOKIE = "clearesg-theme";

export type Theme = "light" | "dark";

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark";
}

/** Inline script — runs before paint; cookie wins, else prefers-color-scheme (first visit). */
export const THEME_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
