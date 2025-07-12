# Workspace Launcher

**Workspace Launcher** is a cross-platform desktop application built with **Tauri**, **React**, and **TypeScript** that lets you group multiple programs into a single _workspace_ and launch them all with one click.

## ✨ Features

- **Create, edit & delete workspaces**: each workspace is a named collection of applications.
- **One-click launch**: start every executable in the workspace concurrently.
- **Argument support**: pass custom CLI arguments to individual apps.
- **Test run**: verify a workspace before saving it.
- **Persistent storage**: workspaces are stored in the user-data directory via the Tauri FS API.
- **System-native dialogs**: choose executables with the native file picker.
- **Lightweight & secure**: powered by Rust under the hood and ships with a tiny runtime.

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A JavaScript package manager of your choice (**npm**, **pnpm**, **yarn**, **bun**)

### Installation

```bash
# Clone the repo
$ git clone https://github.com/your-org/workspace-launcher.git
$ cd workspace-launcher

# Install JS dependencies with your preferred package manager
$ npm install      #  or yarn install / pnpm install / bun install
```

### Development

Run the web dev server **and** the Tauri shell (two terminals or tmux panes) using your chosen package manager:

```bash
# Start Vite (renderer only)
$ npm run dev

# In another terminal, start the Tauri window pointing to the dev server
$ npm run tauri dev
```

The application will hot-reload as you edit the source.

### Production Build

```bash
# Generate a native installer / binary for your OS
$ pnpm tauri build
```

Artifacts are located in `src-tauri/target/release/bundle/<platform>`.

## 🛠️ Development Scripts

| Script        | Description                           |
| ------------- | ------------------------------------- |
| `dev`         | Start the Vite dev server             |
| `tauri dev`   | Launch Tauri with the dev server      |
| `build`       | Type-check & build the React renderer |
| `tauri build` | Generate native binaries / installers |

> Invoke these scripts with your package manager, e.g. `npm run build`, `yarn tauri build`, `pnpm tauri dev`, etc.

## 📜 License

This project is licensed under the **MIT License**. See `LICENSE` for details.
