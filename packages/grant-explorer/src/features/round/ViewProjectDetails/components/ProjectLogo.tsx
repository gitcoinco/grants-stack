import DefaultLogoImage from "../../../../assets/default_logo.png";

const ipfsGateway = process.env.REACT_APP_IPFS_BASE_URL;

export function ProjectLogo({ logoImg }: { logoImg?: string }) {
  const src = logoImg ? `${ipfsGateway}/ipfs/${logoImg}` : DefaultLogoImage;

  return (
    <img
      className={"-mt-16 h-32 w-32 rounded-full ring-4 ring-white bg-white"}
      src={src}
      alt="Project Logo"
    />
  );
}
