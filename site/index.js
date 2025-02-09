import * as wasm from "../pkg/wahlo";
import { ScatterGL, } from "scatter-gl";
const selectedAlgorithm = "umap";
const jsCoordSpace = await wasm.load_coords(selectedAlgorithm);
const coordinates = await wasm.get_coordinates(jsCoordSpace);
const labels = await wasm.get_labels(jsCoordSpace);
const metadata = [];
const data = { labels: [], labelNames: [], projection: [] };
coordinates.forEach((point) => {
    data.projection.push(point);
});
const dataPoints = [];
labels.forEach((idx, i) => {
    const labelIndex = idx[0];
    dataPoints.push(data.projection[i]);
    metadata.push({
        labelIndex,
        label: idx[1],
    });
});
const sequences = makeSequences(dataPoints, metadata);
const dataset = new ScatterGL.Dataset(dataPoints, metadata);
let lastSelectedPoints = [];
let renderMode = "points";
const containerElement = document.getElementById("container");
const messageElement = document.getElementById("messages");
const setMessage = (message) => {
    const messageStr = `🔥 ${message}`;
    console.log(messageStr);
    messageElement.innerHTML = messageStr;
};
const scatterGL = new ScatterGL(containerElement, {
    onClick: (point) => {
        setMessage(`click ${point}`);
    },
    onHover: (point) => {
        setMessage(`hover ${point}`);
    },
    onSelect: (points) => {
        let message = "";
        if (points.length === 0 && lastSelectedPoints.length === 0) {
            message = "no selection";
        }
        else if (points.length === 0 && lastSelectedPoints.length > 0) {
            message = "deselected";
        }
        else if (points.length === 1) {
            message = `selected ${points}`;
        }
        else {
            message = `selected ${points.length} points`;
        }
        setMessage(message);
    },
    renderMode: "POINT" /* RenderMode.POINT */,
    orbitControls: {
        zoomSpeed: 1.125,
    },
});
scatterGL.render(dataset);
document
    .querySelectorAll('input[name="interactions"]')
    .forEach((inputElement) => {
    inputElement.addEventListener("change", () => {
        if (inputElement.value === "pan") {
            scatterGL.setPanMode();
        }
        else if (inputElement.value === "select") {
            scatterGL.setSelectMode();
        }
    });
});
document
    .querySelectorAll('input[name="render"]')
    .forEach((inputElement) => {
    inputElement.addEventListener("change", () => {
        renderMode = inputElement.value;
        if (inputElement.value === "points") {
            scatterGL.setPointRenderMode();
        }
        else if (inputElement.value === "sprites") {
            scatterGL.setSpriteRenderMode();
        }
        else if (inputElement.value === "text") {
            scatterGL.setTextRenderMode();
        }
    });
});
const hues = [...new Array(10)].map((_, i) => Math.floor((255 / 10) * i));
const lightTransparentColorsByLabel = hues.map((hue) => `hsla(${hue}, 100%, 50%, 0.05)`);
const heavyTransparentColorsByLabel = hues.map((hue) => `hsla(${hue}, 100%, 50%, 0.75)`);
const opaqueColorsByLabel = hues.map((hue) => `hsla(${hue}, 100%, 60%, 1)`);
document
    .querySelectorAll('input[name="color"]')
    .forEach((inputElement) => {
    inputElement.addEventListener("change", () => {
        if (inputElement.value === "default") {
            scatterGL.setPointColorer(null);
        }
        else if (inputElement.value === "label") {
            scatterGL.setPointColorer((i, selectedIndices, hoverIndex) => {
                const labelIndex = dataset.metadata[i]["labelIndex"];
                const opaque = renderMode !== "points";
                if (opaque) {
                    return opaqueColorsByLabel[labelIndex];
                }
                else {
                    if (hoverIndex === i) {
                        return "red";
                    }
                    // If nothing is selected, return the heavy color
                    if (selectedIndices.size === 0) {
                        return heavyTransparentColorsByLabel[labelIndex];
                    }
                    // Otherwise, keep the selected points heavy and non-selected light
                    else {
                        const isSelected = selectedIndices.has(i);
                        return isSelected
                            ? heavyTransparentColorsByLabel[labelIndex]
                            : lightTransparentColorsByLabel[labelIndex];
                    }
                }
            });
        }
    });
});
const dimensionsToggle = document.querySelector('input[name="3D"]');
dimensionsToggle.addEventListener("change", (_) => {
    const is3D = dimensionsToggle.checked;
    scatterGL.setDimensions(is3D ? 3 : 2);
});
const sequencesToggle = document.querySelector('input[name="sequences"]');
sequencesToggle.addEventListener("change", (_) => {
    const showSequences = sequencesToggle.checked;
    scatterGL.setSequences(showSequences ? sequences : []);
});
// Set up controls for buttons
const selectRandomButton = document.getElementById("select-random");
selectRandomButton.addEventListener("click", () => {
    const randomIndex = Math.floor(dataPoints.length * Math.random());
    scatterGL.select([randomIndex]);
});
const toggleOrbitButton = document.getElementById("toggle-orbit");
toggleOrbitButton.addEventListener("click", () => {
    if (scatterGL.isOrbiting()) {
        scatterGL.stopOrbitAnimation();
    }
    else {
        scatterGL.startOrbitAnimation();
    }
});
export function makeSequences(points, metadata, nSequencesPerLabel = 3, sequenceLength = 5) {
    const pointIndicesByLabel = new Map();
    points.forEach((_, index) => {
        const label = metadata[index].label;
        const pointIndices = pointIndicesByLabel.get(label) || [];
        pointIndices.push(index);
        pointIndicesByLabel.set(label, pointIndices);
    });
    const sequences = [];
    pointIndicesByLabel.forEach((indices) => {
        for (let i = 0; i < nSequencesPerLabel; i++) {
            const sequence = { indices: [] };
            for (let j = 0; j < sequenceLength; j++) {
                const index = indices[i * sequenceLength + j];
                sequence.indices.push(index);
            }
            sequence.indices.push(sequence.indices[0]);
            sequences.push(sequence);
        }
    });
    return sequences;
}
