let sortType, dataType, dataPoints, dataPointsDisplay, speed, visualization, speedDisplay, sort, reset;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    sortType = createSelect();
    sortType.position(10, 10);
    sortType.size(200, 30);
    sortType.style('font-size', '20px');
    sortType.style('border', '1px solid #000000');
    sortType.option('Bubble sort');
    sortType.option('Quick sort');
    sortType.option('Bogo sort');
    sortType.selected('Bubble sort');
    sortType.changed(updateSortType);

    dataType = createSelect();
    dataType.position(10, 50);
    dataType.size(200, 30);
    dataType.style('font-size', '20px');
    dataType.style('border', '1px solid #000000');
    dataType.option('Random data');
    dataType.option('Consecutive numbers');
    dataType.selected('Random data');
    dataType.changed(updateDataType);

    dataPoints = createSlider(5, 200, 50);
    dataPoints.position(230, 10);
    dataPoints.size(200, 30);
    dataPoints.input(updateDataPoints);

    dataPointsDisplay = createP('Data points: ' + dataPoints.value());
    dataPointsDisplay.position(450, 10);
    dataPointsDisplay.style('font-size', '20px');
    dataPointsDisplay.style('margin', '5px');

    speed = createSlider(1, 200, 50);
    speed.position(230, 50);
    speed.size(200, 30);
    speed.input(updateSortSpeed);

    speedDisplay = createP('Delay: ' + speed.value());
    speedDisplay.position(450, 50);
    speedDisplay.style('font-size', '20px');
    speedDisplay.style('margin', '5px');

    visualization = createSelect();
    visualization.position(10, 90);
    visualization.size(200, 30);
    visualization.style('font-size', '20px');
    visualization.style('border', '1px solid #000000');
    visualization.option('None');
    visualization.option('Swap');
    visualization.option('Pivot and partition');
    visualization.disable('Pivot and partition');
    visualization.selected('None');


    sort = createButton('Sort');
    sort.position(windowWidth - 210, 10);
    sort.size(200, 60);
    sort.style('font-size', '40px');
    sort.style('background-color', '#99ff99');
    sort.style('border', '1px solid #000000');
    sort.mousePressed(sortData);

    reset = createButton('Reset');
    reset.position(windowWidth - 210, 80);
    reset.size(200, 60);
    reset.style('font-size', '40px');
    reset.style('background-color', '#ff9999');
    reset.style('border', '1px solid #000000');
    reset.mousePressed(resetData);
    
    updateDataType();
}

var data = [];
var sorting = false;

function draw() {
    clear();
    background(255);
    for(let i = 0; i < data.length; i++) {
        fill(0);
        noStroke();
        const visualizationType = visualization.value();
        if(visualizationType == 'Swap') {
            if(data[i].swap) {
                fill(255, 0, 0);
            } else {
                fill(0, 0, 0);
            }
        } else if(visualizationType == 'Pivot and partition') {
            if(data[i].pivot) {
                fill(255, 0, 0);
            } else if(data[i].partition) {
                fill(0, 0, 255);
            } else {
                fill(0, 0, 0);
            }
        } else {
            fill(0);
        }
        const width = windowWidth / data.length - 5;
        const height = map(data[i].value, 0, 100, 20, windowHeight / 2);
        rect(lerp(0, windowWidth, i / data.length) + 2.5, windowHeight - height, width, height);
    }
}

function updateSortType() {
    resetData();

    if(sortType.value() == 'Quick sort') {
        const pivotAndPartition = visualization.elt.children[2];
        pivotAndPartition.removeAttribute('disabled');
    } else {
        visualization.disable('Pivot and partition');
    }

    if(sortType.value() == 'Bogo sort') {
        visualization.disable('Swap');
    } else {
        const pivotAndPartition = visualization.elt.children[1];
        pivotAndPartition.removeAttribute('disabled');
    }
}

function updateDataType() {
    sorting = false;
    data = [];
    if(dataType.value() == 'Random data') {
        for(let i = 0; i < dataPoints.value(); i++) {
            data.push({
                value: random(0, 100)
            });
        }
    } else {
        for(let i = 0; i < dataPoints.value(); i++) {
            data.push({
                value: map(i, 0, dataPoints.value(), 0, 100)
            });
            randomize(data);
        }
    }
}

function updateDataPoints() {
    dataPointsDisplay.html('Data points: ' + dataPoints.value());
    updateDataType();
}

function updateSortSpeed() {
    speedDisplay.html('Delay: ' + speed.value());
}

function sortData() {
    if(sorting) return;
    sorting = true;
    if(sortType.value() == 'Bubble sort') {
        bubbleSort();
    } else if (sortType.value() == 'Quick sort') {
        quickSort(data, 0, data.length - 1);
    } else {
        bogoSort();
    }
}

function resetData() {
    updateDataType();
}

async function bubbleSort() {
    for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data.length - i - 1; j++) {
            if(data[j].value > data[j + 1].value) {

                if(!sorting) return;

                await swap(data, j, j + 1);
            }
        }
    }
}

async function quickSort(array, start, end) {
    if(!sorting) return;
    if(start < end) {
        const pivotIndex = await partition(array, start, end);

        await Promise.all[
            quickSort(array, start, pivotIndex - 1),
            quickSort(array, pivotIndex + 1, end)];
    }
}

async function partition(array, start, end) {
    for(let i = start; i <= end; i++) {
        array[i].partition = true;
    }

    const pivotData = array[end].value;

    array[end].pivot = true;

    let i = start - 1;

    for(let j = start; j < end; j++) {
        if(array[j].value <= pivotData) {
            i++;
            await swap(array, i, j);
        }
    }
    await swap(array, i + 1, end);

    for(let i = start; i <= end; i++) {
        array[i].partition = false;
        array[i].pivot = false;
    }

    return i + 1;
}

async function bogoSort() {
    while(!isSorted(data)) {
        if(!sorting) return;
        randomize(data);
        await sleep(speed.value());
    }
}
function isSorted(data) {
    for(let i = 0; i < data.length - 1; i++) {
        if(data[i].value > data[i + 1].value) return false;
    }
    return true;
}

async function swap(array, i, j) {
    array[i].swap = true;
    array[j].swap = true;

    let temp = array[i].value;
    array[i].value = array[j].value;
    array[j].value = temp;

    await sleep(speed.value());

    array[i].swap = false;
    array[j].swap = false;
}

async function sleep() {
    await new Promise(resolve => setTimeout(resolve, speed.value()));
}

function randomize(array) {
    for(let i = 0; i < array.length; i++) {
        let j = floor(random(array.length));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}