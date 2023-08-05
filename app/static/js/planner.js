makeTable(5);

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
    let yearNum = Math.trunc((rowNum/3) + 1);
    let semesterID = "S" + semesterNum;
    let yearID = "Y" + yearNum;


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

function makeYearRow(yearNum)
{
    let row = document.createElement("tr");
    let head = document.createElement("th");

    head.innerHTML = "Y" + (yearNum+1);
    head.setAttribute("colspan", "5");
    row.appendChild(head);
    
    return row;
}

function makeTable(CourseDuration)
{
    let table = document.createElement("table");

    for(let i = 0; i<CourseDuration * 3; i++)
    {
        if(i % 3 == 0)
        {
            table.appendChild(makeYearRow(i/3));
        } else {
            table.appendChild(makeRow(i));
        }
    }

    addToRoot(table);
}

//--------------------- EVENT LISTENER FUNCTIONS -------------------------//

function dragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
}

function dragenter(e)
{
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
}

function dragleave(e)
{
    e.currentTarget.classList.remove("dragover");
}

function drop(e)
{
    //currentTarget used instead of target to prevent cells being dropped into cells.
    e.currentTarget.classList.remove("dragover");

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
        //condition if hovering over cell
        if(e.currentTarget.childElementCount < 4)
        {
            //insert item in the container before current cell user is targeting
            e.currentTarget.insertBefore(item, e.target);
        } else {
            // swap units if container full
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

function dragend(e)
{
    //put item back if not drop occured at end of drag.
    e.target.classList.remove("hide");
}