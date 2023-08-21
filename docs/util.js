function generateSamples(nrSamples) {
    const classIndex = nrSamples.flatMap((e,i) => d3.range(e).map(_ => i));

    const nrGroup1Samples = 9;
    let groupIdx = []

    while(groupIdx.length < nrGroup1Samples) {
        let index = Math.floor(Math.random() * d3.sum(nrSamples));

        if(!groupIdx.includes(index)) {
            groupIdx.push(index)
        }
    }

    let groupIndex = classIndex.map((_,i) => groupIdx.includes(i) ? 1 : 0);

    return d3.range(d3.sum(nrSamples)).map((_,i) => {
        return {sample: i, dataclass: classIndex[i], sortIdx: i, displayIdx: i, set: null, group: groupIndex[i]}
    })
}

// inplace shuffling
function shuffleSamples(array) {
    let j, x, i;

    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
}

function splitToFiles(split, nrSamples) {
    return [Math.floor(split[0] * nrSamples), Math.ceil(split[1] * nrSamples)];
}

export {generateSamples, shuffleSamples, splitToFiles}