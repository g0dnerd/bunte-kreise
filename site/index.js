import * as wasm from "wahlo";

async function loadData() {
  const selectedAlgorithm = document.getElementById("algorithm").value;
  try {
    wasm.generate_coordinates(selectedAlgorithm);
    const jsCoordSpace = await wasm.coords_from_file("similarity_matrix.csv");
    const coordinates = await wasm.get_coordinates(jsCoordSpace);
    visualize(coordinates);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

function visualize(coordinates) {
  const svg = d3.select("#chart");
  svg.selectAll("*").remove();

  const margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d) => d[0]))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d) => d[1]))
    .range([height, 0]);

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .selectAll("circle")
    .data(coordinates)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d[0]))
    .attr("cy", (d) => y(d[1]))
    .attr("r", 5)
    .attr("fill", "red");
}

loadData();
