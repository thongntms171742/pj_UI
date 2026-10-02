import React from "react";
import { SOFT, ESPRESSO, T, MUTED } from "../../lib/theme";

interface LetterAvatarProps {
  /** Display name to derive the initial from (uses first character). */
  name?: string;
  /** Optional override initial — used when caller already knows what to show. */
  letter?: string;
  /** Tailwind-style size in pixels. */
  size?: number;
  /** Optional extra class names. */
  className?: string;
  /** Custom background color (defaults to brand SOFT). */
  bg?: string;
  /** Custom text color (defaults to brand ESPRESSO). */
  fg?: string;
  /** Optional title attr for tooltip. */
  title?: string;
}

/**
 * LetterAvatar — zero-dependency circular initial avatar used as a
 * deterministic fallback when no remote avatar URL is available.
 *
 * Avoids any third-party placeholder service (no Unsplash, no Gravatar).
 */
export function LetterAvatar({
  name,
  letter,
  size = 48,
  className = "",
  bg = SOFT,
  fg = ESPRESSO,
  title,
}: LetterAvatarProps) {
  const initial = (letter || name || "?").trim();
  // Use first unicode character (handles Vietnamese diacritics).
  const char = Array.from(initial)[0] || "?";
  const display = char.toUpperCase();

  // Pick font size relative to circle size.
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      role="img"
      aria-label={title || name || "avatar"}
      title={title || name || "avatar"}
      className={`rounded-full flex items-center justify-center font-bold select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: fg,
        fontSize,
        lineHeight: 1,
        border: `1.5px solid ${MUTED}`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {display}
    </div>
  );
}

interface PlaceholderImageProps {
  /** Optional icon element rendered in the placeholder. */
  icon?: React.ReactNode;
  /** Alt text / aria-label. */
  label?: string;
  /** Tailwind-style width (px). */
  width?: number | string;
  /** Tailwind-style height (px). */
  height?: number | string;
  className?: string;
  /** Rounded corner radius in px. */
  radius?: number;
  /** Optional className for the icon. */
  iconClassName?: string;
}

/**
 * PlaceholderImage — neutral, brand-themed box used when a product has no
 * uploaded images. Avoids any third-party placeholder service.
 */
export function PlaceholderImage({
  icon,
  label = "Chưa có ảnh",
  width = "100%",
  height = "100%",
  className = "",
  radius = 12,
  iconClassName = "",
}: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={`flex flex-col items-center justify-center ${className}`}
      style={{
        width,
        height,
        backgroundColor: SOFT,
        border: `1.5px dashed ${MUTED}`,
        borderRadius: radius,
        color: T,
      }}
    >
      {icon && (
        <span className={iconClassName} style={{ display: "inline-flex" }}>
          {icon}
        </span>
      )}
      <span
        style={{
          marginTop: icon ? 6 : 0,
          fontSize: 11,
          fontWeight: 600,
          color: ESPRESSO,
          letterSpacing: 0.2,
          opacity: 0.7,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}