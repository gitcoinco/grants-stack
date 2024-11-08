export async function getWhitelistedPrograms(): Promise<string[]> {
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

    return stringArray;
  } catch (error) {
    return [];
  }
}
