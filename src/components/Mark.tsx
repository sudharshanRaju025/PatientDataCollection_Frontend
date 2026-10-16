export function Mark({ size = 42 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="1.2" y="1.2" width="45.6" height="45.6" rx="14" fill="#102833" stroke="#3ee0c2" strokeOpacity="0.75" />
      <path d="M24 13v22M15 23h18" stroke="#3ee0c2" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M16 33c3.2-4.6 12.8-4.6 16 0" stroke="#8eb7ff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}
