pub mod database;
pub mod gpu;

use crate::{
    database::{GPU_DATABASE, backend_generate_database},
    gpu::{backend_daily, backend_get_day_count, backend_search_by_name, backend_yesterday},
};
use gpu::GPU;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::{JsValue, wasm_bindgen};

#[wasm_bindgen]
pub async fn generate_database() {
    backend_generate_database().await;
}

#[wasm_bindgen]
pub fn check_answer() -> Result<JsValue, JsValue> {
    let card = backend_daily(GPU_DATABASE.get().unwrap()).clone();

    // TODO: compose vector of strings to return to JS
    return to_value(&3).map_err(|err| err.into());
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
