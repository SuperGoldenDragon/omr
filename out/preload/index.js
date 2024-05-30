"use strict";
const preload = require("@electron-toolkit/preload");
const customElectronTitlebar = require("custom-electron-titlebar");
const electron = require("electron");
const path = require("path");
const appIcon = path.join(__dirname, "../../resources/icon.png");
const options = {
  icon: electron.nativeImage.createFromPath(appIcon),
  shadow: true
  // backgroundColor: TitlebarColor.fromHex('#333')
};
const api = {};
const handleDarkModeChange = (titlebar) => {
  if (titlebar === void 0)
    return;
  const isDarkMode = document.documentElement.classList.contains("dark");
  if (isDarkMode) {
    console.log("Dark mode is enabled");
    titlebar.updateBackground(customElectronTitlebar.TitlebarColor.fromHex("#374151"));
  } else {
    console.log("Dark mode is not enabled");
    titlebar.updateBackground(customElectronTitlebar.TitlebarColor.fromHex("#0e7490"));
  }
};
electron.ipcRenderer.on("darkMode", (_event, isDarkMode) => {
  console.log("Dark mode is enabled", isDarkMode);
  document.documentElement.classList.toggle("system-dark", isDarkMode);
});
window.addEventListener("DOMContentLoaded", () => {
  const titlebar = new customElectronTitlebar.Titlebar(options);
  handleDarkModeChange(titlebar);
  const observer = new MutationObserver(() => handleDarkModeChange(titlebar));
  const config = { attributes: true, attributeFilter: ["class"] };
  observer.observe(document.documentElement, config);
});
if (process.contextIsolated) {
  electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
  electron.contextBridge.exposeInMainWorld("api", api);
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
