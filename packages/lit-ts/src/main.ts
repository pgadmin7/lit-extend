
import './style.css';
import viteLogo from '/vite.svg';
import typescriptLogo from '/typescript.svg';
import { setupCounter } from './counts';
import "./components";
import { attachLitDomRerenderDebugger } from './composable/debuggerLit';

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1> new </h1>
    <shared-counter-v2> </shared-counter-v2>

    <h1> OLD </h1>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
const _debugger = attachLitDomRerenderDebugger();