import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "katex/dist/katex.min.css";
import "./styles/index.css";
import { App } from "./App";
import { buildCatalogs } from "./i18n/catalog";
import { createLocalProgressRepository } from "./progress/repository";

// Swap this for an API-backed repository once there is a backend.
const progressRepository = createLocalProgressRepository();
const catalogs = buildCatalogs();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App progressRepository={progressRepository} catalogs={catalogs} />
  </StrictMode>,
);
