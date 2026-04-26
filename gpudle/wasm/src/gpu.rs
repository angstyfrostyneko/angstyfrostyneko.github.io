use chrono::{Local, NaiveDate, TimeDelta};
use rand::{RngExt, SeedableRng, rngs::SmallRng};
use rust_fuzzy_search::fuzzy_compare;
use serde::{Deserialize, Serialize};
use std::{cmp::Ordering, fmt};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum Brands {
    #[serde(alias = "amd", rename = "0")]
    AMD,
    #[serde(alias = "ATI", rename = "1")]
    ATI,
    #[serde(alias = "intel", rename = "2")]
    Intel,
    #[serde(alias = "matrox", rename = "3")]
    Matrox,
    #[serde(alias = "nvidia", rename = "4")]
    NVIDIA,
    #[serde(alias = "3dfx", rename = "5")]
    Threedfx,
    #[serde(alias = "xgi", rename = "6")]
    XGI,
    #[serde(alias = "sony", rename = "7")]
    Sony,
}

impl fmt::Display for Brands {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Brands::Threedfx => write!(f, "{}", "3dfx"),
            _ => write!(f, "{:?}", self),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[wasm_bindgen]
pub struct GPU {
    #[serde(skip_deserializing)]
    pub id: u16,
    #[wasm_bindgen(getter_with_clone)]
    pub name: String,
    pub brand: Brands,
    #[wasm_bindgen(getter_with_clone)]
    pub generation: String,
    pub tdp: Option<f32>,
    #[wasm_bindgen(getter_with_clone)]
    pub cables: Option<String>,
    pub vram: Option<f32>,
    #[wasm_bindgen(getter_with_clone)]
    pub pcie: Option<String>,
    pub year: u16,
}

#[wasm_bindgen]
impl GPU {
    pub fn get(&self) -> GPU {
        self.clone()
    }
}

pub fn backend_search_by_name<'a>(name: &str, gpu_list: &'a Vec<GPU>) -> Vec<&'a GPU> {
    let threshold = 0.5;
    let name = name.to_lowercase().to_owned();

    let mut results: Vec<(&GPU, f32)> = gpu_list
        .iter()
        .map(|card| {
            let score = fuzzy_compare(&name, &card.name.to_lowercase());
            (card, score)
        })
        .filter(|x| x.1 >= threshold)
        .collect();

    results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(Ordering::Equal));

    return results.into_iter().map(|(card, _)| card).collect();
}

fn get_gpu(gpu_list: &Vec<GPU>, day: NaiveDate) -> &GPU {
    let seed = day.to_epoch_days() as u64;
    let mut rng = SmallRng::seed_from_u64(seed);
    let index = rng.random_range(0..gpu_list.len());

    return gpu_list.get(index).unwrap();
}

pub fn backend_daily(gpu_list: &Vec<GPU>) -> &GPU {
    let today = Local::now().date_naive();
    return get_gpu(gpu_list, today);
}

pub fn backend_yesterday(gpu_list: &Vec<GPU>) -> &GPU {
    let yesterday = Local::now().date_naive() - TimeDelta::try_days(1).unwrap();
    return get_gpu(gpu_list, yesterday);
}

pub fn backend_get_day_count() -> i64 {
    let start_string = "14.04.2026";
    let start_date = NaiveDate::parse_from_str(start_string, "%d.%m.%Y").expect("Invalid format");
    let today = Local::now().date_naive();
    let duration = today.signed_duration_since(start_date);

    return duration.num_days();
}
