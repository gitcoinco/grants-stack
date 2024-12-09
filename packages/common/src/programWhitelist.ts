export type WhitelistStatus = "Accepted" | "Rejected" | "Pending";

interface ProgramData {
  programId: string;
  whitelistStatus: WhitelistStatus;
}

async function fetchProgramsData(): Promise<ProgramData[]> {
  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxC34V_N3ubt3ycs7LvMya_zYeBmAqTxPczt0yDbLSfpI-kMp6o5E08fC0BxQG4uMp7EPV5bxP-64a/pub?gid=0&single=true&output=csv"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    const stringArray = csvText
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");

    const programsData = stringArray.map((line) => {
      const [programId, whitelistStatus] = line.split(",") as [
        string,
        WhitelistStatus,
      ];
      return { programId, whitelistStatus };
    });

    return programsData;
  } catch (error) {
    console.error("Failed to fetch or process the CSV:", error);
    return [];
  }
}

export async function getWhitelistedPrograms(): Promise<string[]> {
  const programsData = await fetchProgramsData();
  return programsData
    .filter((program) => program.whitelistStatus === "Accepted")
    .map((program) => program.programId);
}

export async function isProgramWhitelisted(
  programId: string
): Promise<boolean> {
  const whitelistedPrograms = await getWhitelistedPrograms();
  return whitelistedPrograms.includes(programId);
}

export async function getAllProgramsData(): Promise<ProgramData[]> {
  return await fetchProgramsData();
}

export async function getProgramWhitelistStatus(
  programId: string
): Promise<WhitelistStatus | null> {
  const programsData = await fetchProgramsData();
  const program = programsData.find(
    (program) => program.programId === programId
  );
  return program ? program.whitelistStatus : null;
}
