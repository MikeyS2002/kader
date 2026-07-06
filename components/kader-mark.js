// Het beeldmerk — een cyclorama-kader met het onderwerp (de groene stip) in beeld.
// Frame gebruikt currentColor, de stip is altijd Chroma-groen.
export function KaderMark({ className }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-label="Kader beeldmerk"
    >
      <path
        d="M14 22 C14 15 19 10 26 10 H94 C101 10 106 15 106 22 V70 C106 96 86 110 60 110 C34 110 14 96 14 70 Z"
        stroke="currentColor"
        strokeWidth="9"
        fill="none"
      />
      <circle cx="60" cy="63" r="11" className="fill-chroma" />
    </svg>
  );
}
