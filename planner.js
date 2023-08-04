makeTable(5);

function addToRoot(element)
{
    document.getElementById("root").appendChild(element);
}

function makeCell(rowNum, colNum)
{
    let data = document.createElement("td");
    
    data.innerHTML = "unit" + rowNum + colNum;
    data.setAttribute("id", "unit" + rowNum + colNum);
    data.setAttribute("draggable", "true");
    data.addEventListener("dragstart", dragstart);
    data.addEventListener("dragend", dragend);
    
    return data;
}

function makeRow(rowNum)
{
    let row = document.createElement("tr");
    let head = document.createElement("th");

    head.innerHTML = "S" + (1 + rowNum % 2);
    row.appendChild(head);

    for(let i = 0; i<4; i++)
    {
        row.appendChild(makeCell(rowNum, i));
    }

    row.addEventListener("dragover", dragover);
    row.addEventListener("dragenter", dragenter);
    row.addEventListener("dragleave", dragleave);
    row.addEventListener("drop", drop);

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

function dragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    e.target.classList.add("dragover");
}

function dragenter(e)
{
    e.preventDefault();
    e.target.classList.add("dragover");
}

function dragleave(e)
{
    e.target.classList.remove("dragover");
}

function drop(e)
{
    e.target.classList.remove("dragover");

    //element id that was stored in datatransfer when drag started
    let id = e.dataTransfer.getData('text/plain');
    //use to get the item
    let item = document.getElementById(id);

    //append item to row
    e.target.appendChild(item);

    //show item
    item.classList.remove("hide");
}

//hide when dragging, the timeout ends hide when item released (or else hidden forever).
function dragstart(e)
{
    //store item id for when its dropped.
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add("hide"), 0);
}

function dragend(e)
{
    e.target.classList.remove("hide");
}