import { generateSamples, shuffleSamples, splitToFiles } from "./util.js";

const margin = {top: 0, right: 10, bottom: 0, left: 10};
const svgHeight = 400;
const svgWidth = d3.select('#stratification').node().getBoundingClientRect().width;

const classes = d3.range(4);
const nrSamples = [22,4,15,9];
let samples = generateSamples(nrSamples);

const sets = ['train', 'test'];
let split = [0.8, 0.2]
let splitFiles = splitToFiles(split, samples.length)

const circleRadius = 4;
const rectHeight = 40;
let setRectY = 120;

let sampleSetsCounter = sets.map(_ => classes.map(c => 0));

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


const datasetTextHeight = 30;

g.append('text')
    .attr('class', 'header')
    .attr('x', (svgWidth - margin.left - margin.right) / 2)
    .attr('y', datasetTextHeight / 2)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('fill', 'gray')
    .html(`Dataset (${samples.length} samples)`);

g.append('rect')
    .attr('transform', `translate(${datasetBarMargin.left}, ${datasetBarMargin.top + datasetTextHeight})`)
    .attr('x', 0)
    .attr('width', svgWidth - margin.right - margin.left - datasetBarMargin.right - datasetBarMargin.left)
    .attr('y', 0)
    .attr('height', rectHeight)
    .attr('rx', 5)
    .attr('fill', 'lightgray')
    .attr('fill-opacity', 0.2)
    .attr('stroke', 'lightgray')
    .attr('stroke-width', 1)
    .attr("stroke-dasharray", "3 1")
    ;

let setG = g.append('g')
    .attr('class', 'set-g')
    .attr('transform', `translate(0, ${setRectY})`);

let defs = g.append('defs');

defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('orient', 'auto')
    .attr('markerWidth', 100)
    .attr('markerHeight', 100)
    .attr('refX', 0)
    .attr('refY', 3)
    .append('path')
    .attr('d', 'M0,0 V6 L4,3 Z')
    .attr('fill', 'lightgray')

let arrowPos = [60, margin.top + datasetTextHeight + rectHeight + 10];

g.append('path')
    .attr('d', 'M15,0  L0,20')
    .attr('transform', `translate(${arrowPos[0]},${arrowPos[1]})`)
    .attr('stroke-width', 3)
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', 1)
    .attr('marker-end', 'url(#arrowhead)')

g.append('path')
    .attr('d', 'M0,0  L15,20')
    .attr('transform', `translate(${svgWidth - margin.right - margin.left - arrowPos[0] - 15},${arrowPos[1]})`)
    .attr('stroke-width', 3)
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', 1)
    .attr('marker-end', 'url(#arrowhead)')

let drawSetRects = function() {
    setG.selectAll('.set-rect')
        .data(sets)
        .join(
            enter => enter.append('rect')
                .attr('class', 'set-rect')
                .attr('y', 0)
                .attr('height', rectHeight)
                .attr('rx', 5)
                .attr('fill', d => colors(d))
                .attr('fill-opacity', 0.2)
                .attr('stroke', d => colors(d))
                .attr('stroke-width', 1)
                .attr("stroke-dasharray", "3 1")
                .attr('x', d => setXOffsetScale(d))
                .attr('width', (_, i) => splitFiles[0] === 0 ? 0 : dataScale(splitFiles[i] - 1) + dataScale.step()),
            update => update.transition()
                .duration(1000)
                .attr('x', d => setXOffsetScale(d))
                .attr('width', (_, i) => splitFiles[0] === 0 ? 0 : dataScale(splitFiles[i] - 1) + dataScale.step()),
        )

    setG.selectAll('.set-label')
        .data(sets)
        .join(
            enter => enter.append('text')
                .attr('class', 'set-label header')
                .attr('y', rectHeight + datasetTextHeight / 2)
                .attr('x', (d,i) => {
                    let x = setXOffsetScale(d);
                    let width = splitFiles[0] === 0 ? 0 : dataScale(splitFiles[i] - 1) + dataScale.step();
                    return x + width / 2;
                })
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr('fill', d => d3.color(colors(d)).darker(1))
                .html(d => `${d} set`),
            update => update.transition()
                .duration(1000)
                .attr('x', (d,i) => {
                    let x = setXOffsetScale(d);
                    let width = splitFiles[0] === 0 ? 0 : dataScale(splitFiles[i] - 1) + dataScale.step();
                    return x + width / 2;
                })
        )
        
}

drawSetRects();

// barchart area
let barchartG = g.append('g')
    .attr('class', 'barchart-g')
    .attr('transform', `translate(0, ${setRectY + rectHeight + datasetTextHeight})`);

let chartXScale = d3.scaleBand()
    .domain(d3.range(3))
    .range([0, svgWidth - margin.right - margin.left])
    .padding(0.5);

let dataclassXScale = d3.scaleBand()
    .domain(classes)
    .range([0, chartXScale.bandwidth()]);

const barchartHeight = 100;

let dataclassYScale = d3.scaleLinear()
    .domain([0, d3.max(nrSamples)])
    .range([barchartHeight, 0]);

let classData = d3.rollup(samples, v => v.length, k => k.dataclass);

barchartG.append('g')
    .attr('class', 'barchart')
    .attr('transform', `translate(${chartXScale(0)})`)
    .selectAll('bar')
    .data(classes)
    .join(
        enter => enter.append('rect')
            .attr('class', '.bar')
            .attr('x', d => dataclassXScale(d))
            .attr('y', d => dataclassYScale(classData.get(d)))
            .attr('width', dataclassXScale.bandwidth())
            .attr('height', d => dataclassYScale(0) - dataclassYScale(classData.get(d)) )
            .attr('fill', d => classColors(d))
            .attr('opacity', 0.5)
    )


let drawClassBarchart = function() {
    // let classDataSets = [
    //     d3.rollup(samples.filter(s => s.dataclass === 'train'), v => v.length, k => k.dataclass),
    //     d3.rollup(samples.filter(s => s.dataclass === 'test'), v => v.length, k => k.dataclass)
    // ];

    let group = barchartG.selectAll('.barchart-set')
        .data(sets, k => k)
        .join(
            enter => enter.append('g')
                .attr('class', 'barchart-set')
                .attr('transform', (_,i) => `translate(${chartXScale(i+1)})`)
        );

    group.each((p,j,nodes) => {
        d3.select(nodes[j])
        .selectAll('.bar')
        .data(classes, k => k)
        .join(
            enter => enter.append('rect')
                .attr('class', 'bar')
                .attr('x', d => dataclassXScale(d))
                .attr('y', (d,i) => dataclassYScale(sampleSetsCounter[j][i]))
                .attr('width', dataclassXScale.bandwidth())
                .attr('height', (d,i) => dataclassYScale(0) - dataclassYScale(sampleSetsCounter[j][i]))
                .attr('fill', d => classColors(d))
                .attr('opacity', 0.5),
            update => update.transition()
                .duration(500)
                .attr('y', (_,i) => dataclassYScale(sampleSetsCounter[j][i]))
                .attr('height', (_,i) => dataclassYScale(0) - dataclassYScale(sampleSetsCounter[j][i]))
        )
    });
}


drawClassBarchart()








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
        .attr('cy', rectHeight / 2 + datasetTextHeight)
}

let updateSamples = function(incCounter=false) {
    return g.selectAll('.sample')
        .transition()
        .duration(1000)
        .attr('cx', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('cy', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2 + datasetTextHeight)
        .on('end', d => {
            if(incCounter) {
                d.set === 'train' ? sampleSetsCounter[0][d.dataclass]++ : sampleSetsCounter[1][d.dataclass]++;
                drawClassBarchart();
            }
        })
        .end()
}

let updateSamplesDelay = function(incCounter=false) {
    return g.selectAll('.sample')
        .transition()
        .delay(d => 1000 * d.displayIdx)
        .duration(1000)
        .attr('cx', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('cy', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2 + datasetTextHeight)
        .on('end', d => {
            if(incCounter) {
                d.set === 'train' ? sampleSetsCounter[0][d.dataclass]++ : sampleSetsCounter[1][d.dataclass]++;
                drawClassBarchart();
            }
        })
        .end()
}

let resetSamplesAndHistograms = function() {
    if(samples[0].set) {
        resetBarcharts();
        drawClassBarchart();

        clearSamples();
        initSampleData();
        initSamples();
    }
}

let resetBarcharts = function() {
    sampleSetsCounter = sets.map(_ => classes.map(c => 0));
    d3.selectAll('.barchart-set').selectAll('.bar').remove();
}

initSamples()
// drawSampleShadows()

// const barHeight = 50;

const labelMargin = {top: 0, right: 0, bottom: 0, left: 0};

const indexSplit = function() {
    samples.slice(0, splitFiles[0]).forEach((e, i) => {e.set = 'train'; e.sortIdx = i});
    samples.slice(splitFiles[0]).forEach((e,i) => {e.set = 'test'; e.sortIdx = i});

    updateSamples(true);
}

const shuffleSplit = async function() {
    shuffleSamples(samples);

    samples.forEach((s,i) => s.sortIdx = i);

    await updateSamples();

    samples.slice(0, splitFiles[0]).forEach((e, i) => {e.set = 'train'; e.sortIdx = i});
    samples.slice(splitFiles[0]).forEach((e,i) => {e.set = 'test'; e.sortIdx = i});

    updateSamples(true);
}

const stratifiedsplit = async function() {
    let classCounter = [0,0];
    classes.forEach((cl, i) => {
        let clSamples = samples.filter(s => s.dataclass === cl);
        shuffleSamples(clSamples);

        let ratio = clSamples.length / samples.length;

        let nrTrainFiles = Math.floor(splitFiles[0] * ratio);
        
        clSamples.slice(0, nrTrainFiles).forEach((s,j) => {s.set = 'train'; s.displayIdx = i; s.sortIdx = classCounter[0]++});
        clSamples.slice(nrTrainFiles).forEach((s,j) => {s.set = 'test'; s.displayIdx = i; s.sortIdx = classCounter[1]++});

    });

    updateActualSetSize(split, classCounter);
    drawSetRects();
    await updateSamplesDelay(true);

    sets.forEach(set => {
        let setSamples = samples.filter(s => s.set === set);
        shuffleSamples(setSamples);

        setSamples.forEach((s,i) => s.sortIdx = i);
    });

    updateSamples();
}

d3.select('#split-btn').on('click', () => {
    let splitMode = d3.select('input[name="option"]:checked').property("value");
    
    resetSamplesAndHistograms();
    updateActualSetSize(split);
    drawSetRects();

    if(splitMode === "index") {
        indexSplit();
    } else if (splitMode === "shuffle") {
        shuffleSplit();
    } else if (splitMode === "stratified") {
        stratifiedsplit();
    }
});

d3.select('#sort-btn').on('click', () => {
    if(!samples[0].set) {
        samples.sort((a, b) => a.dataclass - b.dataclass);

        samples.forEach((s,i) => s.sortIdx = i);

        updateSamples();
    }
});

d3.select('#shuffle-btn').on('click', () => {
    if(!samples[0].set) {
        shuffleSamples(samples);

        samples.forEach((s,i) => s.sortIdx = i);

        updateSamples();
    }
});

d3.select('#reset-btn').on('click', () => {
    resetSamplesAndHistograms();
});

let updateActualSetSize = function(newSplit, newSplitfiles) {
    split = newSplit;
    splitFiles = newSplitfiles ? newSplitfiles : splitToFiles(split, samples.length);

    setXOffsetScale.range([0, (dataScale(splitFiles[0] - 1) || 0) + datasetBarMargin.right + datasetBarMargin.left]);
}

d3.select("#ratio-slider").on("input", (e) => {
    let trainTestRatio = d3.select(e.currentTarget).property('value');
    d3.select('#train-ratio').html(trainTestRatio);

    // update data
    resetSamplesAndHistograms();
    updateActualSetSize([trainTestRatio / 100, 1 - (trainTestRatio / 100)]);
    drawSetRects();
});

