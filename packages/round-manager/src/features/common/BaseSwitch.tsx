import { Switch } from "@headlessui/react";
import { classNames } from "common";
/*
 * BaseSwitch
 * @param {string} activeLabel - Label to show when switch is active
 * @param {string} inactiveLabel - Label to show when switch is inactive
 * @param {boolean} value - Value of the switch
 * @param {function} handler - Handler function to be called when switch is toggled
 * @param {string} testid - Test id for the switch
 * @returns {JSX.Element} - Switch component
 * @example
 * <BaseSwitch activeLabel="Active" inactiveLabel="Inactive" value={true} handler={(bool) => {console.log(bool);}} />
 */
const BaseSwitch = ({
  activeLabel,
  inactiveLabel,
  value,
  handler,
  testid,
}: {
  activeLabel: string;
  inactiveLabel: string;
  value: boolean;
  handler: (a: boolean) => void;
  testid: string;
}) => (
  <Switch.Group
    as="div"
    className={classNames("flex items-center justify-end")}
  >
    <span className="flex-grow">
      <Switch.Label
        as="span"
        className="text-sm font-medium text-gray-900"
        passive
      >
        {value ? (
          <p className="text-xs mr-2 text-right text-violet-400">
            {activeLabel}
          </p>
        ) : (
          <p className="text-xs mr-2 text-right text-grey-400">
            {inactiveLabel}
          </p>
        )}
      </Switch.Label>
    </span>
    <Switch
      data-testid={testid}
      className="focus:outline-0! bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
      onChange={handler}
      value={value.toString()}
      checked={value}
    >
      <span
        aria-hidden="true"
        className={classNames(
          value ? "translate-x-5 bg-violet-400" : "translate-x-0 bg-white",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
        )}
      />
    </Switch>
  </Switch.Group>
);

export default BaseSwitch;
