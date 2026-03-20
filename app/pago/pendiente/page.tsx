import Link from "next/link";

export default function PagoPendiente() {
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
      <div style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>⏳</div>
      <h1 style={{ fontSize: "2.8rem", fontWeight: 600, color: "#0D0D0D", marginBottom: "1.2rem" }}>
        Pago pendiente
      </h1>
      <p style={{ fontSize: "1.6rem", color: "#6E6A63", maxWidth: "44rem", lineHeight: 1.6, marginBottom: "3.2rem" }}>
        Tu pago está siendo procesado. Cuando se confirme te llegará un email
        y nos pondremos en contacto para coordinar la entrega.
      </p>
      <a
        href="https://wa.me/59894394242"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "1.2rem 2.8rem",
          background: "#0D0D0D",
          color: "#fff",
          borderRadius: "0.2rem",
          textDecoration: "none",
          fontSize: "1.5rem",
          fontWeight: 500,
          marginBottom: "1.6rem",
          display: "inline-block",
        }}
      >
        Consultar por WhatsApp
      </a>
      <Link href="/" style={{ fontSize: "1.4rem", color: "#AEAAA3", textDecoration: "underline" }}>
        Volver al inicio
      </Link>
    </div>
  );
}
