import Button, { ButtonVariants } from "./base/Button";
import Plus from "../icons/plus";
import colors from "../styles/colors";

function Library() {
  return (
    <div>
      <h3>Buttons</h3>
      <div className="flex w-full justify-between">
        <Button
          onClick={() => console.log("button")}
          variant={ButtonVariants.primary}
        >
          <Plus color={colors["quaternary-text"]} /> Primary With Logo
        </Button>
        <Button
          onClick={() => console.log("button")}
          variant={ButtonVariants.primary}
        >
          Primary Button
        </Button>
        <Button
          onClick={() => console.log("button")}
          variant={ButtonVariants.outline}
        >
          Outline Button
        </Button>
        <Button
          onClick={() => console.log("button")}
          variant={ButtonVariants.outline}
        >
          <Plus color={colors["secondary-text"]} /> Outline Logo
        </Button>
        <Button
          onClick={() => console.log("button")}
          variant={ButtonVariants.outlineDanger}
        >
          <Plus color={colors["danger-background"]} /> Danger Outline
        </Button>
        <Button
          onClick={() => console.log("button")}
          variant={ButtonVariants.danger}
        >
          Danger
        </Button>
      </div>
    </div>
  );
}

export default Library;
