export enum ButtonVariants {
  primary = "primary",
  outline = "outline",
  danger = "danger",
  outlineDanger = "danger-outline",
}

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant: ButtonVariants;
  disabled?: boolean;
}

function Button({ onClick, children, variant, disabled }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`base-btn ${variant}`}
      type="button"
    >
      <div className="flex">{children}</div>
    </button>
  );
}

export default Button;
