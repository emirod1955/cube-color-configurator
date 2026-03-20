import Link from "next/link";

export default function PagoError() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#F4F2EE",
      fontFamily: "'DM Sans', sans-serif",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>😕</div>
      <h1 style={{ fontSize: "2.8rem", fontWeight: 600, color: "#0D0D0D", marginBottom: "1.2rem" }}>
        Algo salió mal
      </h1>
      <p style={{ fontSize: "1.6rem", color: "#6E6A63", maxWidth: "44rem", lineHeight: 1.6, marginBottom: "3.2rem" }}>
        No se pudo procesar el pago. Podés intentarlo de nuevo o
        contactarnos por WhatsApp para coordinar otra forma de pago.
      </p>
      <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/configurar"
          style={{
            padding: "1.2rem 2.8rem",
            background: "#0D0D0D",
            color: "#fff",
            borderRadius: "0.2rem",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: 500,
          }}
        >
          Intentar de nuevo
        </Link>
        <a
          href="https://wa.me/59894394242"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "1.2rem 2.8rem",
            background: "transparent",
            color: "#0D0D0D",
            border: "1px solid #D0CBC1",
            borderRadius: "0.2rem",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: 500,
          }}
        >
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  );
}
