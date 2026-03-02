import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Une erreur inattendue est survenue.</h2>
        <p>L'équipe a été notifiée. Rechargez la page pour réessayer.</p>
        <button onClick={() => window.location.reload()}>Recharger</button>
      </div>
    }>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
