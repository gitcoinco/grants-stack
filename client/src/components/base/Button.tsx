const buttonTypes = {
  primary: "primary",
  outline: "outline",
};

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant: typeof buttonTypes[keyof typeof buttonTypes];
}

function Button({ onClick, children, variant }: ButtonProps) {
  return (
    <button type="button" onClick={onClick} className={`base-btn ${variant}`}>
      {children}
    </button>
  );
}

export default Button;
