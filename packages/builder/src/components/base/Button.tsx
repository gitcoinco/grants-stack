import { useNavigate } from "react-router-dom";

export enum ButtonVariants {
  primary = "primary",
  secondary = "secondary",
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
  dataTrackEvent?: string;
}

function Button({
  onClick,
  path,
  children,
  variant,
  disabled,
  styles,
  dataTrackEvent,
}: ButtonProps) {
  const navigate = useNavigate();

  const clickHandler = () => {
    if (onClick === undefined && path !== undefined) {
      navigate(path);
    }
    if (onClick) onClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={clickHandler}
      className={`base-btn ${variant} ${styles?.join(" ")}`}
      type="button"
      data-track-event={dataTrackEvent}
    >
      {children}
    </button>
  );
}

export default Button;
