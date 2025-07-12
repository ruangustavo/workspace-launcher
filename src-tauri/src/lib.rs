use std::process::Command;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Manager, Emitter};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkspaceApp {
    pub id: String,
    pub name: String,
    pub path: String,
    pub args: Option<String>,
    pub delay: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LaunchResult {
    pub success: bool,
    pub app_id: String,
    pub error: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn launch_app(app: WorkspaceApp) -> Result<LaunchResult, String> {
    if let Some(delay) = app.delay {
        thread::sleep(Duration::from_secs(delay));
    }

    let mut cmd = Command::new(&app.path);
    
    if let Some(args) = &app.args {
        if !args.is_empty() {
            // Split args by spaces (simple implementation)
            let arg_parts: Vec<&str> = args.split_whitespace().collect();
            cmd.args(arg_parts);
        }
    }

    match cmd.spawn() {
        Ok(_) => Ok(LaunchResult {
            success: true,
            app_id: app.id,
            error: None,
        }),
        Err(e) => Ok(LaunchResult {
            success: false,
            app_id: app.id,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
async fn launch_workspace_apps(apps: Vec<WorkspaceApp>, app_handle: AppHandle) -> Result<Vec<LaunchResult>, String> {
    let mut results = Vec::new();
    
    for (index, app) in apps.iter().enumerate() {
        let _ = app_handle.emit("workspace-launch-progress", serde_json::json!({
            "current": index,
            "total": apps.len(),
            "app_name": app.name,
            "app_id": app.id
        }));

        let result = launch_app(app.clone()).await;
        match result {
            Ok(launch_result) => {
                results.push(launch_result);
            }
            Err(e) => {
                results.push(LaunchResult {
                    success: false,
                    app_id: app.id.clone(),
                    error: Some(e),
                });
            }
        }
    }
    
    let _ = app_handle.emit("workspace-launch-complete", serde_json::json!({
        "results": results
    }));
    
    Ok(results)
}

#[tauri::command]
async fn get_app_info(path: String) -> Result<serde_json::Value, String> {
    use std::path::Path;
    
    let path_obj = Path::new(&path);
    
    if !path_obj.exists() {
        return Err("File does not exist".to_string());
    }
    
    let name = path_obj
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown")
        .to_string();
    
    Ok(serde_json::json!({
        "name": name,
        "path": path,
        "exists": true
    }))
}

#[tauri::command]
async fn save_workspaces_data(data: String, app_handle: AppHandle) -> Result<(), String> {
    use std::fs;
    
    let app_dir = app_handle.path().app_local_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    let workspaces_dir = app_dir.join("workspaces");
    fs::create_dir_all(&workspaces_dir)
        .map_err(|e| format!("Failed to create workspaces directory: {}", e))?;
    
    let file_path = workspaces_dir.join("workspaces.json");
    fs::write(file_path, data)
        .map_err(|e| format!("Failed to write workspaces data: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn load_workspaces_data(app_handle: AppHandle) -> Result<String, String> {
    use std::fs;
    
    let app_dir = app_handle.path().app_local_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    let file_path = app_dir.join("workspaces").join("workspaces.json");
    
    if !file_path.exists() {
        return Ok("[]".to_string());
    }
    
    fs::read_to_string(file_path)
        .map_err(|e| format!("Failed to read workspaces data: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            launch_app,
            launch_workspace_apps,
            get_app_info,
            save_workspaces_data,
            load_workspaces_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
