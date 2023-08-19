function generateSamples(nrSamples) {
    let classIndex = nrSamples.flatMap((e,i) => d3.range(e).map(_ => i));

    return d3.range(d3.sum(nrSamples)).map((_,i) => {
        return {sample: i, dataclass: classIndex[i], sortIdx: i, set: null}
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