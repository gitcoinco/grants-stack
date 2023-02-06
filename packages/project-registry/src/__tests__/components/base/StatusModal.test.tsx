import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import StatusModal from "../../../components/base/StatusModal";
import { applicationSteps, grantSteps } from "../../../utils/steps";
import setupStore from "../../../store";
import { renderWrapped } from "../../../utils/test_utils";

describe("<StatusModal /> with applicationSteps", () => {
  const scenarios = [
    {
      error: false,
      currentStep: applicationSteps[0],
      icons: ["current", "waiting", "waiting", "waiting", "waiting", "waiting"],
    },
    {
      error: false,
      currentStep: applicationSteps[1],
      icons: [
        "completed",
        "current",
        "waiting",
        "waiting",
        "waiting",
        "waiting",
      ],
    },
    {
      error: false,
      currentStep: applicationSteps[2],
      icons: [
        "completed",
        "completed",
        "current",
        "waiting",
        "waiting",
        "waiting",
      ],
    },
    {
      error: false,
      currentStep: applicationSteps[3],
      icons: [
        "completed",
        "completed",
        "completed",
        "current",
        "waiting",
        "waiting",
      ],
    },
    {
      error: false,
      currentStep: applicationSteps[4],
      icons: [
        "completed",
        "completed",
        "completed",
        "completed",
        "current",
        "waiting",
      ],
    },
    {
      error: false,
      currentStep: applicationSteps[5],
      icons: [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "current",
      ],
    },

    // with errors

    {
      error: true,
      currentStep: applicationSteps[0],
      icons: ["error", "waiting", "waiting", "waiting", "waiting", "waiting"],
    },
    {
      error: true,
      currentStep: applicationSteps[1],
      icons: ["completed", "error", "waiting", "waiting", "waiting", "waiting"],
    },
    {
      error: true,
      currentStep: applicationSteps[2],
      icons: [
        "completed",
        "completed",
        "error",
        "waiting",
        "waiting",
        "waiting",
      ],
    },
    {
      error: true,
      currentStep: applicationSteps[3],
      icons: [
        "completed",
        "completed",
        "completed",
        "error",
        "waiting",
        "waiting",
      ],
    },
    {
      error: true,
      currentStep: applicationSteps[4],
      icons: [
        "completed",
        "completed",
        "completed",
        "completed",
        "error",
        "waiting",
      ],
    },
    {
      error: true,
      currentStep: applicationSteps[5],
      icons: [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "error",
      ],
    },
  ];

  const scenarioName = (scenario: any, scenarioIndex: number) => {
    if (scenario.error) {
      return `With error on -  ${scenario.currentStep.name} (${scenarioIndex})`;
    }

    return `Without error -  ${scenario.currentStep.name} (${scenarioIndex})`;
  };

  const testName = (step: any, icon: any) =>
    `step ${step.name} should have icon ${icon}`;

  scenarios.forEach((scenario, scenarioIndex) => {
    describe(scenarioName(scenario, scenarioIndex), () => {
      beforeEach(() => {
        renderWrapped(
          <StatusModal
            open
            onClose={() => {}}
            currentStatus={scenario.currentStep.status}
            steps={applicationSteps}
            title="Test Modal Use case."
            error={
              scenario.error
                ? {
                    error: "test error",
                    step: scenario.currentStep.status,
                  }
                : undefined
            }
          />,
          setupStore()
        );
      });

      applicationSteps.forEach((step, index) => {
        test(testName(step, scenario.icons[index]), async () => {
          const stepElement = screen.getByTestId(`step-${step.name}`);
          const iconElement = stepElement.querySelector(".step-icon")!;
          const expectedIcon = scenario.icons[index];
          expect(
            iconElement.classList.contains(`step-icon-${expectedIcon}`)
          ).toEqual(true);
        });
      });
    });
  });
});

describe("<StatusModal /> with grantSteps", () => {
  const scenarios = [
    {
      error: false,
      currentStep: grantSteps[0],
      icons: ["current", "waiting", "waiting", "waiting", "waiting"],
    },
    {
      error: false,
      currentStep: grantSteps[1],
      icons: ["completed", "current", "waiting", "waiting", "waiting"],
    },
    {
      error: false,
      currentStep: grantSteps[2],
      icons: ["completed", "completed", "current", "waiting", "waiting"],
    },

    // with errors

    {
      error: true,
      currentStep: grantSteps[0],
      icons: ["error", "waiting", "waiting", "waiting", "waiting"],
    },
    {
      error: true,
      currentStep: grantSteps[1],
      icons: ["completed", "error", "waiting", "waiting", "waiting"],
    },
    {
      error: true,
      currentStep: grantSteps[2],
      icons: ["completed", "completed", "error", "waiting", "waiting"],
    },
  ];

  const scenarioName = (scenario: any, scenarioIndex: number) => {
    if (scenario.error) {
      return `With error on -  ${scenario.currentStep.name} (${scenarioIndex})`;
    }

    return `Without error -  ${scenario.currentStep.name} (${scenarioIndex})`;
  };

  const testName = (step: any, icon: any) =>
    `step ${step.name} should have icon ${icon}`;

  scenarios.forEach((scenario, scenarioIndex) => {
    describe(scenarioName(scenario, scenarioIndex), () => {
      beforeEach(() => {
        renderWrapped(
          <StatusModal
            open
            onClose={() => {}}
            currentStatus={scenario.currentStep.status}
            steps={grantSteps}
            title="Test Modal Use case."
            error={
              scenario.error
                ? {
                    error: "test error",
                    step: scenario.currentStep.status,
                  }
                : undefined
            }
          />,
          setupStore()
        );
      });

      grantSteps.forEach((step, index) => {
        test(testName(step, scenario.icons[index]), async () => {
          const stepElement = screen.getByTestId(`step-${step.name}`);
          const iconElement = stepElement.querySelector(".step-icon")!;
          const expectedIcon = scenario.icons[index];
          expect(
            iconElement.classList.contains(`step-icon-${expectedIcon}`)
          ).toEqual(true);
        });
      });
    });
  });
});
