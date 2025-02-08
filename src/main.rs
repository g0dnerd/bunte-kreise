use anyhow::Context;
use clap::{Parser, Subcommand};
use wahlo::{matrix::make_matrix, visualize::visualize, Algorithm};

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand, Debug)]
enum Command {
    Matrix { style: Algorithm },
    Visualize,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();
    match args.command {
        Command::Matrix { style } => make_matrix(style).context("Tried creating Matrix."),
        Command::Visualize => visualize().context("Tried creating SVG outputs."),
    }
}
