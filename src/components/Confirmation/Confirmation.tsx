"use client";

import { useState } from "react";
import { useForm } from "../context/FormContext";
import { calcTotal, formatPrice, PRICES } from "../../lib/pricing";
import { ConfirmationPreview } from "./ConfirmationPreview";
import "./Confirmation.css";

const SIZE_LABEL: Record<number, string> = { 0.8: "S", 1: "M", 1.2: "L" };

const Confirmation = () => {
  const { screenshotUrl, persons, woodText, prevStep, pets } = useForm();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = calcTotal(persons.length, pets.length);

  const handleDownload = () => {
    if (!screenshotUrl) return;
    const a = document.createElement("a");
    a.href = screenshotUrl;
    a.download = "familia.png";
    a.click();
  };

  const handlePay = async () => {
    if (!customerEmail) {
      setError("Por favor ingresá tu email.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persons, woodText, customerEmail, customerName }),
      });
      if (!res.ok) throw new Error("Error al crear la preferencia de pago.");
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (e) {
      setError("Hubo un error. Intentá de nuevo o escribinos por WhatsApp.");
      setLoading(false);
    }
  };

  return (
    <div className="confirmation">
      <div className="confirmation-preview">
        <ConfirmationPreview persons={persons} woodText={woodText} pets={pets} />
      </div>

      <div className="confirmation-details">
        <h1>Tu familia está lista</h1>

        {/* Resumen del pedido */}
        <div className="confirmation-summary">
          <div className="confirmation-row">
            <span className="confirmation-label">Palabra</span>
            <span className="confirmation-value">{woodText || "—"}</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-label">Personas</span>
            <span className="confirmation-value">{persons.length}</span>
          </div>
          <div className="confirmation-persons">
            {persons.map((p, i) => (
              <div key={i} className="confirmation-person">
                <span
                  className="confirmation-swatch"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.gender === "man" ? "Hombre" : "Mujer"}</span>
                <span className="confirmation-size">{SIZE_LABEL[p.size] ?? p.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div className="confirmation-price">
          <div className="confirmation-price-row">
            <span>Base + letras</span>
            <span>{formatPrice(PRICES.base)}</span>
          </div>
          <div className="confirmation-price-row">
            <span>{persons.length} {persons.length === 1 ? "figura" : "figuras"}</span>
            <span>{formatPrice(PRICES.perPerson * persons.length)}</span>
          </div>
          {pets.length > 0 && (
            <div className="confirmation-price-row">
              <span>{pets.length} {pets.length === 1 ? "mascota" : "mascotas"}</span>
              <span>{formatPrice(PRICES.perPet * pets.length)}</span>
            </div>
          )}
          <div className="confirmation-price-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="confirmation-form">
          <input
            className="confirmation-input"
            type="text"
            placeholder="Tu nombre"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="confirmation-input"
            type="email"
            placeholder="Tu email *"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
          />
          {error && <p className="confirmation-error">{error}</p>}
        </div>

        {/* Acciones */}
        <div className="confirmation-actions">
          <button className="navBack-btn" onClick={prevStep}>Atrás</button>
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!screenshotUrl}
          >
            Descargar imagen
          </button>
          <button
            className="order-btn"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? "Redirigiendo..." : "Pagar con MercadoPago"}
          </button>
        </div>
      </div>
    </div>
  );
};

export { Confirmation };
