export interface AdminBannerProps {
  saved?: string;
  error?: string;
}

/** Success/error banner used by the content editors (feedback arrives via query params). */
export function AdminBanner({ saved, error }: AdminBannerProps) {
  if (!saved && !error) return null;

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  return (
    <div role="status" className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
      {saved === "deleted" ? "Deleted successfully." : "Saved. The website is already showing your changes."}
    </div>
  );
}
