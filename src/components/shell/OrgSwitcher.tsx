"use client";

type OrgOption = { id: string; name: string };

export function OrgSwitcher({
  orgs,
  activeOrgId,
}: {
  orgs: OrgOption[];
  activeOrgId: string | null;
}) {
  if (orgs.length === 0) return null;

  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="label-caps">Organisation</span>
      <select
        className="border border-rule bg-surface-1 px-2 py-1 text-ink"
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
