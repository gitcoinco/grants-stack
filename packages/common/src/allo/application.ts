import { ApplicationStatus } from "data-layer";

function buildRowOfApplicationStatuses({
  rowIndex,
  applications,
  statusToNumber,
  bitsPerStatus,
}: {
  rowIndex: number;
  applications: { index: number; status: ApplicationStatus }[];
  statusToNumber: (status: ApplicationStatus) => bigint;
  bitsPerStatus: number;
}) {
  const applicationsPerRow = 256 / bitsPerStatus;
  const startApplicationIndex = rowIndex * applicationsPerRow;
  let row = 0n;

  for (let columnIndex = 0; columnIndex < applicationsPerRow; columnIndex++) {
    const applicationIndex = startApplicationIndex + columnIndex;
    const application = applications.find(
      (app) => app.index === applicationIndex
    );

    if (application === undefined) {
      continue;
    }

    const status = statusToNumber(application.status);

    const shiftedStatus = status << BigInt(columnIndex * bitsPerStatus);
    row |= shiftedStatus;
  }

  return row;
}

export function buildUpdatedRowsOfApplicationStatuses(args: {
  applicationsToUpdate: {
    index: number;
    status: ApplicationStatus;
  }[];
  currentApplications: {
    index: number;
    status: ApplicationStatus;
  }[];
  statusToNumber: (status: ApplicationStatus) => bigint;
  bitsPerStatus: number;
}): { index: bigint; statusRow: bigint }[] {
  if (args.bitsPerStatus % 2 !== 0) {
    throw new Error("bitsPerStatus must be a multiple of 2");
  }

  const applicationsPerRow = 256 / args.bitsPerStatus;

  const rowsToUpdate = Array.from(
    new Set(
      args.applicationsToUpdate.map(({ index }) => {
        return Math.floor(index / applicationsPerRow);
      })
    )
  );

  const updatedApplications = args.currentApplications.map((app) => {
    const updatedApplication = args.applicationsToUpdate.find(
      (appToUpdate) => appToUpdate.index === app.index
    );

    if (updatedApplication) {
      return { ...app, status: updatedApplication.status };
    }

    return app;
  });

  return rowsToUpdate.map((rowIndex) => {
    return {
      index: BigInt(rowIndex),
      statusRow: buildRowOfApplicationStatuses({
        rowIndex,
        applications: updatedApplications,
        statusToNumber: args.statusToNumber,
        bitsPerStatus: args.bitsPerStatus,
      }),
    };
  });
}
