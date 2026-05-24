import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 44,
          border: "4px solid rgba(90, 114, 141, 0.65)",
          background:
            "radial-gradient(circle at 30% 20%, rgba(62, 81, 104, 0.45) 0%, rgba(36, 51, 65, 0.96) 42%, #101820 100%)",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 72,
            height: 72,
            left: 24,
            top: 20,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 108,
            height: 14,
            borderRadius: 7,
            background: "linear-gradient(90deg, #9BB5D1 0%, #D4E4F5 56%, #8CA3BC 100%)",
            transform: "rotate(-45deg)",
            boxShadow: "0 0 1px rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 108,
            height: 14,
            borderRadius: 7,
            background: "linear-gradient(90deg, #9BB5D1 0%, #D4E4F5 56%, #8CA3BC 100%)",
            transform: "rotate(45deg)",
            boxShadow: "0 0 1px rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 26,
            height: 26,
            borderRadius: "999px",
            background: "#0F1C27",
            boxShadow: "0 0 0 2px rgba(110, 136, 163, 0.5)",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
