use crate::database::GPU_DATABASE;
use chrono::{Local, NaiveDate, TimeDelta};
use rand::{RngExt, SeedableRng, rngs::SmallRng};
use rust_fuzzy_search::fuzzy_compare;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[wasm_bindgen]
pub struct GPU {
    #[serde(skip_deserializing)]
    pub id: u16,
    #[wasm_bindgen(getter_with_clone)]
    pub name: String,
    #[wasm_bindgen(getter_with_clone)]
    pub brand: String,
    #[wasm_bindgen(getter_with_clone)]
    pub generation: String,
    pub tdp: Option<u16>,
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

pub fn backend_search_by_name<'a>(
    query: &str,
    gpu_list: &'a Vec<GPU>,
    already_guessed: Vec<u16>,
) -> Vec<&'a GPU> {
    let threshold = 0.35;
    let query = query.to_lowercase().to_owned();

    let mut results: Vec<(&GPU, f32)> = gpu_list
        .iter()
        .map(|card| {
            let score = fuzzy_compare(
                &query.replace(" ", ""),
                format!(
                    "{}{}",
                    &card.brand.to_string().to_lowercase(),
                    &card.name.to_lowercase().replace(" ", "")
                )
                .as_str(),
            );
            (card, score)
        })
        .filter(|x| x.1 >= threshold && !already_guessed.contains(&x.0.id))
        .collect();

    results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(Ordering::Equal));

    return results.into_iter().map(|(card, _)| card).collect();
}

pub fn backend_check_answer(id: u16) -> Vec<(u8, String)> {
    let correct_card = backend_daily(GPU_DATABASE.get().unwrap()).clone();
    let guess_card = GPU_DATABASE
        .get()
        .unwrap()
        .get(id as usize)
        .unwrap()
        .clone();

    // 0 for no emoji, 1 for too low, 2 for too high, 3 for correct
    let mut response: Vec<(u8, String)> = Vec::with_capacity(8);
    if guess_card.name == correct_card.name {
        response.push((0, guess_card.name));
    } else {
        response.push((0, guess_card.name));
    }

    if guess_card.brand == correct_card.brand {
        response.push((3, guess_card.brand.to_string()));
    } else {
        response.push((0, guess_card.brand.to_string()));
    }

    if guess_card.generation == correct_card.generation {
        response.push((3, guess_card.generation));
    } else {
        response.push((0, guess_card.generation));
    }

    match (guess_card.tdp, correct_card.tdp) {
        (None, None) => response.push((3, "N/A".to_string())),
        (Some(guess), None) => response.push((0, guess.to_string())),
        (Some(guess), Some(correct)) => match guess.partial_cmp(&correct) {
            Some(Ordering::Less) => response.push((1, guess.to_string())),
            Some(Ordering::Equal) => response.push((3, guess.to_string())),
            Some(Ordering::Greater) => response.push((2, guess.to_string())),
            None => response.push((0, "N/A".to_string())),
        },
        _ => response.push((0, "N/A".to_string())),
    }

    match (guess_card.cables, correct_card.cables) {
        (None, None) => response.push((3, "N/A".to_string())),
        (Some(guess), None) => response.push((0, guess.clone())),
        (Some(guess), Some(correct)) => {
            if guess == correct {
                response.push((3, guess.clone()));
            } else {
                response.push((0, guess.clone()));
            }
        }
        _ => response.push((0, "N/A".to_string())),
    }

    match (guess_card.vram, correct_card.vram) {
        (None, None) => response.push((3, "N/A".to_string())),
        (Some(guess), None) => response.push((0, guess.to_string())),
        (Some(guess), Some(correct)) => match guess.partial_cmp(&correct) {
            Some(Ordering::Less) => response.push((1, guess.to_string())),
            Some(Ordering::Equal) => response.push((3, guess.to_string())),
            Some(Ordering::Greater) => response.push((2, guess.to_string())),
            None => response.push((0, "N/A".to_string())),
        },
        _ => response.push((0, "N/A".to_string())),
    }

    match (guess_card.pcie, correct_card.pcie) {
        (None, None) => response.push((3, "N/A".to_string())),
        (Some(guess), None) => response.push((0, guess)),
        (Some(guess), Some(correct)) => {
            if guess == correct {
                response.push((3, guess.clone()));
            } else {
                response.push((0, guess.clone()));
            }
        }
        _ => response.push((0, "N/A".to_string())),
    }

    match guess_card.year.cmp(&correct_card.year) {
        Ordering::Less => response.push((1, guess_card.year.to_string())),
        Ordering::Equal => response.push((3, guess_card.year.to_string())),
        Ordering::Greater => response.push((2, guess_card.year.to_string())),
    }

    return response;
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
    let start_string = "25.04.2026";
    let start_date = NaiveDate::parse_from_str(start_string, "%d.%m.%Y").expect("Invalid format");
    let today = Local::now().date_naive();
    let duration = today.signed_duration_since(start_date);

    return duration.num_days();
}
