use crate::GPU;
use csv::ReaderBuilder;
use gloo_net::http::Request;
use std::sync::OnceLock;

pub static GPU_DATABASE: OnceLock<Vec<GPU>> = OnceLock::new();

async fn download_csv() -> String {
    // let link = "https://raw.githubusercontent.com\
    // /angstyfrostyneko/angstyfrostyneko.github.io\
    // /refs/heads/main/gpudle/main-gpu-list.csv";

    let link = "../gpudle/main-gpu-list.csv";

    let body = Request::get(link)
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();

    return body;
}

pub async fn backend_generate_database() {
    let csv = download_csv().await;

    let mut reader = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(csv.as_bytes());

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
