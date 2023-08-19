import { generateSamples, shuffleSamples, splitToFiles } from "./util.js";


const margin = {top: 20, right: 10, bottom: 0, left: 10};
const svgHeight = 400;

const classes = d3.range(4);
const samples = generateSamples([1,1,1,1]); // 22,4,15,7

const circleRadius = 4;
const circleDistance = 12;

const svgWidth = d3.select('#stratification').node().getBoundingClientRect().width;


let split = [0.8, 0.2]

const g = d3.select('#stratification')
    .attr('height', svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const datasetBarMargin = {top: 0, right: 50, bottom: 0, left: 50};

const dataScale = d3.scalePoint()
    .domain(samples.map(s => s.sample))
    .range([0, svgWidth - margin.left - margin.right - datasetBarMargin.right - datasetBarMargin.left])
    .padding(0.5);

const dataAmountScale = d3.scalePoint()
    .domain(samples.map(s => s.sample))
    .range([0, svgWidth - margin.left - margin.right - datasetBarMargin.right - datasetBarMargin.left]);

const classColors = d3.scaleOrdinal()
    .domain(classes)
    .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']);

const sets = ['train', 'test'];
const colors = d3.scaleOrdinal()
        .domain(sets)
        .range(['#fdae61', '#2b83ba', '#abdda4']);

let setXScale = d3.scaleOrdinal()
        .domain(sets)
        .range([0, (svgWidth - margin.right - margin.left) * split[0] + datasetBarMargin.right + datasetBarMargin.left]);

const rectHeight = 40;

g.append('rect')
    .attr('transform', `translate(${datasetBarMargin.left}, ${datasetBarMargin.top})`)
    .attr('x', 0)
    .attr('width', svgWidth - margin.right - margin.left - datasetBarMargin.right - datasetBarMargin.left)
    .attr('y', 0)
    .attr('height', rectHeight)
    .attr('fill', 'lightgray')
    .attr('opacity', 0.1);

let setG = g.append('g')
    .attr('class', 'set-g')
    .attr('transform', `translate(0, ${100})`);

let drawSetRects = function() {
    let nrFiles = splitToFiles(split, samples.length)

    setXScale.range([0, dataScale(nrFiles[0] - 1) + dataScale.step() / 2 + datasetBarMargin.right + datasetBarMargin.left]);

    setG.selectAll('.set-rect')
        .data(sets)
        .join(
            enter => enter.append('rect')
                .attr('class', 'set-rect')
                .attr('y', 0)
                .attr('height', rectHeight)
                .attr('fill', d => colors(d))
                .attr('opacity', 0.3),
            update => update.transition()
                .duration(5000)
        ).attr('x', (d, i) => {
            if (i === 0) {
                return 0;
            } else {
                return setXScale(d);
            }
        }).attr('width', (_, i) => {
            if (nrFiles[i] === 0) {
                return 0;
            } else {
                let step;
                if (nrFiles[i] === samples.length) {
                    step = dataScale.step();
                } else {
                    step = dataScale.step() / 2;
                }

                return dataScale(nrFiles[i] - 1) + step;
            }
        });
}

drawSetRects()

let clearSamples = function() {
    samples.forEach(s => s.set = null);
    g.selectAll('.sample').remove();
}

let drawSampleShadows = function() {
    g.selectAll('.sample-shadow')
        .data(samples, k => k.sample)
        .join(
            enter => enter.append('circle')
                .attr('class', 'sample-shadow')
                .attr('r', circleRadius)
                .attr('fill', d => classColors(d.dataclass))
                .attr('cx', d => dataScale(d.sample))
                .attr('cy', 0)
                .attr('opacity', 0.2)
        );
}

let initSamples = function() {
    g.selectAll('.sample')
        .data(samples, k => k.sample)
        .enter()
        .append('circle')
        .attr('class', 'sample')
        .attr('r', circleRadius)
        .attr('fill', d => classColors(d.dataclass))
        .attr('cx', d => dataScale(d.sample) + datasetBarMargin.left)
        .attr('cy', rectHeight / 2)
}

let updateSamples = function() {
    return g.selectAll('.sample')
        .transition()
        .duration(2000)
        .attr('cx', d => dataScale(d.sortIdx))
        .attr('cy', d => d.set ? 120 : 20)
        .end()
}

let updateSamplesDelay = function() {
    return g.selectAll('.sample')
        .transition()
        .delay((_,i) => 150 * i)
        .duration(2000)
        .attr('cx', d => dataScale(d.sample))
        .attr('cy',  80)
        .end()
}


initSamples()
// drawSampleShadows()

const barHeight = 50;

const labelMargin = {top: 0, right: 0, bottom: 0, left: 0};

// g.selectAll('.set-label')
//     .data(sets)
//     .join(
//         enter => enter.append('text')
//             .attr('class', 'set-label')
//             .attr('x', d => setScale(d) + setScale.bandwidth() / 2)
//             .attr('y', svgHeight - margin.top - margin.bottom - labelMargin.bottom)
//             .attr('text-anchor', 'middle')
//             .attr('font-style', 'italic')
//             .attr('font-size', '11pt')
//             .html(d => 'Train')
//     );

// const textHeight = d3.select('.set-label').node().getBBox().height;

// const lineWidth = 1;

// g.selectAll('.set-line')
//     .data(sets)
//     .join(
//         enter => enter.append('line')
//             .attr('class', 'set-line')
//             .attr('x1', d => setScale(d))
//             .attr('x2', d => setScale(d) + setScale.bandwidth())
//             .attr('y1', svgHeight - margin.top - margin.bottom - labelMargin.bottom - textHeight - labelMargin.top)
//             .attr('y2', svgHeight - margin.top - margin.bottom - labelMargin.bottom - textHeight - labelMargin.top)
//             .attr('stroke', 'black')
//             .attr('stroke-width', lineWidth)
//     );

const withoutShuffling = function() {
    clearSamples();
    initSamples();

    let nrSamples = Math.floor(samples.length * split[0]);
    let classCounter = [[0,0,0,0], [0,0,0,0]]

    samples.slice(0, nrSamples).forEach(e => e.set = 'train');
    samples.slice(nrSamples).forEach(e => e.set = 'test');

    samples.forEach(e => e.sortIdx = e.set === 'train' ? classCounter[0][e.dataclass]++ : classCounter[1][e.dataclass]++)

    updateSamples();
}


const shuffledSplit = async function() {
    clearSamples();
    initSamples();

    shuffleSamples(samples);

    let counter = 0;
    samples.forEach(s => s.sortIdx = counter++);

    await updateSamples();

    let nrSamples = Math.floor(samples.length * split[0]);
    let classCounter = [[0,0,0,0], [0,0,0,0]];

    samples.slice(0, nrSamples).forEach(e => e.set = 'train');
    samples.slice(nrSamples).forEach(e => e.set = 'test');

    // sort again
    samples.sort((a,b) => a.sample - b.sample);

    samples.forEach(e => e.sortIdx = e.set === 'train' ? classCounter[0][e.dataclass]++ : classCounter[1][e.dataclass]++)

    updateSamples();
}

d3.select('#split-btn').on('click', (e) => {
    let splitMode = d3.select('input[name="option"]:checked').property("value");
    if(splitMode === "index") {
        withoutShuffling();
    } else if (splitMode === "shuffle") {
        console.log('shuffle')
        shuffledSplit();
    }
});

d3.select("#ratio-slider").on("input", (e) => {
    let trainTestRatio = d3.select(e.currentTarget).property('value');
    d3.select('#train-ratio').html(trainTestRatio);
    split = [trainTestRatio / 100, 1 - (trainTestRatio / 100)];
    drawSetRects()
});

