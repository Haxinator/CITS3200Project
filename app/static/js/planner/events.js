import {canEnrollInPeriod, unitConditionsMet} from "./preprequisites.js";
import { updateInfoBar, getPeriodOffered, getById, getByPeriod, enrollInPeroid, hasProblems, clearHighlighting, unitExists } from "./support.js";
import { planner } from "./planner.js";


//to add events to unit cells.
export function addUnitEvents(item)
{
    item.addEventListener("dragstart", dragstart);
    item.addEventListener("dragend", dragend);
    item.addEventListener("click", printInfo);
}

//add events to given container
export function addContainerEvents(container)
{
    container.addEventListener("dragover", dragover);
    container.addEventListener("dragenter", dragenter);
    container.addEventListener("dragleave", dragleave);
    container.addEventListener("drop", drop);
}

//add events to given sensor
export function addSensorEvents(sensor)
{
    sensor.addEventListener("dragover", sensordragover);
    sensor.addEventListener("drop", appendRow);
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


function printInfo(e)
{
    let unitCode = e.currentTarget.id;
    let unit = planner.unitInformation.get(unitCode);

    if(hasProblems(unitCode))
    {
        updateInfoBar(unit.problems);
    } else {
        updateInfoBar(printUnitInfo(unitCode));
    }

    clearHighlighting();

    //highlight unit selected
    e.currentTarget.classList.add("grey");

    //highlight prerequisites
    for(let prerequisite of unit.prerequisites)
    {
        if(unitExists(prerequisite))
        {
            let unitElement = getById(prerequisite);
            
            if(hasProblems(prerequisite))
            {
                unitElement.classList.add("redGreenStripe");
            } else {
                unitElement.classList.add("S2");
            }
            //it would be nice to add an arrow going from prerequiste to unit.
        }
    }

    //highlight COREQUISITES!!! WOOOO
    for(let corequisite of unit.corequisites)
    {
        if(unitExists(corequisite))
        {
            let unitElement = getById(corequisite);
            
            //lol s1.
            if(hasProblems(corequisite))
            {
                unitElement.classList.add("redBlueStripe");
            } else {
                unitElement.classList.add("S1");
            }
            //it would be nice to add an arrow going from prerequiste to unit.
        }
    }

    //highlight all units where this unit is a prerequisite
    for(let otherUnit of planner.unitInformation.values())
    {
        let otherUnitCode = otherUnit.unitCode;

        //highlight if unit clicked on is required for this unit.
        if(otherUnit.prerequisites.includes(unitCode))
        {
            let unitElement = getById(otherUnitCode);

            if(hasProblems(otherUnitCode))
            {
                unitElement.classList.add("redYellowStripe");
            } else {
                unitElement.classList.add("S1S2");
            }
        }
    }
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
    //use to get the item
    let item = document.getElementById(id);

    //if hovering over container
    if(e.currentTarget == e.target)
    {
        //only add to sem if less than 4 units.
        //and semester is valid
        if(e.currentTarget.childElementCount < 4 && 
            canEnrollInPeriod(id, e.currentTarget))
        {
            // e.target.appendChild(item);
            enrollInPeroid(item, e.target);

        } else {
            if(e.currentTarget.childElementCount > 3)
            {
                updateInfoBar(`${e.currentTarget.id} is full`);
            }

            if(!canEnrollInPeriod(id, e.currentTarget))
            {
                updateInfoBar(`${id} only available in ${getPeriodOffered(id)}!`);
            }
        }

        //if container in last year empty delete year and years
        //inbetween that year, until units are found.
        while(getByPeriod(planner.year, "S1").childElementCount == 0 &&
            getByPeriod(planner.year, "S2").childElementCount == 0 &&
            getByPeriod(planner.year, "NS1").childElementCount == 0 &&
            getByPeriod(planner.year, "NS2").childElementCount == 0)
        {
            //delete year and decrement year in planner
            getById("Y" + planner.year).remove();
            planner.year--;
        }

        //before swap see if currently dragged unit can be dropped
        //into that semester AND if the other unit user is swapping with
        //can go into the other semester
    } else if(canEnrollInPeriod(id, e.currentTarget) &&
                canEnrollInPeriod(e.target.id, item.parentElement)){

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
            addUnitEvents(targetClone);
            addUnitEvents(itemClone);

            let targetUnit = planner.unitInformation.get(targetClone.id);
            let itemUnit = planner.unitInformation.get(itemClone.id);
            
            //make sure to update unit period
            targetUnit.enrollmentPeriod = targetClone.parentElement.id
            itemUnit.enrollmentPeriod = itemClone.parentElement.id
            
    } else {
        updateInfoBar(`${id} only available in ${getPeriodOffered(id)} <br>
                        ${e.target.id} only available in ${getPeriodOffered(e.target.id)}`);
    }

    let conditionMet = true;
    //check if prerequisites met for all units.
    for(let unit of planner.unitInformation.values())
    {
        item = getById(unit.unitCode);

        if(!unitConditionsMet(item.id, item.parentElement)){
            conditionMet = false;
        }
    }

    // removes invalid semester from info bar hence why its commented.
    // //clear info bar if prerequisites met.
    // if(conditionMet)
    // {
    //     updateInfoBar("");
    // }

    //show item
    item.classList.remove("hide");
}

//adds a new row underneath the last row in the table when item dropped beneath row.
function appendRow(e)
{
    if(planner.year < 10)
    {
        //remove lines
        // e.target.classList.remove("dragover");
        let table = document.getElementById("table");

        //get currently dragged unit.
        let unitCode = e.dataTransfer.getData('text/plain');
        let unit = getById(unitCode);

        table.appendChild(planner.makeYearContainer());

        let semester1 = document.getElementById("Y" + planner.year +"S1");
        let semester2 = document.getElementById("Y" + planner.year +"S2");
        let NS = document.getElementById("Y" + planner.year +"NS1");

        //see what period to enroll unit into
        if(canEnrollInPeriod(unitCode, semester1)){
            enrollInPeroid(unit, semester1);
        } else if (canEnrollInPeriod(unitCode, semester2)) {
            enrollInPeroid(unit, semester2);
        } else {
            enrollInPeroid(unit, NS);
        }

    } else {
        updateInfoBar("Course duration is a maximum of 10 years!");
    }
}

//formats unit information
function printUnitInfo(unitCode) {
    let unit = planner.unitInformation.get(unitCode);
    let str = "";

    str += `<h5>${unit.name}</h5>`;
    str += formatInfo("Unit Code", unit.unitCode);
    str += formatInfo("Type", unit.type);
    str += formatInfo("Semester", unit.semester);
    str += formatInfo("Credit Points", unit.creditPoints);
    str += formatInfo("Prerequisites", unit.prerequisites);
    str += formatInfo("Corequisites", unit.corequisites);
    str += formatInfo("Point Requirements", unit.pointRequirements);
    // str += formatInfo("Enrollment Requirements", unit.enrollmentRequirements);
    str += formatColorLegend("Legend", "Green - Prerequisite, Blue - Corequisite, Yellow - Dependent Units");

    return str;
}
//@param label is the label (or name of unit information)
//@param info is the unit information
// formatInfo("Unit", unit.name)
// `Unit: "${unit.name}"<br>`
function formatInfo(label, info) {
    return `<span style="font-weight: bold;">${label}</span>: ${info}<br>`;
}

function formatColorLegend(label, info) {
    let coloredInfo = info.replace("Green", '<span style="color: green;">Green</span>')
                           .replace("Blue", '<span style="color: blue;">Blue</span>')
                           .replace("Yellow", '<span style="color: yellow;">Yellow</span>');
    return `<span style="font-weight: bold;">${label}</span>: ${coloredInfo}<br>`;
}



