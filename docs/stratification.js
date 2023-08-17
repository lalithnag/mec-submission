const margin = {top: 20, right: 0, bottom: 10, left: 10};
const svgHeight = 400;

const grid = {nrRows: 5, nrCols: 5};
const classes = d3.range(4);
const samples = generateSamples([22,4,15,7]);

const circleRadius = 4;
const circleDistance = 12;

const svgWidth = d3.select('#stratification').node().getBoundingClientRect().width;

const split = [0.8, 0.2]

const g = d3.select('#stratification')
    .attr('height', svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const classScale = d3.scaleBand()
    .domain(classes)
    .range([0, svgWidth - margin.left - margin.bottom])
    .paddingInner(0.2);

const classColors = d3.scaleOrdinal()
    .domain(classes)
    .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']);

let dataclasses = g.selectAll('.dataclass')
    .data(classes)
    .join(
        enter => enter.append('g')
            .attr('class', 'dataclass')
            .attr('transform', d => `translate(${classScale(d)},0)`)
    );

const sets = ['train', 'test'];
const colors = d3.scaleOrdinal()
        .domain(sets)
        .range(['#fdae61', '#2b83ba', '#abdda4']);

const setScale = d3.scaleBand()
        .domain(sets)
        .range([0, svgWidth - margin.left - margin.bottom])
        .paddingInner(0.2);

const setClassScale = d3.scaleBand()
        .domain(classes)
        .range([0, setScale.bandwidth()])
        .paddingOuter(0.3)

dataclasses.each((p,j,nodes)=> {
    d3.select(nodes[j])
    .selectAll('.class-label')
    .data([p])
    .join(
        enter => enter.append('text')
            .attr('class', 'class-label')
            .attr('font-style', 'italic')
            .attr('font-size', '11pt')
            .html(`Class ${p + 1}`)
    );
});


let calculateSampleXPosition = function(s) {
    if(s.set) {
        return setScale(s.set) + setClassScale(s.dataclass)
    } else {
        return classScale(s.dataclass) + (s.sortIdx % grid.nrCols * circleDistance);
    }
}

let calculateSampleYPosition = function(s) {
    if(s.set) {
        return (svgHeight - margin.top - margin.bottom) - (s.sortIdx * circleDistance);
    } else {
        return Math.floor(s.sortIdx / grid.nrRows) * circleDistance
    }
}


let drawSamples = function() {
    g.selectAll('.sample')
        .data(samples, k => k.sample)
        .join(
            enter => enter.append('circle')
                .attr('class', 'sample')
                .attr('r', circleRadius)
                .attr('fill', d => classColors(d.dataclass))
                .attr('cx', calculateSampleXPosition)
                .attr('cy', calculateSampleYPosition),
            update => update.transition()
            .duration(2000)
            .attr('cx', calculateSampleXPosition)
            .attr('cy', calculateSampleYPosition)
        );
}

drawSamples()

const barHeight = 50;

g.selectAll('.set')
    .data(sets)
    .join(
        enter => enter.append('rect')
            .attr('class', 'set')
            .attr('width', setScale.bandwidth())
            .attr('height', barHeight)
            .attr('x', d => setScale(d))
            .attr('y', svgHeight - margin.bottom - barHeight)
            .attr('fill', d => colors(d))
            .attr('opacity', 0.5)
    )

let samping = function() {
    let nrSamples = Math.floor(samples.length * split[0]);
    let classCounter = [[0,0,0,0], [0,0,0,0]]

    samples.slice(0, nrSamples).forEach(e => e.set = 'train');
    samples.slice(nrSamples).forEach(e => e.set = 'test');

    samples.forEach(e => e.sortIdx = e.set === 'train' ? classCounter[0][e.dataclass]++ : classCounter[1][e.dataclass]++)

    console.log(samples)

    drawSamples();
}

document.getElementById("btn1").addEventListener("click", samping);


function generateSamples(nrSamples) {
    let classIndex = nrSamples.flatMap((e,i) => d3.range(e).map(_ => i));
    let classCounter = [0,0,0,0]

    return d3.range(d3.sum(nrSamples)).map((_,i) => {
        return {sample: i, dataclass: classIndex[i], sortIdx: classCounter[classIndex[i]]++, set: null}
    })
}