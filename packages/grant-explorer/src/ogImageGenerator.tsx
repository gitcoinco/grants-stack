import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Helmet } from "react-helmet-async";

interface OGImageGeneratorProps {
  projectId: string;
  roundName: string;
  roundDates: string;
  logo: string;
}

const ipfsGateway = process.env.REACT_APP_IPFS_BASE_URL;

function OGImageGenerator({
  projectId,
  roundName,
  roundDates,
  logo,
}: OGImageGeneratorProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [ogImage, setOgImage] = useState<string>("");

  useEffect(() => {
    if (divRef.current) {
      toPng(divRef.current)
        .then((dataUrl) => {
          setOgImage(dataUrl);
        })
        .catch((err) => console.error("Failed to generate OG image:", err));
    }
  }, [projectId, roundName, roundDates, logo]);

  return (
    <>
      {/* Inject OG meta tags */}
      <Helmet>
        <meta
          property="og:title"
          content={`Project ${projectId} - ${roundName}`}
        />
        <meta property="og:image" content={ogImage} />
        <meta property="twitter:image" content={ogImage} />
      </Helmet>

      {/* Hidden div used to generate OG image */}
      <div
        ref={divRef}
        style={{
          width: "1200px",
          height: "630px",
          display: "none",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Left Side - 1/3 */}
        <div
          style={{
            width: "33.3%",
            // background: "url('https://your-static-background.png') center/cover",
            background: "linear-gradient(to bottom, #000000, #1e293b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Use base64 image for the logo */}
          <img
            src={`${ipfsGateway}/ipfs/${logo}`}
            alt="Project Logo"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "white",
              padding: "10px",
            }}
          />
        </div>

        {/* Right Side - 2/3 */}
        <div
          style={{
            width: "66.6%",
            background: "#1e293b",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <p style={{ fontSize: "24px", margin: "0", opacity: 0.8 }}>
            We're part of
          </p>
          <h1 style={{ fontSize: "50px", margin: "10px 0" }}>{roundName}</h1>
          <p style={{ fontSize: "20px", opacity: 0.8 }}>{roundDates}</p>
        </div>
      </div>
    </>
  );
}

export default OGImageGenerator;
