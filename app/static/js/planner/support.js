import { planner } from "./planner.js";

//removes given value from given array and returns new array.
export function removeFromArray(array, value)
{
    let index = array.indexOf(value);
    array.splice(index, 1);
}

//adds given element to main
export function addToRoot(element)
{
    document.getElementById("root").appendChild(element);
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


// -------------------- MISC SUPPORT FUNCTIONS --------------//

//enrolls unit into period
//unit is unit as represented in the DOM.
export function enrollInPeroid(unit, container)
{
    let unitInfo = planner.unitInformation.get(unit.id);

    //subtract from creditPointsRequired
    planner.creditPointsRequired -= unitInfo.creditPoints;
    unitInfo.enrollmentPeriod = container.id;

    container.append(unit);

}

//get container by period for cleaner code
export function getByPeriod(year, period)
{
    return document.getElementById("Y" + year + period);
}

//get the teaching period a unit is offered for cleaner code.
export function getPeriodOffered(id)
{
    return planner.unitInformation.get(id).semester;
}


export function updateInfoBar(info){
    getById("infoBar").firstElementChild.innerHTML = info;
}

export function unitExists(unitCode)
{
    return (planner.unitInformation.get(unitCode) != undefined);
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
    let unitElement = getById(unit.unitCode);

    if(unit.hasProblems())
    {
        //NS is red.
        unitElement.classList.add("NS");
    } else {
        unitElement.classList.remove("NS");
    }
}


//--------------------SUPPORT FUNCTIONS--------------------------//

//clears all highlighting
export function clearHighlighting()
{
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
}
