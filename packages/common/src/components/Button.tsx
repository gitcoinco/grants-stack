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
  navigate: (args: any) => void;
}

export function Button({
  onClick,
  path,
  children,
  variant,
  disabled,
  styles,
  navigate,
}: ButtonProps) {
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
    >
      {children}
    </button>
  );
}
