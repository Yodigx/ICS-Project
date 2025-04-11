import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { format } from "date-fns";

// Make format function available globally for use in components
window.formatDate = format;

createRoot(document.getElementById("root")!).render(<App />);
