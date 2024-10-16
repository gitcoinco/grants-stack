import html2canvas from "html2canvas-pro";

export const handleGetAttestationPreview = async (frameId: string) => {
  const element = document.getElementById(
    `attestation-impact-frame-${frameId}`
  );
  if (element) {
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");
    return data;
  }
};
