import ReactDOM from "react-dom/client";
import App from "./App";
import "./app.css";
import "react-toastify/dist/ReactToastify.css";

(BigInt.prototype as any).toJSON = function () {
    return `${this.toString()}n`;
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
