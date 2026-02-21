import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./app.css";

(BigInt.prototype as any).toJSON = function () {
    return `${this.toString()}n`;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
