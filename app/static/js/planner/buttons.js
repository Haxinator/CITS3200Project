/*
 * This file contains all the button event listeners and their creation.
*/

import {getById, updateInfoBar, clearHighlighting, getUnitInformation, getAllUnitInfo} from "./support.js";
import { statusBar } from "./main.js";

/**
 * Creates the export to PDF button.
 */
export function makeExportPDFButton()
{
    let button = document.createElement("button");
    button.setAttribute("id", "exportPdf");
    button.setAttribute("class", "button");
    button.innerHTML = "Export to PDF";
    button.addEventListener("click", exportToPDF);

    getById("statusBar").appendChild(button);
}

// -------------------- FILTERS ----------------------------- //

/**
 * If page clicked remove all highlight and clear the info bar.
 * It allows the user to "deselect".
 */
getById("root").parentElement.parentElement.addEventListener("click", (e) =>{

    //if a unit wasn't clicked
    if(!e.target.classList.contains("unit") && !e.target.classList.contains("button"))
    {
        //removing highlighting and info bar text.
        updateInfoBar("");

        //display current status.
        statusBar.displayStatus();

        //clear all highlighting.
        clearHighlighting();
    }
    
});

//Highlights all units with notes.
getById("noteFilter").addEventListener("click", () => {

    //clear last previous filters()
    clearHighlighting();

    for(let unit of getAllUnitInfo().values())
    {
        let item = getById(unit.unitCode);

        if(unit.notes.length > 0)
        {
            item.classList.toggle("blue");
        }
    }

        //KEY   COLOUR
        let legend = new Map([
        ["Has Notes", "blue"]]);

        statusBar.displayLegend(legend);
});


/**
 * This function creates a new table, copies the information from the 
 * planner into the table, applies CSS and then calls print() 
 * to print the page. If the user clicks print or cancel,
 * it will close the new page and return you back to the planner.
 */
function exportToPDF() {
    // Get the table element
    let plannerTable = getById("table");
    let hasNS = getById("Y1NS1") != undefined; //see if there are NS.
    let year = 1;
    let duration = plannerTable.lastElementChild.id[1]; //look at last year
    let printTable = document.createElement("table");
    
    // Open a new window
    var printWindow = window.open('', '_blank');
    
    //table heading
    let tableHeading = document.createElement("h3");
    tableHeading.innerHTML =  `BH011 Bachelor of Engineering (Honours) - ${specialization_name} (${specialization})`;
    let subtitle = document.createElement("sub");
    subtitle.innerHTML = `${duration} Year Course Study Plan - Commencing Semester 1 ${yearLevel}`;
    subtitle.classList.add("sub");

    printWindow.document.body.appendChild(tableHeading);
    printWindow.document.body.appendChild(subtitle);

    // let head = document.createElement("head");
    let css = document.createElement("link");
    let title = document.createElement("title");
    title.innerHTML = "Print";

    //not sure if this is even used.
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("href", "{{ url_for('static', filename='css/planner.css') }}");

    printWindow.document.head.appendChild(title);
    printWindow.document.head.appendChild(css);

    //for the study plan duration.
    for(let i = 0 ; i < duration; i ++)
    {
        //make header row
        let yearHeader = document.createElement("th");
        yearHeader.setAttribute("colspan", 5);
        yearHeader.innerHTML = `Year ${year}`;
        yearHeader.classList.add("year");

        printTable.appendChild(yearHeader);

        for(let period = 1; period < 3; period++)
        {
            //add all units
            let periodHeader = document.createElement("th");
            let periodContainer = document.createElement("tr");
            let units = getById(`Y${year}S${period}`);
            let unitsList = units.children;
            periodHeader.innerHTML = `Semester ${period}, ${parseInt(yearLevel) + (year-1)}`; //resemble starting year


            periodContainer.appendChild(periodHeader);

            //create each unit.
            for(let unit of unitsList)
            {
                let data = document.createElement("td");
                data.innerHTML = unit.textContent;

                if(data.innerHTML.includes("Broadening"))
                {
                    data.classList.add("broadening");
                } else {
                    let unitInfo = getUnitInformation(unit.id);
                    let unitName = unitInfo.name;
                    let unitSemester = unitInfo.semester;

                    if(unitSemester.includes("BOTH"))
                    {
                        data.innerHTML += "**";
                    }

                    if(unitInfo.creditPoints == 12)
                    {
                        data.setAttribute("colspan", 2);
                    }

                    let span = document.createElement("span");
                    span.innerHTML = unitName;
                    data.append(document.createElement("br"));
                    data.append(span);
                }

                periodContainer.appendChild(data);
            }

            printTable.appendChild(periodContainer);

            //add all NS units if any.
            if(hasNS)
            {
                // also get NS
                let periodNS = document.createElement("tr");
                let unitsNS = getById(`Y${year}NS${period}`).children;

                // periodNS.appendChild(periodHeader);
                if(unitsNS.length > 0)
                {
                    let data = document.createElement("td");
                    data.setAttribute("colspan", 5);
                    data.classList.add("NS");

                    for(let NSunit of unitsNS)
                    {
                        data.innerHTML += NSunit.textContent;
                        data.innerHTML += " " + getUnitInformation(NSunit.id).name + " ";
                    }

                    periodNS.appendChild(data);

                    printTable.appendChild(periodNS);
                }
            }

        }

        year++;
    }

    let note = document.createElement("sub");
    let otherNote = document.createElement("sub");

    note.innerHTML = "** Offered in both semesters"
    otherNote.innerHTML = "Information in this study plan is correct as at Feb-2023 but is subject to change from time to time. In particular, the University reserves the right to change the unit availability and unit rule"
    otherNote.classList.add("redSub");
    note.classList.add("key");



    printWindow.document.body.appendChild(printTable);
    printWindow.document.body.appendChild(note);
    printWindow.document.body.appendChild(document.createElement("br"));
    printWindow.document.body.appendChild(otherNote);

    //the CSS for the print planner.
    let style = document.createElement("style");
    style.innerHTML = `

    body {
        text-align: center;
        font-family: "Source Sans Pro", Arial, sans-serif;
    }

    table {
        margin-left: auto;
        margin-right: auto;
    }

    th,td {
        border: solid black 1px;
    }

    tr th {
        max-width: 100px;
        font-weight: normal;
    }

    .broadening{
        font-weight: normal;
    }

    .redSub {
        font-style: italic;
        color: red;
        text-align: left;
        display: inline-block;
        width:100%;
    }

    .key {
        text-align: left;
        display: inline-block;
        width: 100%;
    }

    td {
        min-width: 300px;
        padding-top: 10px;
        padding-bottom: 10px;
        font-weight: bold;
        text-align: center;
    }

    td span {
        font-weight: normal;
        font-size: small;
    }

    h3{
        margin-top: 0px;
        margin-bottom: 0px;
        text-align: center;
    }

    .sub{
        text-align: center;
        margin:none;
    }

    table {
        border: solid black 1px;
        border-collapse: collapse;
    }

   .year {
        background-color: #27348b;
        color: white;
    }

    .NS {
        max-width:fit-content;
        max-height:fit-content;
        padding: 0px;
        text-align: center;
        background-color: #E2B600;
    }

    @media print {
        body {-webkit-print-color-adjust: exact;}
        }

    `
    printWindow.document.body.appendChild(style);

    // Call the print method
    printWindow.document.close();
    printWindow.print();

    // Attempt to close the window after printing
    printWindow.onafterprint = function() {
        printWindow.close();
    };
}

/**
 * Highlights the units based on their semester offered,
 */
getById("SemesterFilter").addEventListener("click", () => {

    //clear last previous filters()
    clearHighlighting();

    for(let unit of getAllUnitInfo().values())
    {
        let item = getById(unit.unitCode);

        if(unit.semester == "S1")
        {
            item.classList.toggle("blue");
        } else if(unit.semester == "S2"){
            item.classList.toggle("purple");
        } else if(unit.semester == "NS"){
            item.classList.toggle("magenta")
        }else {
            item.classList.toggle("yellow");
        }
    }

        //KEY   COLOUR
        let legend = new Map([
        ["S1", "blue"],
        ["S2", "purple"],
        ["S1/S2", "yellow"], 
        ["NS", "magenta"]]);

        statusBar.displayLegend(legend);
});

/**
 * Highlights units that have corequisites.
 */
getById("corequisiteFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of getAllUnitInfo().values())
    {
        let item = getById(unit.unitCode);

        if(unit.corequisites.length > 0)
        {
            item.classList.toggle("blue");
        } else {
            item.classList.remove("blue");
        }
    }

    let legend = new Map([
        ["Unit has Corequisites", "blue"]
    ]);

    statusBar.displayLegend(legend);
});

/**
 * Highlights units if they have prerequisites.
 */
getById("prequisiteFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of getAllUnitInfo().values())
    {
        let item = getById(unit.unitCode);

        //if unit has 'and' or 'or' prerequsities.
        if(unit.prerequisites[0].length > 0 || unit.prerequisites[1].length > 0)
        {
            item.classList.toggle("yellow");
        } else {
            item.classList.remove("yellow");
        }
    }

    let legend = new Map([
        ["Unit has Prerequisites", "yellow"]
    ]);

    statusBar.displayLegend(legend);
});

/**
 * Highlight units if they have point requirements.
 */
getById("pointRequirementsFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of getAllUnitInfo().values())
    {
        let item = getById(unit.unitCode);

        if(unit.pointRequirements.length > 0)
        {
            item.classList.toggle("yellow");
        } else {
            item.classList.remove("yellow");
        }
    }

    let legend = new Map([
        ["Unit has Point Requirements", "yellow"]
    ]);

    statusBar.displayLegend(legend);
});