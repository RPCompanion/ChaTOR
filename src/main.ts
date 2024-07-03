import "./app.css";
import App from "./App.svelte";

(BigInt.prototype as any).toJSON = function () {
    return `${this.toString()}n`;
};

const app = new App({
    target: document.getElementById("app")!,
});

export default app;
