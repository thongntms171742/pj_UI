import React from "react";
import { Star } from "lucide-react";
import { T, MUTED } from "../../lib/theme";

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  className?: string;
}

/**
 * RatingStars component that accurately renders fractional stars (including 0.5, 0.7, etc.)
 * by clipping filled stars over outline background stars.
 */
export function RatingStars({
  rating,
  size = 14,
  color = T,
  emptyColor = MUTED,
  className = "",
}: RatingStarsProps) {
  const clampedRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fillRatio = Math.max(0, Math.min(1, clampedRating - (i - 1)));

        return (
          <div
            key={i}
            className="relative inline-block select-none"
            style={{ width: size, height: size }}
          >
            {/* Outline background star */}
            <Star
              size={size}
              fill="none"
              stroke={emptyColor}
              strokeWidth={1.5}
              className="absolute inset-0"
            />
            {/* Proportionally clipped filled foreground star */}
            {fillRatio > 0 && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${Math.round(fillRatio * 100)}%` }}
              >
                <Star
                  size={size}
                  fill={color}
                  stroke={color}
                  strokeWidth={1.5}
                  className="max-w-none"
                  style={{ width: size, minWidth: size, height: size }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
