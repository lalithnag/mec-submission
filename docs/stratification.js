import { generateSamples, shuffleSamples, splitToFiles } from "./util.js";

const margin = {top: 0, right: 10, bottom: 0, left: 10};
const svgHeight = 380;
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

let inProgress = false;

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

d3.select('#class-legend')
    .selectAll('.classes')
    .data(classes)
    .join(
        enter => {
            let div = enter.append('div')
                .attr('class', 'classes')
                .style('display', 'inline-block')
            
            div.append('span')
                .style('display', 'inline-block')
                .style('width', '10px')
                .style('height', '10px')
                .style('border-radius', '50%')
                .style('background-color', d => classColors(d));
            
            div.append('div')
                .style('display', 'inline-block')
                .style('margin-left', '5px')
                .html(d => `Class ${d}`);

            return div;
        });

d3.select('#group-legend')
    .selectAll('.groups')
    .data(d3.range(2))
    .join(
        enter => {
            let div = enter.append('div')
                .attr('class', 'classes')
                .style('display', 'inline-block')
            
            div.append('span')
                .style('display', 'inline-block')
                .style('width', '10px')
                .style('height', '10px')
                .style('border-radius', (d) => d === 0 ? '50%': '0%')
                .style('background-color', 'gray');
            
            div.append('div')
                .style('display', 'inline-block')
                .style('margin-left', '5px')
                .html(d => `Group ${d}`);

            return div;
        });

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


g.append('line')
    .attr('transform', `translate(0, ${setRectY + rectHeight + datasetTextHeight})`)
    .attr('x1', 0)
    .attr('x2', svgWidth - margin.right - margin.left)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', 'lightgray')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.3);

// barchart area
const barChartTopMargin = 20;
const barchartLabelMargin = 15;

let barchartG = g.append('g')
    .attr('class', 'barchart-g')
    .attr('transform', `translate(0, ${setRectY + rectHeight + datasetTextHeight + barChartTopMargin})`);

let chartXScale = d3.scaleBand()
    .domain(d3.range(3))
    .range([0, svgWidth - margin.right - margin.left])
    .padding(0.5);

let dataclassXScale = d3.scaleBand()
    .domain(classes)
    .range([0, chartXScale.bandwidth()])
    .padding(0.1);;

const barchartHeight = 100;

let dataclassYScale = d3.scaleLinear()
    .domain([0, d3.max(nrSamples)])
    .range([barchartHeight, 0]);

barchartG.append('text')
    .attr('class', 'chart-title-dataset header-medium')
    .attr('x', chartXScale(0) + chartXScale.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('fill', 'gray')
    .html('Dataset');

let chartsG = barchartG.append('g')
    .attr('class', 'barchart-g')
    .attr('transform', `translate(0, ${barchartLabelMargin})`);

let classData = d3.rollup(samples, v => v.length, k => k.dataclass);

let datasetBarchart = chartsG.append('g')
    .attr('class', 'barchart')
    .attr('transform', `translate(${chartXScale(0)})`);

datasetBarchart.append('g')
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
    );

datasetBarchart.append('g')
    .attr("transform", "translate(0," + barchartHeight + ")")
    .call(d3.axisBottom(dataclassXScale)
        .tickFormat(d => `Class ${d}`)
    )
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

datasetBarchart.append("g")
    .call(d3.axisLeft(dataclassYScale)
        .ticks(6)
    );

datasetBarchart.append('text')
    .attr('class', 'header-small')
    .attr('x', -30)
    .attr('y', dataclassYScale.range()[0] / 2)
    .attr("transform", `rotate(${-90} ${-30} ${dataclassYScale.range()[0] / 2})`)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('fill', 'gray')
    .html('No. of samples');

let drawClassBarchart = function() {

    barchartG.selectAll('.chart-title')
        .data(sets, k => k)
        .join(
            enter => enter.append('text')
                .attr('class', 'chart-title header-medium')
                .attr('x', (_,i) => chartXScale(i + 1) + chartXScale.bandwidth() / 2)
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr('fill', d => d3.color(colors(d)).darker(1))
                .html(d => `${d} set`)
        );

    let setGroup = chartsG.selectAll('.barchart-set')
        .data(sets, k => k)
        .join(
            enter => enter.append('g')
                .attr('class', 'barchart-set')
                .attr('transform', (_, i) => `translate(${chartXScale(i + 1)})`)
        );

    setGroup.each((p, j, nodes) => {
        d3.select(nodes[j])
            .selectAll('.bar')
            .data(classes, k => k)
            .join(
                enter => enter.append('rect')
                    .attr('class', 'bar')
                    .attr('x', d => dataclassXScale(d))
                    .attr('y', (_, i) => dataclassYScale(sampleSetsCounter[j][i]))
                    .attr('width', dataclassXScale.bandwidth())
                    .attr('height', (_, i) => dataclassYScale(0) - dataclassYScale(sampleSetsCounter[j][i]))
                    .attr('fill', d => classColors(d))
                    .attr('opacity', 0.5),
                update => update.transition()
                    .duration(1000)
                    .attr('y', (_, i) => dataclassYScale(sampleSetsCounter[j][i]))
                    .attr('height', (_, i) => dataclassYScale(0) - dataclassYScale(sampleSetsCounter[j][i]))
            )
    });

    setGroup.selectAll('.x-axis')
        .data([0])
        .join(
            enter => enter.append('g')
            .attr('class', 'x-axis')
            .attr("transform", "translate(0," + barchartHeight + ")")
            .call(d3.axisBottom(dataclassXScale)
                .tickFormat(d => `Class ${d}`)
            )
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
        );

    setGroup.selectAll('.y-axis')
        .data([0])
        .join(
            enter => enter.append("g")
            .attr('class', 'y-axis')
            .call(d3.axisLeft(dataclassYScale)
                .ticks(6)
            )
        );

    setGroup.selectAll('.y-axis-label')
        .data([0])
        .join(
            enter => enter.append('text')
                .attr('class', 'y-axis-label header-small')
                .attr('x', -30)
                .attr('y', dataclassYScale.range()[0] / 2)
                .attr("transform", `rotate(${-90} ${-30} ${dataclassYScale.range()[0] / 2})`)
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr('fill', 'gray')
                .html('No. of samples')
        )
    }


drawClassBarchart()

let clearSamples = function() {
    g.selectAll('.sample').remove();
}

let resetSampleData = function() {
    samples.sort((a,b) => a.sample - b.sample);
    samples.forEach((s,i) => {s.set = null; s.sortIdx = i; s.displayIdx = i});
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
    g.selectAll('.sample-rect')
        .data(samples.filter(s => s.group === 0), k => k.sample)
        .enter()
        .append('circle')
        .attr('class', 'sample sample-circle')
        .attr('r', circleRadius)
        .attr('fill', d => classColors(d.dataclass))
        .attr('cx', d => dataScale(d.sample) + datasetBarMargin.left)
        .attr('cy', rectHeight / 2 + datasetTextHeight)

    g.selectAll('.sample-rect')
        .data(samples.filter(s => s.group === 1), k => k.sample)
        .enter()
        .append('rect')
        .attr('class', 'sample sample-rect')
        .attr('width', circleRadius * 2)
        .attr('height', circleRadius * 2)
        .attr('transform', `translate(${-circleRadius},${-circleRadius})`)
        .attr('fill', d => classColors(d.dataclass))
        .attr('x', d => dataScale(d.sample) + datasetBarMargin.left)
        .attr('y', rectHeight / 2 + datasetTextHeight)
}

let updateSamples = function(incCounter=false) {
    let circleSelection = g.selectAll('.sample-circle')
        .transition()
        .duration(1000)
        .attr('cx', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('cy', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2 + datasetTextHeight)
        .on('start', d => {
            if(incCounter) {
                d.set === 'train' ? sampleSetsCounter[0][d.dataclass]++ : sampleSetsCounter[1][d.dataclass]++;
                drawClassBarchart();
            }
        })
        .end();

    let rectSelection = g.selectAll('.sample-rect')
        .transition()
        .duration(1000)
        .attr('x', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('y', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2 + datasetTextHeight)
        .on('start', d => {
            if(incCounter) {
                d.set === 'train' ? sampleSetsCounter[0][d.dataclass]++ : sampleSetsCounter[1][d.dataclass]++;
                drawClassBarchart();
            }
        })
        .end();

    return Promise.all([circleSelection, rectSelection]);
}

let updateSamplesDelay = function(incCounter=false) {
    let circleSelection = g.selectAll('.sample-circle')
        .transition()
        .delay(d => 1000 * d.displayIdx)
        .duration(1000)
        .attr('cx', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('cy', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2 + datasetTextHeight)
        .on('start', d => {
            if(incCounter) {
                d.set === 'train' ? sampleSetsCounter[0][d.dataclass]++ : sampleSetsCounter[1][d.dataclass]++;
                drawClassBarchart();
            }
        })
        .end();

    let rectSelection = g.selectAll('.sample-rect')
        .transition()
        .delay(d => 1000 * d.displayIdx)
        .duration(1000)
        .attr('x', d => d.set ? dataScale(d.sortIdx) + setXOffsetScale(d.set) : dataScale(d.sortIdx) + setXOffsetScale(d.set) + datasetBarMargin.left)
        .attr('y', d => d.set ? setRectY + rectHeight / 2 : rectHeight / 2 + datasetTextHeight)
        .on('start', d => {
            if(incCounter) {
                d.set === 'train' ? sampleSetsCounter[0][d.dataclass]++ : sampleSetsCounter[1][d.dataclass]++;
                drawClassBarchart();
            }
        })
        .end();

    return Promise.all([circleSelection, rectSelection]);
}

let resetSamplesAndHistograms = function() {
    if(samples[0].set) {
        resetBarcharts();
        drawClassBarchart();

        clearSamples();
        resetSampleData();
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
// const labelMargin = {top: 0, right: 0, bottom: 0, left: 0};

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

const stratifiedSplit = async function() {
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

const groupSplit = async function() {
    let group1Samples = samples.filter(s => s.group === 0);
    let group2Samples =samples.filter(s => s.group === 1);

    group1Samples.forEach((e, i) => {e.set = 'train'; e.sortIdx = i});
    group2Samples.forEach((e, i) => {e.set = 'test'; e.sortIdx = i});

    updateActualSetSize(split, [group1Samples.length, group2Samples.length]);
    drawSetRects();

    updateSamples(true);
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
        stratifiedSplit();
    } else if (splitMode === "group") {
        groupSplit();
    }
});

d3.selectAll('input[name="option"]').on('change', e => {
    let splitMode = d3.select(e.currentTarget).property("value");

    if(splitMode === "index") {
        d3.select('#split-description')
            .html(`The straightforward way to split a dataset is to take the first N samples for training and the remaining samples for testing.
                   However, this approach may introduce bias into the resulting dataset split, especially if the order of the samples entails relationships within the data.
                   Additionally, it may create sets that do not reflect the distribution of the source dataset or do not cover all classes.`)
    } else if (splitMode === "shuffle") {
        d3.select('#split-description')
            .html(`To avoid introducing the bias that results from data ordering, the samples can be shuffled before splitting.
                   This will yield more reliable evaluation results.`)
    } else if (splitMode === "stratified") {
        d3.select('#split-description')
            .html(`To obtain meaningful evaluation results, the distribution of the resulting sets should reflect the distribution of the source dataset.
                   However, this is not easy to achieve by simply shuffling the dataset, especially if the classes are highly imbalanced.
                   Stratified sampling aims to preserve the original distribution of classes in the training and test sets.`)
    } else if (splitMode === "group") {
        d3.select('#split-description')
            .html(`You may have noticed that both training and test sets contain samples of two different groups. One such grouping can be the ID of the patient.
                   By having samples from the same patient in the training and test sets, we introduce data leak which usually results in overly optimistic evaluation results.
                   To avoid this, we need to ensure that training and test sets contain samples from different patients.`)
    }
});

d3.select('#class-sort-btn').on('click', () => {
    resetSamplesAndHistograms();

    samples.sort((a, b) => a.dataclass - b.dataclass);

    samples.forEach((s, i) => s.sortIdx = i);

    updateSamples();
});

d3.select('#group-sort-btn').on('click', () => {
    resetSamplesAndHistograms();

    samples.sort((a, b) => a.group - b.group);

    samples.forEach((s, i) => s.sortIdx = i);

    updateSamples();
});

d3.select('#shuffle-btn').on('click', () => {
    resetSamplesAndHistograms();

    shuffleSamples(samples);

    samples.forEach((s, i) => s.sortIdx = i);

    updateSamples();
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

