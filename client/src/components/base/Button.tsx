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
  styles?: string[];
}

function Button({ onClick, children, variant, disabled, styles }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`base-btn ${variant} ${styles?.join(" ")}`}
      type="button"
    >
      <div className="flex">{children}</div>
    </button>
  );
}

export default Button;
