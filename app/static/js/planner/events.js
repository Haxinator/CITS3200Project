/* 
 * events.js contains all the event listeners used by elements in the planner.
 * Responsible for the drag and drop functionality.
 * The main functions are:
 *      o addUnitEvents (events for unit cells).
 *      o addContainerEvents (events for semester container).
 *      o addSensorEvents (events for "drag here to add a unit").
 * These functions call the other functions and apply them to the provided element.
 * 
 * Too many functions to describe everything here. If you have any other questions
 * direct them to Josh.
*/

import {canEnrollInPeriod, unitConditionsMet} from "./checks.js";
import { updateInfoBar, getPeriodOffered, getById, getByPeriod, enrollInPeroid, clearHighlighting, unitExists, getUnitInformation, isOption, creditPointsInPeriod } from "./support.js";
import { optionsBar, optionsTable, planner } from "./main.js";
import { infoBar, statusBar } from "./classes.js";


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

// //add option unit events
// export function addOptionUnitEvents(optionUnitElement)
// {
//     //record to compare against combo.
//     optionUnitElement.addEventListener("dragend", recordUnit);
// }

export function optionButtonEvent(button)
{
    button.addEventListener("click", hideOptionBar);
}

function hideOptionBar() {
    let arrow = getById("optionsBar").childNodes[1].firstChild;
    let heading = getById("optionsBar").firstElementChild;

    getById("options").classList.toggle("hide");
    heading.classList.toggle("hide");
    arrow.parentElement.classList.toggle("leftMargin");
    arrow.parentElement.classList.toggle("noMargin");

    arrow.classList.toggle("leftArrow");
    arrow.classList.toggle("rightArrow");

}

//record if unit was enrolled or unenrolled
//to adjust options bar based on combo.
function recordUnit(unitCode)
{
    let unitElement = getById(unitCode);
    //if in placed in option container
    if(unitElement.parentElement.id.includes("op"))
    {
        //remove from combo.
        optionsBar.removeUnit(unitElement.id);
    } else {
        //push to combo.
        optionsBar.pushUnit(unitElement.id);
    }

    optionsBar.adjustOptionsBar();
}

//hide when dragging, the timeout ends hide when item released (or else hidden forever).
function dragstart(e)
{
    e.dataTransfer.setData('text/plain', e.target.id);

    if(isOption(e.target.id))
    {
        

        setTimeout(() => {
            e.target.classList.add("hide");
            e.target.classList.remove("unit");}, 0);
    } else {
        setTimeout(() => e.target.classList.add("hide"), 0);
    }
}

//When drag ends, reveal the item.
function dragend(e)
{
    //put item back if not drop occured at end of drag.

    if(isOption(e.target.id)) {
        e.target.classList.add("unit");
    }
    e.target.classList.remove("hide");
}

// Prints unit information.
// highlights prerequisites and corequisites.
// for clicking on unit event.
function printInfo(e)
{
    let unitCode = e.currentTarget.id;
    let unit = getUnitInformation(unitCode);

    if(unit.hasProblems())
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
        let prerequisiteUnit = getUnitInformation(prerequisite);

        if(unitExists(prerequisite))
        {
            let unitElement = getById(prerequisite);
            
            if(prerequisiteUnit.hasProblems())
            {
                unitElement.classList.add("redPurpleStripe");
            } else {
                unitElement.classList.add("purple");
            }
            //it would be nice to add an arrow going from prerequiste to unit.
        }
    }

    //highlight COREQUISITES!!! WOOOO
    for(let corequisite of unit.corequisites)
    {
        let corequisiteUnit = getUnitInformation(corequisite);

        if(unitExists(corequisite))
        {
            let unitElement = getById(corequisite);
            
            if(corequisiteUnit.hasProblems())
            {
                unitElement.classList.add("redBlueStripe");
            } else {
                unitElement.classList.add("blue");
            }
            //it would be nice to add an arrow going from prerequiste to unit.
        }
    }

    //highlight all units where this unit is a prerequisite
    for(let otherUnit of planner.unitInformation.values())
    {
        //highlight if unit clicked on is required for this unit.
        if(otherUnit.prerequisites.includes(unitCode))
        {
            let unitElement = getById(otherUnit.unitCode);

            if(otherUnit.hasProblems())
            {
                unitElement.classList.add("redYellowStripe");
            } else {
                unitElement.classList.add("yellow");
            }
        }
    }
}

//--------------------- EVENT LISTENER FUNCTIONS -------------------------//

//if your cursor (whilst dragging unit) is over the row add magenta lines.
function sensordragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    // e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) is over the row add magenta lines.
function dragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) enters the row add magenta lines.
function dragenter(e)
{
    e.preventDefault();
    e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) leaves the row, remove magenta lines.
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

            // if option unit record change.
            if(isOption(id))
            {
                console.log(getById("GENG5514"));

                recordUnit(id);
            }

        } else {

            if (e.currentTarget.id.includes("op")) {
                //if option bar
                enrollInPeroid(item, e.target);
            }
            // BUG THAT I NEED TO FIX.
            // should check number of credit points instead
            // else if(e.currentTarget.childElementCount > 3)
            // get all children
            // else if (e.currentTarget.getElementByTagName("*"))

            // there can only be 24 credit points in a semester
            else if (creditPointsInPeriod(e.currentTarget) >= 24)
            {
                //if unit not already enrolled in this period
                if(e.currentTarget.id != item.parentElement.id)
                {
                    // BUG NOT PRINTING FOR SOME REASON
                    infoBar.addInfo(`${e.currentTarget.id} is full`);
                } else {
                    // don't print error if unit is already enrolled in period
                    //else append to end of row.
                    enrollInPeroid(item, e.target);
                }
            }

            if(!canEnrollInPeriod(id, e.currentTarget))
            {
                // trying to put option unit in option bar.
                if(!isOption(id) && e.currentTarget.id.includes("op"))
                {
                    infoBar.addInfo(`${id} isn't an option unit! It can't be added to the side bar.`);
                } else {
                    infoBar.addInfo(`${id} only available in ${getPeriodOffered(id)}!`);
                }
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
            itemClone.classList.add("unit"); //in case option unit.

            //add the event listeners to swapped units.
            addUnitEvents(targetClone);
            addUnitEvents(itemClone);

            let targetUnit = getUnitInformation(targetClone.id);
            let itemUnit = getUnitInformation(itemClone.id);

            // if swapping option units, update comdo.
            if(isOption(targetClone.id) && isOption(itemClone.id))
            {
                recordUnit(targetClone.id);
                recordUnit(itemClone.id);
            }
            
            //make sure to update unit period
            targetUnit.enrollmentPeriod = targetClone.parentElement.id;
            itemUnit.enrollmentPeriod = itemClone.parentElement.id;
    } else {

        if(isOption(id) || isOption(e.target.id))
        {
            infoBar.addInfo(`Only option units can be added to the side bar.`);
        } else {
            infoBar.addInfo(`${id} only available in ${getPeriodOffered(id)} <br>
                            ${e.target.id} only available in ${getPeriodOffered(e.target.id)}`);
        }
    }

    var conditionMet = true;
    //check if prerequisites met for all units.
    for(let unit of planner.unitInformation.values())
    {
        item = getById(unit.unitCode);

        if(!unitConditionsMet(item.id, item.parentElement)){
            conditionMet = false;
        }
    }

    // color option units if problems, if they're in the planner
    for(let unit of optionsTable.unitInformation.values())
    {
        item = getById(unit.unitCode);

        // if unit conditions not met and unit is not in option bar.
        if(!item.parentElement.id.includes("op"))
        {
            // if option unit in planner.
            if(!unitConditionsMet(item.id, item.parentElement)){
                conditionMet = false;
            }
        } else {
            // clear problems if unit placed back into options bar.
            item.classList.remove("magenta");
            unit.problems = [];
        }
        
    }

    // removes invalid semester from info bar hence why its commented.
    //clear info bar if prerequisites met.
    if(conditionMet && !infoBar.messageToDisplay)
    {
        infoBar.clearInfo();
    }

    console.log(optionsBar.optionsDone);


    //for updating status.
    if(optionsBar.optionsDone)
    {
        if(conditionMet)
        {
            statusBar.updateStatus("Done");
            // PUT SHOW EXPORT TO PDF BUTTON HERE.
        } else {
            statusBar.updateStatus("Fix Problems");
        }
    } else {
        statusBar.updateStatus("Add Option Units");
    }

    infoBar.display();

    //adjust options bar
    

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

        if(isOption(unitCode)) {
            recordUnit(unitCode);
        }

        if(optionsBar.optionsDone)
        {
            if(getUnitInformation(unitCode))
            {
                statusBar.updateStatus("Done");
            } else {
                statusBar.updateStatus("Fix Problems");
            }
        } else {
            statusBar.updateStatus("Add Option Units");
        }


        // problem checking.
        var conditionMet = true;
        //check if prerequisites met for all units.
        for(let unit of planner.unitInformation.values())
        {
            item = getById(unit.unitCode);
    
            if(!unitConditionsMet(item.id, item.parentElement)){
                conditionMet = false;
            }
        }
    
        // color option units if problems, if they're in the planner
        for(let unit of optionsTable.unitInformation.values())
        {
            item = getById(unit.unitCode);
    
            // if unit conditions not met and unit is not in option bar.
            if(!item.parentElement.id.includes("op"))
            {
                // if option unit in planner.
                if(!unitConditionsMet(item.id, item.parentElement)){
                    conditionMet = false;
                }
            } else {
                // clear problems if unit placed back into options bar.
                item.classList.remove("magenta");
                unit.problems = [];
            }
            
        }
    
        // removes invalid semester from info bar hence why its commented.
        //clear info bar if prerequisites met.
        if(conditionMet && !infoBar.messageToDisplay)
        {
            infoBar.clearInfo();
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
    str += formatColorLegend("Legend", "<br>Green - Prerequisite <br>Blue - Corequisite<br>Yellow - Dependent Units");

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