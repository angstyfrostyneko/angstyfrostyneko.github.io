use chrono::{Local, NaiveDate, TimeDelta};
use rand::{RngExt, SeedableRng, rngs::SmallRng};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
enum Makers {
    NVIDIA,
    ATI,
    XGI,
    AMD,
    Matrox,
    Intel,
    #[serde(alias = "3dfx")]
    Threedfx,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)] // idk why it says its dead tbh
pub struct GPU {
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
