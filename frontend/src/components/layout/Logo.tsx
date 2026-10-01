import { T } from "../../lib/theme";

// ── Logo ───────────────────────────────────────────────────────────────────────
// `size` sets default width/height when no className is given.
// When `className` is provided, it overrides the inline style so Tailwind
// responsive classes (e.g. `md:w-8 md:h-8`) win.
export function ThriftLogo({ size = 48, className }: { size?: number; className?: string }) {
  if (className) {
    return (
      <img
        src="https://i.postimg.cc/44tgtTTG/thrift-logo.png"
        alt="thrift it! Logo"
        className={className}
        style={{ objectFit: "contain" }}
      />
    );
  }
  return (
    <img
      src="https://i.postimg.cc/44tgtTTG/thrift-logo.png"
      alt="thrift it! Logo"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
}

// ── Reusable inline check-box matching the brand ──────────────────────────────
export function BrandCheckbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center justify-center rounded transition-all"
      style={{
        width: 20,
        height: 20,
        border: `2px solid ${checked ? T : "#E8D5BC"}`,
        backgroundColor: checked ? T : "transparent",
      }}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1 5.5L4.5 9L10 2" stroke="#FAF0E6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
