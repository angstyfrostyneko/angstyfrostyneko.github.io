pub mod database;
pub mod gpu;

use crate::{
    database::{GPU_DATABASE, backend_generate_database},
    gpu::{backend_daily, backend_get_day_count, backend_search_by_name, backend_yesterday},
};
use gpu::GPU;
use serde_wasm_bindgen::to_value;
use std::cmp::Ordering;
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
    let correct_card = backend_daily(GPU_DATABASE.get().unwrap()).clone();
    if id == correct_card.id {
        return to_value!("correct card!");
    }

    let guess_card = GPU_DATABASE
        .get()
        .unwrap()
        .get(id as usize)
        .unwrap()
        .clone();

    // 0 for no emoji, 1 for too low, 2 for too high, 3 for correct
    let mut response: Vec<(u8, String)> = Vec::with_capacity(9);
    if guess_card.name == correct_card.name {
        response.push((3, guess_card.name));
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
        (Some(guess), Some(correct)) => match guess.partial_cmp(&correct) {
            Some(Ordering::Less) => response.push((1, guess.to_string())),
            Some(Ordering::Equal) => response.push((3, guess.to_string())),
            Some(Ordering::Greater) => response.push((2, guess.to_string())),
            None => response.push((3, "N/A".to_string())),
        },
        _ => response.push((3, "N/A".to_string())),
    }

    match (guess_card.cables, correct_card.cables) {
        (Some(guess), Some(correct)) => {
            if guess == correct {
                response.push((3, guess.clone()));
            } else {
                response.push((0, guess.clone()));
            }
        }
        _ => response.push((3, "N/A".to_string())),
    }

    match (guess_card.vram, correct_card.vram) {
        (Some(guess), Some(correct)) => match guess.partial_cmp(&correct) {
            Some(Ordering::Less) => response.push((1, guess.to_string())),
            Some(Ordering::Equal) => response.push((3, guess.to_string())),
            Some(Ordering::Greater) => response.push((2, guess.to_string())),
            None => response.push((3, "N/A".to_string())),
        },
        _ => response.push((3, "N/A".to_string())),
    }

    match (guess_card.pcie, correct_card.pcie) {
        (Some(guess), Some(correct)) => {
            if guess == correct {
                response.push((3, guess.clone()));
            } else {
                response.push((0, guess.clone()));
            }
        }
        _ => response.push((3, "N/A".to_string())),
    }

    match guess_card.year.cmp(&correct_card.year) {
        Ordering::Less => response.push((1, guess_card.year.to_string())),
        Ordering::Equal => response.push((3, guess_card.year.to_string())),
        Ordering::Greater => response.push((2, guess_card.year.to_string())),
    }

    return to_value!(response);
}

#[wasm_bindgen]
pub fn get_yesterdays_gpu() -> Result<JsValue, JsValue> {
    let card = backend_yesterday(GPU_DATABASE.get().unwrap());
    return to_value!(card);
}

#[wasm_bindgen]
pub fn get_results(name: &str) -> Result<JsValue, JsValue> {
    let result = backend_search_by_name(name, GPU_DATABASE.get().unwrap());
    return to_value!(result);
}

#[wasm_bindgen]
pub fn get_gpudle_count() -> Result<JsValue, JsValue> {
    let count = backend_get_day_count();
    return to_value!(count);
}
