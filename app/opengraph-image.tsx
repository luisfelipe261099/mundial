import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { business } from "./_data/business";

// Card de compartilhamento (WhatsApp / redes). Gerado por código com next/og —
// muda os dados em business.ts e o preview social se atualiza no próximo build.
export const alt = `${business.name} — oficina de confiança em Curitiba`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b1220";
const BRAND = "#2563eb";
const ACCENT = "#ea580c";

export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/images/logo.png"),
    "base64",
  );
  const logoSrc = `data:image/png;base64,${logo}`;
  const rating = business.rating.toString().replace(".", ",");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: INK,
          backgroundImage: `radial-gradient(900px 520px at 100% -10%, rgba(37,99,235,0.35), transparent 60%), radial-gradient(720px 480px at -5% 110%, rgba(234,88,12,0.28), transparent 55%)`,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cabeçalho: logo + marca */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logoSrc}
            width={92}
            height={92}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
            alt=""
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 24,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: -0.5,
                textTransform: "uppercase",
              }}
            >
              {business.name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginTop: 4,
              }}
            >
              {`${business.address.city}/${business.address.state} · Mecânica para carros`}
            </div>
          </div>
        </div>

        {/* Manchete */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            maxWidth: 940,
          }}
        >
          Oficina de confiança em Curitiba.
        </div>

        {/* Rodapé: chip de nota + tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "18px 28px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              {rating}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: 18,
              }}
            >
              <div style={{ display: "flex", fontSize: 22, color: ACCENT, fontWeight: 700 }}>
                Nota no Google
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "rgba(255,255,255,0.6)",
                  marginTop: 2,
                }}
              >
                {business.reviewCount} avaliações de clientes reais
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Diagnóstico honesto · Preço justo
          </div>
        </div>

        {/* Faixa de marca no rodapé */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 10,
            display: "flex",
            backgroundImage: `linear-gradient(90deg, ${BRAND}, ${ACCENT})`,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
