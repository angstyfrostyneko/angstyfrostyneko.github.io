pub mod gpu;

use crate::gpu::{backend_daily, backend_get_day_count, backend_search_by_name, backend_yesterday};
use gpu::GPU;
use serde_wasm_bindgen::to_value;
use std::sync::OnceLock;
use wasm_bindgen::prelude::{JsValue, wasm_bindgen};

static GPU_DATABASE: OnceLock<Vec<GPU>> = OnceLock::new();

#[wasm_bindgen]
pub fn generate_database() {
    let raw_gpu_csv = include_bytes!("../../main-gpu-list.csv");

    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .from_reader(&raw_gpu_csv[..]);

    let _ = GPU_DATABASE.set(
        reader
            .deserialize::<GPU>()
            .filter_map(Result::ok)
            .enumerate()
            .map(|(i, mut gpu)| {
                gpu.id = i as u16;
                gpu
            })
            .collect(),
    );
}

#[wasm_bindgen]
pub fn get_todays_gpu() -> Result<JsValue, JsValue> {
    let card = backend_daily(GPU_DATABASE.get().unwrap()).clone();
    return to_value(&card).map_err(|err| err.into());
}

#[wasm_bindgen]
pub fn get_yesterdays_gpu() -> Result<JsValue, JsValue> {
    let card = backend_yesterday(GPU_DATABASE.get().unwrap()).clone();
    return to_value(&card).map_err(|err| err.into());
}

#[wasm_bindgen]
pub fn get_results(name: &str) -> Result<JsValue, JsValue> {
    let result = backend_search_by_name(name, GPU_DATABASE.get().unwrap());
    return to_value(&result).map_err(|err| err.into());
}

#[wasm_bindgen]
pub fn get_gpudle_count() -> Result<JsValue, JsValue> {
    let count = backend_get_day_count();
    return to_value(&count).map_err(|err| err.into());
}
