/* 
 * support.js contains support functions which are used by other files to simplify code,
 * aid in modularisation and make code easier to read.
 * 
 * The functions should be self-explainitory and relatively simple.
 * 
 * Any questions ask Josh.
*/

import { optionsBar, planner } from "./main.js";

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
    } else if(optionsBar != undefined && optionsBar.unitInformation.has(unitCode)) {
        return optionsBar.unitInformation.get(unitCode);
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
        //NS is red.
        unitElement.classList.add("NS");
    } else{
        unitElement.classList.remove("NS");
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

//clears all highlighting
export function clearHighlighting()
{
    //clear planner highlighting
    for(let unit of planner.unitInformation.values())
    {
        //overwrite all classes with unit.
        let unitElement = getById(unit.unitCode);
        unitElement.setAttribute("class", "unit");

        if(unit.problems.length > 0)
        {
            unitElement.classList.add("NS");
        }
    }

    //clear option bar highlighting
    for(let unit of optionsBar.unitInformation.values())
    {
        //overwrite all classes with unit.
        let unitElement = getById(unit.unitCode);
        unitElement.setAttribute("class", "unit");

        if(unit.problems.length > 0)
        {
            unitElement.classList.add("NS");
        }
    }
}
