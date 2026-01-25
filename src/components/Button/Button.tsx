type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  type: "button";
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className}`.trim()}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}