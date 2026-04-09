pub mod gpu;

use gpu::GPU;
use wasm_bindgen::prelude::*;

use crate::gpu::get_daily_gpu;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn run() {
    let raw_gpu_csv = include_bytes!("../../main-gpu-list.csv");

    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .from_reader(&raw_gpu_csv[..]);

    let gpu_list: Vec<GPU> = reader
        .deserialize::<GPU>()
        .filter_map(Result::ok) // Drop bad entries
        .collect();

    let daily_gpu = get_daily_gpu(&gpu_list);
    log(format!("{:?}", daily_gpu).as_str());
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {name}!"));
}

pub fn alert_gpu(a: &GPU) {
    alert(&format!("{:?}", a))
}
