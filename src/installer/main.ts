import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { spawn } from "child_process";
import { DiscordPathfinder } from "./pathfinder";
import { DiscordInjector } from "./injector";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    resizable: false,
    transparent: false,
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(join(__dirname, "ui.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

const pathfinder = new DiscordPathfinder();
const loaderPath = join(process.cwd(), "dist", "loader.js");
const injector = new DiscordInjector(loaderPath);

ipcMain.handle("scan-discord", async () => {
  return pathfinder.findAllInstallations();
});

ipcMain.handle("install", async () => {
  const installation = pathfinder.findLatestInstallation();

  if (!installation) {
    return {
      success: false,
      message: "No Discord installation found",
    };
  }

  mainWindow?.webContents.send(
    "log",
    `[SYS] Found Discord ${installation.variant} v${installation.version}`,
    "sys"
  );
  mainWindow?.webContents.send("log", "[SYS] Creating backup...", "sys");
  mainWindow?.webContents.send("log", "[SYS] Injecting Savecord...", "sys");

  const result = injector.inject(installation);

  if (result.success) {
    mainWindow?.webContents.send(
      "log",
      "[SYS] Verifying injection...",
      "sys"
    );
  }

  return result;
});

ipcMain.handle("uninstall", async () => {
  const installation = pathfinder.findLatestInstallation();

  if (!installation) {
    return {
      success: false,
      message: "No Discord installation found",
    };
  }

  mainWindow?.webContents.send("log", "[SYS] Restoring backup...", "sys");

  return injector.uninstall(installation);
});

ipcMain.handle("launch-discord", async () => {
  const installation = pathfinder.findLatestInstallation();

  if (!installation) {
    return { success: false };
  }

  const discordExe = join(
    installation.path,
    "..",
    `Discord${installation.variant === "canary" ? "Canary" : installation.variant === "ptb" ? "PTB" : ""}.exe`
  );

  try {
    spawn(discordExe, [], { detached: true, stdio: "ignore" });
    app.quit();
    return { success: true };
  } catch {
    return { success: false };
  }
});
