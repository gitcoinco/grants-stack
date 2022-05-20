const buttonTypes = {
  primary: "primary",
  outline: "outline",
};

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant: typeof buttonTypes[keyof typeof buttonTypes];
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
      {children}
    </button>
  );
}

export default Button;
