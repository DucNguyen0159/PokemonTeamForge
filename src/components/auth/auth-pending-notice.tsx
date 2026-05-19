type AuthPendingNoticeProps = {
  message: string;
};

export function AuthPendingNotice({ message }: AuthPendingNoticeProps) {
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100"
    >
      {message}
    </p>
  );
}
