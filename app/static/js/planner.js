var year = 0; //may improve somehow.
var numberOfUnits = 0; //Number of units in the planner
var unitInformationArray = [];
var unitNames = [];

//names of units to display
// var unitNames = makeUnitArray(21); //dummy units
// var unitNames;

// Instance function calls start

display_all(); //gimmie units.


// function calls end

//Dummy functions for testing
//creates fake units for testing.
// function makeUnitArray(size)
// {
//     const units = [];

//     for(let i = 0; i< size; i++)
//     {
//         units[i] = "unit00" + i;
//     }

//     return units;
// }

function extractNames(unitInformationArray)
{
    const units = [];

    for(let i in unitInformationArray)
    {
        units[i] = unitInformationArray[i].unitcode;
    }

    console.log(units);

    return units;
}

//Dummy Functions END

//adds given element to main
function addToRoot(element)
{
    document.getElementById("root").appendChild(element);
}

//to add events to unit cells.
function addCellEvents(item)
{
    item.addEventListener("dragstart", dragstart);
    item.addEventListener("dragend", dragend);
}

//creates sensor that senses when a unit is dragged under table.
function makeSensor()
{
    sensor = document.createElement("div");
    text = document.createElement("h2");
    sensor.setAttribute("class", "sensor");

    sensor.addEventListener("dragover", sensordragover);
    // sensor.addEventListener("dragenter", dragenter);
    // sensor.addEventListener("dragleave", dragleave);
    sensor.addEventListener("drop", appendRow);

    text.innerHTML = "drag a unit here to add a row!";
    sensor.appendChild(text);
    return sensor;
}

//creates a single table cell
function makeCell(rowNum, colNum)
{
    let data = document.createElement("td");
    
    // data.innerHTML = "unit" + rowNum + colNum;
    data.innerHTML = unitNames[numberOfUnits];
    data.setAttribute("id", "unit" + rowNum + colNum);
    data.setAttribute("draggable", "true");
    addCellEvents(data);
    
    return data;
}

//makes a semester row of the table
function makeRow(rowNum)
{
    //instead of passing rowNum, pass number of semesters

    let row = document.createElement("tr");
    let container = document.createElement("div");
    let head = document.createElement("th");
    let semesterNum = (rowNum % 3);
   // let yearNum = Math.trunc((rowNum/3) + 1);
    let semesterID = "S" + semesterNum;
    let yearID = "Y" + year;


    head.innerHTML = semesterID;
    container.setAttribute("id", yearID + semesterID);
    row.appendChild(head);
    row.appendChild(container);


    for(let i = 0; i<4; i++)
    {
        //if all units have been listed, don't list anymore
        if(numberOfUnits < unitNames.length)
        {
            container.appendChild(makeCell(rowNum, i));
            numberOfUnits++;
        }
    }

    container.addEventListener("dragover", dragover);
    container.addEventListener("dragenter", dragenter);
    container.addEventListener("dragleave", dragleave);
    container.addEventListener("drop", drop);

    return row;
}

//makes an empty semester row in the table
//used by sensor to add new rows.
function makeEmptyRow(rowNum)
{
    //instead of passing rowNum, pass number of semesters

    let row = document.createElement("tr");
    let container = document.createElement("div");
    let head = document.createElement("th");
    let semesterNum = (rowNum % 3);
    //let yearNum = Math.trunc((rowNum/3) + 1);
    let semesterID = "S" + semesterNum;
    let yearID = "Y" + year;


    head.innerHTML = semesterID;
    container.setAttribute("id", yearID + semesterID);
    row.appendChild(head);
    row.appendChild(container);

    container.addEventListener("dragover", dragover);
    container.addEventListener("dragenter", dragenter);
    container.addEventListener("dragleave", dragleave);
    container.addEventListener("drop", drop);

    return row;
}

//adds the row that marks the year
function makeYearRow()
{
    let row = document.createElement("tr");
    let head = document.createElement("th");
    
    year++;
    head.innerHTML = "Y" + year;
    head.setAttribute("colspan", "5");
    row.appendChild(head);
    row.setAttribute("class","year");
    
    return row;
}

//creates the entire planner table
function makeTable(unitNames)
{
    let table = document.createElement("table");
    table.setAttribute("id", "table");

    for(let i = 0; unitNames.length>numberOfUnits; i++)
    {
        if(i % 3 == 0)
        {
            table.appendChild(makeYearRow());
        } else {
            table.appendChild(makeRow(i));
        }
    }


    //make table then sensor underneath
    addToRoot(table);
    addToRoot(makeSensor());
}

//--------------------- EVENT LISTENER FUNCTIONS -------------------------//

//if your cursor (whilst dragging unit) is over the row add red lines.
function sensordragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    // e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) is over the row add red lines.
function dragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) enters the row add red lines.
function dragenter(e)
{
    e.preventDefault();
    e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) leaves the row, remove red lines.
function dragleave(e)
{
    e.target.classList.remove("dragover");
}

//When the item is dropped either place the unit in the row or swap it
//if the row is full with the unit user is hovering over.
function drop(e)
{
    //currentTarget used instead of target to prevent cells being dropped into cells.
    e.target.classList.remove("dragover");

    //element id that was stored in datatransfer when drag started
    let id = e.dataTransfer.getData('text/plain');
    console.log(id);
    //use to get the item
    let item = document.getElementById(id);

    //if hovering over container
    if(e.currentTarget == e.target)
    {
        //only add to sem if less than 4 units.
        if(e.currentTarget.childElementCount < 4)
        {
            e.target.appendChild(item);
        }

        //if container empty, check if all container for year empty
        //check if year below, if not, delete this year.
        // if(e.currentTarget.childElementCount == 0)
        // {
        //     // if()
        // }
    } else {
            // swap units
            //create clone elements.
            let targetClone = e.target.cloneNode(true);
            let itemClone = item.cloneNode(true); 

            //swap
            item.replaceWith(targetClone);
            e.target.replaceWith(itemClone);

            //show item
            itemClone.classList.remove("hide");

            //add the event listeners to swapped units.
            addCellEvents(targetClone);
            addCellEvents(itemClone);
    }

    //show item
    item.classList.remove("hide");
}

//hide when dragging, the timeout ends hide when item released (or else hidden forever).
function dragstart(e)
{
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add("hide"), 0);
}

//When drag ends, reveal the item.
function dragend(e)
{
    //put item back if not drop occured at end of drag.
    e.target.classList.remove("hide");
}

//adds a new row underneath the last row in the table when item dropped beneath row.
function appendRow(e)
{
    //remove lines
    // e.target.classList.remove("dragover");
    let table = document.getElementById("table");

    //get currently dragged unit.
    let id = e.dataTransfer.getData('text/plain');
    let item = document.getElementById(id);

    //make year and semester 1 and 2 rows.
    table.appendChild(makeYearRow());
    table.appendChild(makeEmptyRow(1));
    table.appendChild(makeEmptyRow(2));

    //add dragged unit in S1 of the new row
    let semester1 = document.getElementById("Y" + year +"S1");
    semester1.appendChild(item);
}

//TEST: generating nodes from neo4j graph 
function display_all() {
    const xhttp = new XMLHttpRequest();
    let server = '/display';
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {

        unitInformationArray = JSON.parse(xhttp.responseText);
        console.log(unitInformationArray);

        document.getElementById("nodes").innerHTML = JSON.parse(xhttp.responseText);

        unitNames = extractNames(unitInformationArray);
        makeTable(unitNames);

        // alert("I worked!! TvT");
    }
    xhttp.send();
}


function display_unit() {
    chosen_unit = document.getElementById("chosen_unit").value;
    document.getElementById("unitchosen").innerHTML = chosen_unit;
}

//retrieve the requirements of chosen unit 
function get_prereqs() {
    chosen_unit = document.getElementById("chosen_unit").value;
    
    const xhttp = new XMLHttpRequest();
    let server = '/prereqs/'.concat(chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        document.getElementById('prereqs_head').innerHTML = "This unit requires the following:"
        document.getElementById('prereqs').innerHTML = xhttp.responseText;
    }
    xhttp.send();
}

//retrieve units that require chosen unit
function get_children() {
    chosen_unit = document.getElementById("chosen_unit").value;

    const xhttp = new XMLHttpRequest();
    let server = '/child_units/'.concat(chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        document.getElementById('child_head').innerHTML = "This unit is a requirement for the following:"
        document.getElementById('child_units').innerHTML = xhttp.responseText;
    }
    xhttp.send();
}

//disable buttons if chosen unit field is empty
const inputField = document.getElementById('chosen_unit');
const prereqsBtn = document.getElementById('prereqs_btn');
const childBtn = document.getElementById('child_btn');

inputField.addEventListener('input', function() {
    if (inputField.value.trim() === '') {
        prereqsBtn.disabled = true;
        childBtn.disabled = true;
    } 
    else {
        prereqsBtn.disabled = false;
        childBtn.disabled = false;
    }
});
