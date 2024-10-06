import html2canvas from "html2canvas-pro";

export const handleGetAttestationPreview = async () => {
  const element = document.getElementById("attestation-impact-frame");
  if (element) {
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");
    return data;
  }
};
