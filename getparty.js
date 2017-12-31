'use strict';

//User parameters
const CITY="Boston";
const DIST="50km";
const DATE=getTomorrowDate();
let meetToken = null

function getTomorrowDate() {
    let curDate = new Date();
    curDate.setDate(curDate.getDate() + 1);
    return curDate;
}

function getToken() {
    if (meetToken === null) {
        let newToken = prompt("Please enter your oAuth access token");
        if (newToken === null) {
            return 0;
        }
        else {
            meetToken = newToken;
        }
    }
    else {
        return meetToken;
    }
}

function formUrl(city, distance, date, page = 1) {
    let dateBefore = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    dateBefore.setUTCHours(0);
    let dateAfter = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    dateAfter.setUTCHours(0);
    let dateStart = dateBefore.toISOString().split('.')[0]+"Z";
    let dateEnd = dateAfter.toISOString().split('.')[0]+"Z";
    let url = "https://www.eventbriteapi.com/v3/events/search/?token=" + getToken() + "&location.address=" + city + "&location.within=" + distance
        + "&start_date.range_start=" + dateStart + "&start_date.range_end=" + dateEnd + "&page=" + page + "&sort_by=date";
    return url;
}

function httpConnect(url, callback, timeout) {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("GET",url,true);
    httpRequest.timeout = timeout;
    httpRequest.onload = function() {
        callback(this.responseText);
    }
    httpRequest.onerror = function() {
        console.log("Ошибка " + this.status);
    }
    httpRequest.send(null);
}

function showProgress(page, maxpage) {
    let infotext = document.getElementsByClassName("info")[0];
    if (page == 0)
    {
        infotext.innerText = "Fetching event list";
    }
    else
    {
        infotext.innerText = "Fetching page " + page + " of " + maxpage;
    }
}

//function getVenue(id, callback) {
//    let url = "https://www.eventbriteapi.com/v3/venues/" + id + "/?token=" + getToken();
//    httpConnect(url, callback, 30000);
//}
//
//function setVenue(elem, address) {
//    if (address.status === 403)
//    {
//        elem.innerText="Private";
//    }
//    else {
//        elem.innerText = address.responseText["address"];
//    }
//}

function drawHtml(events, city) {
    let infotext = document.getElementsByClassName("info")[0];
    infotext.innerText = "Events in " + city;

    let eventtable = document.getElementsByClassName("eventtable")[0];

    let header = document.createElement("thead");
    eventtable.appendChild(header);
    let hrow = document.createElement("tr");
    header.appendChild(hrow);
    //let hnames = ["Date", "Name", "Address", "Description"];
    let hnames = ["Date", "Name", "Description"];
    for (const i in hnames)
    {
        let newcell = document.createElement("td");
        newcell.innerText = hnames[i];
        hrow.appendChild(newcell);
    }

    for (const i in events) {
        let newrow = document.createElement("tr");
        eventtable.appendChild(newrow);
        for (const j in hnames) {
            let newcell = document.createElement("td");
            switch (hnames[j]) {
                case "Date":
                    newcell.innerText = events[i]["start"]["utc"];
                    break;
                case "Name":
                    newcell.innerHTML = events[i]["name"]["text"];
                    break;
                //case "Address":
                //    let c = setVenue.bind(null, newcell);
                //    getVenue(events[i]["venue_id"],c);
                //    break;
                case "Description":
                    newcell.innerHTML = events[i]["description"]["text"];
                    break;
            }
            newrow.appendChild(newcell);
        }
    }
}

function getMeetups(city, distance, date) {
    let event_list = [];
    let url = formUrl.bind(null, city, distance, date);

    let callback = function dumpPage(json) {
        let response = JSON.parse(json);
        event_list = event_list.concat(response.events);
        if (response.pagination.has_more_items)
        {
            let newpage = response.pagination.page_number + 1;
            let maxpage = response.pagination.page_count;
            showProgress(newpage,maxpage);
            httpConnect(url(newpage), callback, 30000);
        }
        else {
            drawHtml(event_list, city);
        }
    }
    showProgress(0);
    httpConnect(url(), callback, 30000);
}

function main() {
    getMeetups(CITY, DIST, DATE, getToken());
}

window.addEventListener("DOMContentLoaded", main);
