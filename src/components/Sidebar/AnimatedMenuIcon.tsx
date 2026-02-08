import { useEffect, useState } from "react";

interface AnimatedMenuIconProps {
  /** When true, icon shows X (close); when false, shows hamburger (menu). */
  isOpen: boolean;
  size?: number;
  className?: string;
  /** When true, animates from the opposite state on first mount. */
  animateOnMount?: boolean;
}

const lineBase =
  "absolute left-0 right-0 h-0.5 rounded-full bg-current transition-all duration-300 ease-out origin-center";

export function AnimatedMenuIcon({
  isOpen,
  size = 20,
  className = "text-zinc-600",
  animateOnMount = true,
}: AnimatedMenuIconProps) {
  const [visible, setVisible] = useState(animateOnMount ? !isOpen : isOpen);

  useEffect(() => {
    if (!animateOnMount) return;
    const id = requestAnimationFrame(() => {
      setVisible(isOpen);
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, animateOnMount]);

  const showX = animateOnMount ? visible : isOpen;
  const thickness = 2;
  const gap = Math.max(0, (size - thickness * 3) / 2);
  const topY = 0;
  const midY = gap + thickness;
  const botY = gap * 2 + thickness * 2;
  const centerY = size / 2;
  const topCenter = topY + thickness / 2;
  const botCenter = botY + thickness / 2;
  const translateTopToCenter = centerY - topCenter;
  const translateBotToCenter = centerY - botCenter;

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className={lineBase}
        style={{
          width: size,
          top: topY,
          transform: showX
            ? `translateY(${translateTopToCenter}px) rotate(45deg)`
            : "translateY(0) rotate(0deg)",
        }}
      />
      <span
        className={lineBase}
        style={{
          width: size,
          top: midY,
          opacity: showX ? 0 : 1,
          transform: showX ? "scaleX(0)" : "scaleX(1)",
          transition: "opacity 0.2s ease-out, transform 0.3s ease-out",
        }}
      />
      <span
        className={lineBase}
        style={{
          width: size,
          top: botY,
          transform: showX
            ? `translateY(${translateBotToCenter}px) rotate(-45deg)`
            : "translateY(0) rotate(0deg)",
        }}
      />
    </span>
  );
}
