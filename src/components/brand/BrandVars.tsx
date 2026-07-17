/** Injects white-label CSS variables from the active organisation brand. */
export function BrandVars({ primaryColor }: { primaryColor: string | null }) {
  if (!primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    return null;
  }
  // Hex only allowed here — token override for white-label (§3 exception: brand injection).
  const css = `:root, [data-theme] { --brand-primary: ${primaryColor}; --signal: ${primaryColor}; }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
