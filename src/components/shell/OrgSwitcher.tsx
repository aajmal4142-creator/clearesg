"use client";

type OrgOption = { id: string; name: string };

export function OrgSwitcher({
  orgs,
  activeOrgId,
  compact = false,
}: {
  orgs: OrgOption[];
  activeOrgId: string | null;
  compact?: boolean;
}) {
  if (orgs.length === 0) return null;

  return (
    <label
      className={
        compact
          ? "flex flex-col gap-1 text-xs text-ink-muted"
          : "flex items-center gap-2 text-sm text-ink-muted"
      }
    >
      {!compact ? <span className="label-caps">Organisation</span> : null}
      <select
        className="w-full border border-rule bg-surface-1 px-2 py-1 text-ink"
        value={activeOrgId ?? ""}
        onChange={async (e) => {
          await fetch("/api/org/switch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organisationId: e.target.value }),
          });
          window.location.reload();
        }}
      >
        {orgs.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </label>
  );
}
