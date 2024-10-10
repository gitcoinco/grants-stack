import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch attestation data based on a transaction hash.
 */
export const useGetImages = (imagesUrls: string[], needFetch: boolean) => {
  return useQuery({
    queryKey: ["fetchImages", imagesUrls],
    enabled: !!imagesUrls && needFetch,
    queryFn: async () => {
      if (!imagesUrls) {
        throw new Error("Image Urls are required");
      }
      const base64Images = [] as string[];
      for (const imageUrl of imagesUrls) {
        if (!imageUrl || imageUrl === "") {
          continue;
        }
        try {
          const response = await fetch(
            `${process.env.REACT_APP_IPFS_BASE_URL}/ipfs/${imageUrl}`,
            {
              method: "GET",
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const blob = await response.blob();
          const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          base64Images.push(base64Image as string);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
      return base64Images;
    },
  });
};
