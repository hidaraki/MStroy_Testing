import { createApp } from "vue"
import { ModuleRegistry } from "ag-grid-community"
import { AllEnterpriseModule } from "ag-grid-enterprise"
import "ag-grid-community/styles/ag-theme-quartz.css"
import "./style.css"
import App from "./App.vue"

ModuleRegistry.registerModules([AllEnterpriseModule])

createApp(App).mount("#app")
