use chrono::{Local, NaiveDate, TimeDelta};
use rand::{RngExt, SeedableRng, rngs::SmallRng};
use rust_fuzzy_search::fuzzy_compare;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
enum Makers {
    AMD,
    ATI,
    Intel,
    Matrox,
    NVIDIA,
    #[serde(alias = "3dfx")]
    Threedfx,
    XGI,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)] // idk why it says its dead tbh
pub struct GPU {
    #[serde(skip)]
    pub id: u16,
    #[serde(rename = "manufacturer")]
    maker: Makers,
    #[serde(rename = "productName")]
    name: String,
    #[serde(rename = "releaseYear")]
    year: Option<u16>,
    #[serde(rename = "memSize")]
    memory_size: Option<f32>,
    #[serde(rename = "memBusWidth")]
    memory_bus: Option<u16>,
    #[serde(rename = "bus")]
    pcie: Option<String>,
}

pub fn get_results<'a>(name: &str, gpu_list: &'a Vec<GPU>) -> Vec<(&'a GPU, f32)> {
    let threshold = 0.25;

    let mut results: Vec<(&GPU, f32)>;
    results = gpu_list
        .iter()
        .map(|card| {
            let res = fuzzy_compare(name, &card.name);
            (card, res)
        })
        .filter(|x| x.1 >= threshold)
        .collect();

    results.sort_by(|a, b| match b.1.partial_cmp(&a.1) {
        Some(ordering) => ordering,
        None => std::cmp::Ordering::Equal,
    });

    return results;
}

fn get_gpu(gpu_list: &Vec<GPU>, day: NaiveDate) -> &GPU {
    let seed = day.to_epoch_days() as u64;
    let mut rng = SmallRng::seed_from_u64(seed);
    let index = rng.random_range(0..gpu_list.len());

    return gpu_list.get(index).unwrap();
}

pub fn get_daily_gpu(gpu_list: &Vec<GPU>) -> &GPU {
    let today = Local::now().date_naive();
    return get_gpu(gpu_list, today);
}

pub fn get_yesterday_gpu(gpu_list: &Vec<GPU>) -> &GPU {
    let yesterday = Local::now().date_naive() - TimeDelta::try_days(1).unwrap();
    return get_gpu(gpu_list, yesterday);
}
