function turnOnLight() {
    const element = document.body;
    element.classList.toggle("light-mode");
}
function toggleLight() {
    turnOnLight();
    localStorage.lightMode = !JSON.parse(localStorage.lightMode);
}
function getHistory() {
    return JSON.parse(localStorage.history);
}
function updateHistory(item) {
    const filteredHistory = item.filter(e => e[0] > 72*3600*1000)
    localStorage.setItem('history', JSON.stringify(item));
}
function pushHistory(item) {
    const history = getHistory();
    history.push([(new Date()), item]);
    updateHistory(history);
}

function getCounter() {
    return getHistory().filter(e => getHoursFromReset(e[0]) >= 0).length;
}

function updateCounter() {
    const counterNode = document.getElementById("counter");
    counterNode.innerHTML = getCounter()
}

function nodeDelete(dateVal) {
    const history = getHistory().filter(e => +(new Date(e[0])) != dateVal);
    localStorage.removeItem(+dateVal);
    updateHistory(history);
    update();
}

function updateHistoryNodes() {
    const historyNode = document.getElementById("history-changes")
    historyNode.innerHTML = "";
    const currentValuesNode = document.getElementById("current-values")
    currentValuesNode.innerHTML = "";
    const history = getHistory();
    history.reverse().forEach((e) => {
        const entry = document.createElement("div");
        const date = e[0];
        const comment = e[1];
        const dateVal = new Date(date);
        const hoursFromReset = getHoursFromReset(dateVal);
        entry.id = +dateVal;
        const storedListingHTML = localStorage.getItem(+dateVal);

        entry.innerHTML = storedListingHTML || `
        <div>${dateVal.toString().split('GMT')[0]}</div>
        <div> | </div>
        <div contenteditable="true" spellcheck="false">${comment}</div>
        <button onclick="nodeDelete(${+dateVal})">x</button>
        `;

        if (hoursFromReset >= 0) {
            currentValuesNode.appendChild(entry);
        } else if (hoursFromReset > -72) {
            historyNode.appendChild(entry);
        }
    })
}

function saveListingComments () {
    saveChildrenInnerHTML("history-changes");
    saveChildrenInnerHTML("current-values");
}

function saveChildrenInnerHTML (id) {
    const currentNode = document.getElementById(id)
    if (currentNode.hasChildNodes()) {
        let children = currentNode.childNodes
        for (const node of children) {
            localStorage.setItem(node.id, node.innerHTML)
        }
    }
}

function update() {
    saveListingComments();
    updateCounter();
    updateHistoryNodes();
}
function addValue() {
    if (getCounter() >= 20) {
        window.alert("Daily listing limit has been reached.")
    } else {
        pushHistory(document.getElementById("comment").value);
        +localStorage.counter++
        update();
    }
}

function clearHistory() {
    if (window.confirm("This will erase all listing history.")) {
        const history = getHistory();
        history.reverse().forEach((e) => {
            const date = e[0];
            const dateVal = new Date(date);
            localStorage.removeItem(+dateVal);  
        })
        updateHistory([]);
        update();
    }
}

function getHoursFromReset(d) {
    const date = new Date(d);
    let lastReset = new Date();
    const now = new Date();
    lastReset.setUTCHours(10);
    lastReset.setUTCMinutes(0);
    lastReset.setUTCSeconds(0);
    if (now < lastReset) {
        // date is set for "tomorrow", need to readjust
        lastReset = new Date(lastReset.getTime() - 24*60*60*1000)
    }
    return (date - lastReset)/(60*60*1000);
}

if (!localStorage.history) {
    updateHistory([]);
    localStorage.counter = 0;
    console.log('history updated to []');
}

if (JSON.parse(localStorage.darkMode)) {
    turnOnDark();
}

setInterval(update, 1000);