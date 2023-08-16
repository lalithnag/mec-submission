const margin = {top: 10, right: 0, bottom: 10, left: 10};
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
        .range(['#fdae61', '#abdda4', '#2b83ba']);

const setScale = d3.scaleBand()
        .domain(sets)
        .range([0, svgWidth - margin.left - margin.bottom])
        .paddingInner(0.2);

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

    

    d3.select(nodes[j])
        .selectAll('.sample')
        .data(samples.filter(e => e.dataclass === p))
        .join(
            enter => enter.append('circle')
                .attr('class', 'sample')
                .attr('r', circleRadius)
                .attr('cx', (d,i) => d.set ? setScale(d.set) : i % grid.nrCols * circleDistance)
                .attr('cy', (d,i) => d.set ? setScale(d.set) : Math.floor(i / grid.nrRows) * circleDistance)
                .attr('fill', classColors(p))
        );
});

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
    let nrSamples = Math.floor(samples.reduce((p,c) => p + c.length) * splt[i]);
    let counter = 0;
    samples.flatMap(e => e).slice(nrSamples).forEach(e => e.set = 'train')
    samples.flatMap(e => e).slice(nrSamples, ).forEach(e => e.set = 'test')
}

function generateSamples(nrSamples) {
    let classIndex = nrSamples.flatMap((e,i) => d3.range(e).map(_ => i));
    return d3.range(d3.sum(nrSamples)).map((_,i) => {
        return {sample: i, dataclass: classIndex[i], set: null}
    })
}