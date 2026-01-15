import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { FlowVisPlugin } from "vue-flow-vis";

const app = createApp(App);

// Basic usage with default settings
app.use(FlowVisPlugin);

app.mount("#app");

