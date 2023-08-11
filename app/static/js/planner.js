var year = 0; //may improve somehow.

makeTable(3);

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

function makeSensor()
{
    sensor = document.createElement("div");
    text = document.createElement("h2");
    sensor.setAttribute("class", "sensor");

    sensor.addEventListener("dragover", dragover);
    sensor.addEventListener("dragenter", dragenter);
    sensor.addEventListener("dragleave", dragleave);
    sensor.addEventListener("drop", appendRow);

    text.innerHTML = "drag a unit here to add a row!";
    sensor.appendChild(text);
    return sensor;
}

function makeCell(rowNum, colNum)
{
    let data = document.createElement("td");
    
    data.innerHTML = "unit" + rowNum + colNum;
    data.setAttribute("id", "unit" + rowNum + colNum);
    data.setAttribute("draggable", "true");
    addCellEvents(data);
    
    return data;
}

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
        container.appendChild(makeCell(rowNum, i));
    }

    container.addEventListener("dragover", dragover);
    container.addEventListener("dragenter", dragenter);
    container.addEventListener("dragleave", dragleave);
    container.addEventListener("drop", drop);

    return row;
}

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

function makeYearRow()
{
    let row = document.createElement("tr");
    let head = document.createElement("th");
    
    year++;
    head.innerHTML = "Y" + year;
    head.setAttribute("colspan", "5");
    row.appendChild(head);
    
    return row;
}

function makeTable(CourseDuration)
{
    let table = document.createElement("table");
    table.setAttribute("id", "table");

    for(let i = 0; i<CourseDuration * 3; i++)
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
    e.target.classList.remove("dragover");
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

//create units
// function create_units(unit_form) {
//     let form_elements = document.getElementById(unit_form).elements;
//     let unitcode = form_elements["unitcode"].value;

//     const xhttp = new XMLHttpRequest();
//     let server = '/create'
//     xhttp.open("POST", server, true);
//     xhttp.send(unitcode);
// }

//TEST: generating nodes from neo4j graph 
function display_units() {
    const xhttp = new XMLHttpRequest();
    let server = '/display'
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        document.getElementById("nodes").innerHTML = xhttp.responseText;
        alert("I worked!! TvT")
    }
    xhttp.send();
}

