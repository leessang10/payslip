import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const siteTitle = "대한민국 급여명세서 PDF 생성기";
const siteDescription = "임금근로자/프리랜서 급여명세서를 PDF로 다운로드";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {siteTitle}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#334155",
          }}
        >
          {siteDescription}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: "#64748b",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          PAYSLIP PDF
        </div>
      </div>
    ),
    size
  );
}
