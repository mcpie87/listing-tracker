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

<<<<<<< HEAD
function updateHistory(history) {
    const filteredHistory = history.filter(e => e > +new Date() - 72*3600*1000)
    localStorage.setItem('history', JSON.stringify(filteredHistory));
=======
function updateHistory(history = getHistory()) {
    const filteredHistory = history.filter(e => getHoursFromReset(e) > -72)
    localStorage.setItem('history', JSON.stringify(history));
>>>>>>> ee2d4754c21ae4cc2ef336c8fea25f812c6ff53c
}

function pushHistory(comment) {
    const history = getHistory();
    const dateVal = new Date();
    localStorage.setItem(+dateVal, comment)
    history.push(+dateVal);
    updateHistory(history);
}

function getCounter() {
    return getHistory().filter(e => getHoursFromReset(e) >= 0).length;
}

function updateCounter() {
    const counterNode = document.getElementById("counter");
    counterNode.innerHTML = getCounter()
}

function nodeDelete(dateVal) {
    const history = getHistory().filter(e => e != dateVal);
    localStorage.removeItem(+dateVal);
    updateHistory(history);
    update();
}

function updateListings() {
    const historyNode = document.getElementById("history-changes");
    historyNode.innerHTML = "";
    const currentValuesNode = document.getElementById("current-values");
    currentValuesNode.innerHTML = "";
    const history = getHistory();
    history.reverse().forEach((d) => {
        const dateVal = new Date(d);
        const comment = localStorage.getItem(+dateVal);
        const listing = document.createElement("div");
        listing.id = +dateVal;
        listing.className = "listing";
        listing.innerHTML = `
        <div class="listingDate">${dateVal.toString().split('GMT')[0]}</div>
        <div> | </div>
        <div class="listingComment" contenteditable="true" spellcheck="false">${comment}</div>
        <button class="delete" onclick="nodeDelete(${+dateVal})">×</button>
        `;
        if (getHoursFromReset(dateVal) >= 0) {
            currentValuesNode.appendChild(listing);
        } else {
            historyNode.appendChild(listing);
        }
    })
}


function saveListingComments () {
    const listings = document.getElementsByClassName("listing")
    for (const listing of listings) {
        const comment = listing.querySelector(".listingComment").textContent
        if (localStorage.getItem(listing.id) !== null) {
            localStorage.setItem(listing.id, comment);
        }
    }
}

function update() {
    saveListingComments();
    updateHistory();
    updateCounter();
    updateListings();
    const lastUpdate = document.getElementById("lastUpdate");
    lastUpdate.textContent = "Last updated at " + (new Date()).toString().substring(16, 24);
}

function addListing() {
    if (getCounter() >= 20) {
        window.alert("Daily listing limit has been reached.")
    } else {
        pushHistory(document.getElementById("comment").value);
        update();
    }
}

function clearHistory() {
    if (window.confirm("This will erase all listing history.")) {
        const themePref = localStorage.getItem("lightMode")
        localStorage.clear();
        localStorage.setItem("lightMode", themePref)
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

window.addEventListener('load', function() {
    update(); 
    this.setInterval(update, 300000);
    if (typeof localStorage.lightMode === 'undefined' || localStorage.lightMode === 'undefined') {
        localStorage.lightMode = false;
    }
    if (JSON.parse(localStorage.lightMode)) {
        turnOnLight();
    }
});

window.addEventListener('unload', function() {
    update();
});