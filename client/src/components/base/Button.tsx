import { useNavigate } from "react-router-dom";

export enum ButtonVariants {
  primary = "primary",
  outline = "outline",
  danger = "danger",
  outlineDanger = "danger-outline",
}

interface ButtonProps {
  onClick?: () => void;
  path?: string;
  children: React.ReactNode;
  variant: ButtonVariants;
  disabled?: boolean;
  styles?: string[];
}

function Button({ onClick, path, children, variant, disabled, styles }: ButtonProps) {
  const navigate = useNavigate();

  if (onClick === undefined && path !== undefined) {
    onClick = () => navigate(path);
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`base-btn ${variant} ${styles?.join(" ")}`}
      type="button"
    >
      {children}
    </button>
  );
}

export default Button;
