pub mod database;
pub mod gpu;

use crate::{
    database::{GPU_DATABASE, backend_generate_database},
    gpu::{
        GPU, backend_check_answer, backend_get_day_count, backend_search_by_name, backend_yesterday,
    },
};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::{JsValue, wasm_bindgen};

macro_rules! to_value {
    ($val:expr) => {
        to_value(&$val).map_err(|err| err.into())
    };
}

#[wasm_bindgen]
pub async fn generate_database() {
    backend_generate_database().await;
}

#[wasm_bindgen]
pub fn check_answer(id: u16) -> Result<JsValue, JsValue> {
    let response = backend_check_answer(id);
    return to_value!(response);
}

#[wasm_bindgen]
pub fn get_yesterdays_gpu() -> Result<JsValue, JsValue> {
    let card = backend_yesterday(GPU_DATABASE.get().unwrap());
    return to_value!(card);
}

#[wasm_bindgen]
pub fn get_results(name: &str, already_guessed: Vec<u16>) -> Result<JsValue, JsValue> {
    let result = backend_search_by_name(name, GPU_DATABASE.get().unwrap(), already_guessed);
    return to_value!(result);
}

#[wasm_bindgen]
pub fn get_gpudle_count() -> Result<JsValue, JsValue> {
    let count = backend_get_day_count();
    return to_value!(count);
}
