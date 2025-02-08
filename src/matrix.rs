use crate::{Algorithm, PARTIES, PARTY_AMOUNT, QUESTION_AMOUNT};
use anyhow::Context;
use std::{fs::File, io::Write};

fn cosine_similarity(party1: &[f64], party2: &[f64]) -> f64 {
    let dot_product: f64 = party1.iter().zip(party2.iter()).map(|(x, y)| *x * *y).sum();
    let norm_a = (party1.iter().map(|x| (x).powi(2)).sum::<f64>()).sqrt();
    let norm_b = (party2.iter().map(|x| (x).powi(2)).sum::<f64>()).sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }
    dot_product / (norm_a * norm_b)
}

fn smc(party1: &[f64], party2: &[f64]) -> f64 {
    let mut matches = 0.0;
    for i in 0..QUESTION_AMOUNT {
        if (party1[i] + party2[i]).abs() == 2.0 {
            matches += 1.0;
        } else if party1[i] == 0.0 && party2[i] == 0.0 {
            matches += 0.7;
        }
    }
    matches / QUESTION_AMOUNT as f64
}

pub fn make_matrix(alg: Algorithm) -> anyhow::Result<()> {
    let mut similarity_matrix = [[0.0; PARTY_AMOUNT]; PARTY_AMOUNT];

    for i in 0..PARTY_AMOUNT {
        (0..PARTY_AMOUNT).for_each(|j| {
            if i == j {
                similarity_matrix[i][j] = 1.0;
            } else {
                similarity_matrix[i][j] = match alg {
                    Algorithm::Cosine => cosine_similarity(&PARTIES[i], &PARTIES[j]),
                    Algorithm::Smc => smc(&PARTIES[i], &PARTIES[j]),
                }
            }
        });
    }

    let mut file = File::create("similarity_matrix.csv").context("Unable to create file")?;
    for row in &similarity_matrix {
        let row_str = row
            .iter()
            .map(|&x| x.to_string())
            .collect::<Vec<String>>()
            .join(",");
        writeln!(file, "{}", row_str).context("Unable to write to file")?;
    }
    Ok(())
}
