#!/bin/bash

cargo run -- matrix smc
python transform.py
cargo run -- visualize
