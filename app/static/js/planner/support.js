/* 
 * support.js contains support functions which are used by other files to simplify code,
 * aid in modularisation and make code easier to read.
 * 
 * The functions should be self-explainitory and relatively simple.
 * 
 * Any questions ask Josh.
*/

import { optionsTable, optionsBar, planner, statusBar } from "./main.js";
import { unitConditionsMet } from "./checks.js";
import { infoBar } from "./classes.js";
import { makeExportPDFButton } from "./buttons.js";

export function creditPointsInPeriod(semester) {
    let totalCreditPoints = 0;

    for(let unitElement of semester.children)
    {
        //get unit credit points and convert it to int. Add to total.
        totalCreditPoints += parseInt(getUnitInformation(unitElement.id).creditPoints);
    }

    return totalCreditPoints;
}

//adds given element to main
export function addToRoot(element)
{
    document.getElementById("root").appendChild(element);
}

// true if all units haven't been added.
// false otherwise.
export function allUnitsNotAdded()
{
    let allUnitsNotAdded = false;

    for(let unit of planner.unitInformation.values())
    {
        // if there is a unit that hasn't been enrolled
        if(!unit.isEnrolled())
        {
            // all units haven't been added.
            allUnitsNotAdded = true;
        }  
    }

    return allUnitsNotAdded;
}

export function getById(id)
{
    return document.getElementById(id);
}

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

//removes given value from given array and returns new array.
export function removeFromArray(array, value)
{
    let index = array.indexOf(value);
    array.splice(index, 1);
    
    if(array == undefined) { 
        array = [];
    }

}

//enrolls unit into period
//unit is unit as represented in the DOM.
export function enrollInPeroid(unit, container)
{
    let unitInfo = getUnitInformation(unit.id);

    //subtract from creditPointsRequired
    planner.creditPointsRequired -= unitInfo.creditPoints;
    unitInfo.enrollmentPeriod = container.id;
    
    container.append(unit);

}

// gets unitInformation for a given unit.
export function getUnitInformation(unitCode) {

    // have to wait until both planner and optionsBar exist.
    // that's why making sure they're not undefined.
    // as they are done async.
    if(planner != undefined && planner.unitInformation.has(unitCode))
    {
        return planner.unitInformation.get(unitCode);
    } else if(optionsTable != undefined && optionsTable.unitInformation.has(unitCode)) {
        return optionsTable.unitInformation.get(unitCode);
    }
}

//get container by period for cleaner code
export function getByPeriod(year, period)
{
    return document.getElementById("Y" + year + period);
}

//get the teaching period a unit is offered for cleaner code.
export function getPeriodOffered(id)
{
    return getUnitInformation(id).semester;
}

// update the text contents of the info bar to the
// info provided.
export function updateInfoBar(info){
    getById("infoBar").firstElementChild.innerHTML = info;
    
}

// is the unit in unitInformation param.
export function unitExists(unitCode)
{
    return (getUnitInformation(unitCode) != undefined);
}

//true if alphabetical character.
//false otherwise.
export function isAlpha(char)
{
    //if lower case different to uppercase, it is a character.
    return char.toLowerCase() != char.toUpperCase();
}

//given a unit object highlights unit if it has a problem
export function highlightIfUnitHasProblems(unit)
{
    // unit in DOM
    let unitElement = getById(unit.unitCode);

    if(unit.hasProblems())
    {
        unitElement.classList.add("magenta");
    } else{
        unitElement.classList.remove("magenta");
    }
}

// true if element in DOM, false otherwise
export function inDOM(elementId){
    return getById(elementId) != null
}

// gets last character in a string.
// assumed param is a string.
export function getLastCharacter(string)
{
    return string.slice(-1);
}

export function isOption(unitCode)
{
    // if option table was created.
    if(optionsTable != undefined)
    {
        return optionsTable.unitInformation.has(unitCode);
    } else {
        // can't be option if option table doesn't exist
        return false
    }

}

//clears all highlighting
export function clearHighlighting()
{
    //clear planner highlighting
    for(let unit of planner.unitInformation.values())
    {
        //overwrite all classes with unit.
        let unitElement = getById(unit.unitCode);

        if(unit.creditPoints == 0)
        {
            // if zero point unit add back styling.
            unitElement.setAttribute("class", "unit zeroPoint");            
        } else if (unit.creditPoints == 12) {
            unitElement.setAttribute("class", "unit twelvePoint");
        } else {
            unitElement.setAttribute("class", "unit");            
        }


        if(unit.problems.length > 0)
        {
            unitElement.classList.add("magenta");
        }
    }

    //clear option bar highlighting
    if(optionsTable != undefined)
    {
        for(let unit of optionsTable.unitInformation.values())
        {
            //overwrite all classes with unit.
            let unitElement = getById(unit.unitCode);

            // if unit hidden add hidden class back
            if(unitElement.classList.contains("otherHide"))
            {
                unitElement.setAttribute("class", "otherHide option");
            } else {
                unitElement.setAttribute("class", "unit option");
            }

            // problems and not in side bar
            if(unit.problems.length > 0 && !unitElement.parentElement.id.includes("op"))
            {
                unitElement.classList.add("magenta");
            }

            if(unit.creditPoints == 0)
            {
                unitElement.classList.add("zeroPoint");
            } else if (unit.creditPoints == 12) {
                unitElement.setAttribute("class", "unit twelvePoint");
            }
        }
    }
}

//searches planner and looks for any problems
//problems being prerequisites not met, credit points not met, etc.
export function checkPlannerForErrors()
{
    // Check for problems.

    let conditionMet = true;

    //check if prerequisites met for all units.
    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(!unitConditionsMet(item.id, item.parentElement)){
            conditionMet = false;
        }
    }

    // color option units if problems, if they're in the planner
    for(let unit of optionsTable.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        // if unit conditions not met and unit is not in option bar.
        if(!item.parentElement.id.includes("op"))
        {
            // if option unit in planner.
            if(!unitConditionsMet(item.id, item.parentElement)){
                conditionMet = false;
            }
        } else {
            // clear problems if option unit placed back into options bar.
            item.classList.remove("magenta");
            unit.problems = [];
        }
        
    }

    //clear info bar if prerequisites met.
    if(conditionMet && !infoBar.messageToDisplay)
    {
        infoBar.clearInfo();
    }
    
    //for updating status bar.
    if(optionsBar.optionsDone)
    {
        if(conditionMet)
        {
            statusBar.updateStatus("Done");
            makeExportPDFButton();
            // PUT SHOW EXPORT TO PDF BUTTON HERE.
        } else {
            statusBar.updateStatus("Fix Problems");
        }
    } else {
        statusBar.updateStatus("Add Option Units");
    }

    infoBar.display();

}

//returns unit information of all units, option and planner units.
export function getAllUnitInfo()
{
    if(optionsTable == undefined)
    {
        //if optionTable hasn't been rendered
        return planner.unitInformation;
    } else {
        //merges planner and option table unit information maps.
        var map = new Map([...planner.unitInformation, ...optionsTable.unitInformation]);
        return map;
    }
}

//determines which period comes first.
//-1 if 1 comes first, 1 if 2 comes first or 0 if they're in the same period.
export function comparePeriods(period1, period2)
{
    if(period1.length == period2.length)
    {
        //if both NS or both standard sem.
        if(period1 < period2)
        {
            //if period 1 less then 2 return -1.
            return -1;
        } if(period1 > period2)
        {
            // if period1 greater then 2 return 1
            return 1;
        } else {
            //if the same return 0
            return 0;
        }
    } else{

        //else one period is NS and the other isn't

        //unit we're checking is in NS period.
        //extract year and semester, and compare.
        let period1Year = period1.substring(1,2);
        let period1Period = getLastCharacter(period1);
        let period2Year = period2.substring(1,2);
        let period2Period = getLastCharacter(period2);

        //if prerequisite comes before unit in year.
        if(period1Year < period2Year)
        {
            //period 1 comes before period 2.
            return -1;
        } else if(period1Year > period2Year) {
            //period1 comes after 2.
            return 1;
        }else if (period1Period < period2Period)
        {
            //period 1 comes before 2.
            return -1;
        } else if((period1Period > period2Period)){
            //period 2 comes before 1.
            return 1;
        } else {
            //depending on which one is NS, depends on which comes first.
            if(period1.length > period2.length)
            {
                //1 is NS. So it comes after period 2.
                return 1;
            } else {
                //else 2 is NS, so 1 comes first.
                return -1;
            }
        }
    }
}
