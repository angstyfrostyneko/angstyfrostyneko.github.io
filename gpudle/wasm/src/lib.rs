pub mod gpu;

use std::sync::OnceLock;

use crate::gpu::{get_daily_gpu, get_results};
use gpu::GPU;
use wasm_bindgen::prelude::*;

static GPU_DATABASE: OnceLock<Vec<GPU>> = OnceLock::new();

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

fn generate_database() {
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
pub fn run() {
    generate_database();
    let gpu_list = GPU_DATABASE.get().unwrap();

    let daily_gpu = get_daily_gpu(gpu_list);
    let search: Vec<(&GPU, f32)> = get_results("5090", gpu_list);

    for i in search {
        log(format!("{:?}", i).as_str());
    }
    log(format!("{:?}", daily_gpu).as_str());
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {name}!"));
}

pub fn alert_gpu(a: &GPU) {
    alert(&format!("{:?}", a))
}
