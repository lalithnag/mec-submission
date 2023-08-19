import { generateSamples, shuffleSamples, splitToFiles } from "./util.js";

const margin = {top: 20, right: 50, bottom: 0, left: 10};
const svgHeight = 400;
const svgWidth = d3.select('#stratification').node().getBoundingClientRect().width;

const classes = d3.range(4);
const nrSamples = [22,4,15,7];
let samples = generateSamples(nrSamples);

const sets = ['train', 'test'];
let split = [0.8, 0.2]
let splitFiles = splitToFiles(split, samples.length)

const circleRadius = 4;
const rectHeight = 40;
let setRectY = 80;


const g = d3.select('#stratification')
    .attr('height', svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const datasetBarMargin = {top: 0, right: 50, bottom: 0, left: 50};

const dataScale = d3.scalePoint()
    .domain(samples.map(s => s.sample))
    .range([0, svgWidth - margin.left - margin.right - datasetBarMargin.right - datasetBarMargin.left])
    .padding(1);

const classColors = d3.scaleOrdinal()
    .domain(classes)
    .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']);

const colors = d3.scaleOrdinal()
        .domain(sets)
        .range(['#fdae61', '#2b83ba', '#abdda4']);

let setXOffsetScale = d3.scaleOrdinal()
        .domain(sets)
        setXOffsetScale.range([0, (dataScale(splitFiles[0] - 1) || 0) + datasetBarMargin.right + datasetBarMargin.left]);

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
    .attr('transform', `translate(0, ${setRectY})`);

let drawSetRects = function() {
    setG.selectAll('.set-rect')
        .data(sets)
        .join(
            enter => enter.append('rect')
                .attr('class', 'set-rect')
                .attr('y', 0)
                .attr('height', rectHeight)
                .attr('fill', d => colors(d))
                .attr('opacity', 0.3)
                .attr('x', d => setXOffsetScale(d))
                .attr('width', (_, i) => splitFiles[0] === 0 ? 0 : dataScale(splitFiles[i] - 1) + dataScale.step()),
            update => update.transition()
                .duration(1000)
                .attr('x', d => setXOffsetScale(d))
                .attr('width', (_, i) => splitFiles[0] === 0 ? 0 : dataScale(splitFiles[i] - 1) + dataScale.step()),
        )
}

drawSetRects();

let clearSamples = function() {
    samples = []
    g.selectAll('.sample').remove();
}

let initSampleData = function() {
    samples = generateSamples(nrSamples);
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
        .attr('cx', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('cy', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2)
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

let resetSamples = function() {
    clearSamples();
    initSampleData();
    initSamples();
}

initSamples()
// drawSampleShadows()

const barHeight = 50;

const labelMargin = {top: 0, right: 0, bottom: 0, left: 0};

const indexSplit = function() {
    samples.slice(0, splitFiles[0]).forEach((e, i) => {e.set = 'train'; e.sortIdx = i});
    samples.slice(splitFiles[0]).forEach((e,i) => {e.set = 'test'; e.sortIdx = i});

    updateSamples();
}

const shuffleSplit = async function() {
    shuffleSamples(samples);

    samples.forEach((s,i) => s.sortIdx = i);

    await updateSamples();

    samples.slice(0, splitFiles[0]).forEach((e, i) => {e.set = 'train'; e.sortIdx = i});
    samples.slice(splitFiles[0]).forEach((e,i) => {e.set = 'test'; e.sortIdx = i});

    updateSamples();
}

d3.select('#split-btn').on('click', () => {
    let splitMode = d3.select('input[name="option"]:checked').property("value");
    
    resetSamples();

    if(splitMode === "index") {
        indexSplit();
    } else if (splitMode === "shuffle") {
        shuffleSplit();
    }
});

d3.select("#ratio-slider").on("input", (e) => {
    let trainTestRatio = d3.select(e.currentTarget).property('value');
    d3.select('#train-ratio').html(trainTestRatio);

    // update data
    split = [trainTestRatio / 100, 1 - (trainTestRatio / 100)];
    splitFiles = splitToFiles(split, samples.length);
    setXOffsetScale.range([0, (dataScale(splitFiles[0] - 1) || 0) + datasetBarMargin.right + datasetBarMargin.left]);

    resetSamples();
    drawSetRects();
});

