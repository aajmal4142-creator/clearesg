/** Injects white-label CSS variables — overrides --accent only, never data colours. */
export function BrandVars({ primaryColor }: { primaryColor: string | null }) {
  if (!primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    return null;
  }
  const css = `:root, [data-theme] { --accent: ${primaryColor}; --accent-hover: ${primaryColor}; --accent-quiet: color-mix(in srgb, ${primaryColor} 8%, transparent); }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
