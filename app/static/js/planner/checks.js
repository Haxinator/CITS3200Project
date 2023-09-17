import { planner } from "./main.js";
import { updateInfoBar, highlightIfUnitHasProblems, isAlpha, inDOM, getLastCharacter } from "./support.js";

// --------------- Prerequisite Met Functions ----------------//

//checks if all unit prerequisites met.
export function unitConditionsMet(unitCode, container)
{
    //empty here for cleaner code
    //if problems still exist they will be added again
    //if problems are gone, they will be removed from array.
    let unit = planner.unitInformation.get(unitCode);
    unit.problems = [];

    //instead of container ID can be used, which would be cleaner.
    let correctSemester = canEnrollInPeriod(unitCode, container);
    let correctPrequisites = unitPreRequisitiesMet(unitCode, container);
    let correctCorequisites = corequisitesMet(unitCode, container);
    let correctPoints = pointRequirementsMet(unitCode, container);

    // check if unit has been enrolled and it's in the DOM
    if(unit.isEnrolled() && inDOM(unitCode))
    {
        // colour red if problem found
        highlightIfUnitHasProblems(unit);
    }

    return correctSemester && correctPrequisites && correctCorequisites && correctPoints;
}

//determines if unit belongs to the type identifier given
//@param unit code is the unit code.
//@param identifier is the unit type identifier.
export function unitType(unitCode, identifier)
{
    if(identifier === "P" && unitCode.substring(0,4) === "CITS")
    {
        return true;
    }

    return false;
}

//it works I think?
//checks if unit has met its point requirements.
//both the overall points and core unit points.
export function pointRequirementsMet(unitCode, container)
{
    let unit = planner.unitInformation.get(unitCode);
    let pointCount = 0;
    let CoreUnitCount = 0;
    let corePointsRequired = unit.pointRequirements[0];
    let extraPointsRequired = unit.pointRequirements[1];

    //if no point requirements, then requirements met.
    if(unit.pointRequirements.length == 0)
    {
        return true;
    }

    // get the point type. (last character in corePointsRequired)
    let typeIdentifier = getLastCharacter(corePointsRequired);

    //I cri.
    //IT WORKSS
    for(let otherUnit of planner.unitInformation.values())
    {
        let otherUnitCode = otherUnit.unitCode;

        //if in planner and before current enrollment period
        if(otherUnit.isEnrolled() &&
            otherUnit.enrollmentPeriod < container.id)
        {

            //pass last letter in, if it has unit point requirements
            if(unitType(otherUnitCode, typeIdentifier))
            {
                CoreUnitCount += parseInt(otherUnit.creditPoints);
            }

            pointCount += parseInt(otherUnit.creditPoints);

        }
    }

    // check if last char is alpha (different upp and lower)
    // if so then first index is core units.
    if(isAlpha(typeIdentifier))
    {
        // compare core point requirement to coreUnitCount.
        // don't include the last alpha character in the comparison (why substring is used).
        if(parseInt(corePointsRequired.substring(0, corePointsRequired.length-1)) > CoreUnitCount)
        {
            unit.problems.push(`${unitCode} requires ${corePointsRequired} core unit credit points!`);
            updateInfoBar(`${unitCode} requires ${corePointsRequired} core unit credit points!`);

            return false;
        }

        // if there are extra point requirements, see if they're met.
        if(unit.pointRequirements.length > 1 && extraPointsRequired > pointCount)
        {
            unit.problems.push(`${unitCode} requires ${extraPointsRequired} credit points!`);
            updateInfoBar(`${unitCode} requires ${extraPointsRequired} credit points!`);
                
            return false;
        }
    } else {
        //otherwise first index is the point point.
        if(corePointsRequired > pointCount)
        {
            unit.problems.push(`${unitCode} requires ${corePointsRequired} credit points!`);
            updateInfoBar(`${unitCode} requires ${corePointsRequired} credit points!`);
                
            return false;
        }
    }

    return true;
}

//checks if corequisites for a given unit were met.
//almost exactly the same as checking if prerequisites were met.
//Haven't done indepth testing.
//I hope this works. _/\_
export function corequisitesMet(unitCode, container)
{
    let unit = planner.unitInformation.get(unitCode);
    let corequisites = unit.corequisites;
    let corequisitesMet = true;

    for(let corequisite of corequisites)
    {
        let corequisiteUnit = planner.unitInformation.get(corequisite);

        if(corequisiteUnit != undefined)
        {
            if(!corequisiteUnit.isEnrolled())
            {
                //if corequisite in name list then it isn't in planner
                return false;
    
            } else if(corequisiteUnit.enrollmentPeriod > container.id && 
                    corequisiteUnit.enrollmentPeriod.length == container.id.length)
                    {
                        updateInfoBar(`${corequisite} must be done concurrently or prior to commencing ${unitCode}!`);
                        
                        unit.problems.push(`${corequisite} must be done concurrently or prior to commencing ${unitCode}`);
                        
                        corequisitesMet = false;
                    }
        }
    }

    return corequisitesMet;
}

//checks if unit prerequisites met
export function unitPreRequisitiesMet(unitCode, container)
{
    let unit = planner.unitInformation.get(unitCode);
    let prerequisites = unit.prerequisites;
    let prerequisitesMet = true;

    for(let prerequisite of prerequisites)
    {
        let prerequisiteUnit = planner.unitInformation.get(prerequisite)

        if (prerequisiteUnit != undefined){
                
            if(!prerequisiteUnit.isEnrolled())
            {
                //if prerequisite isn't in planner
                return false;

            } else if(prerequisiteUnit.enrollmentPeriod >= container.id && 
                    prerequisiteUnit.enrollmentPeriod.length == container.id.length) {

                    updateInfoBar(`${prerequisite} must be done before ${unitCode}!`);
                    
                    unit.problems.push(`${prerequisite} must be done before ${unitCode}!`);

                    //if prerequisite is in this period or greater.
                    prerequisitesMet = false;
            }
        }
    }

    return prerequisitesMet;
}

//checks if unit can enroll in a given teaching period
//@param container is the teaching period
//@param unitCode is the code of the unit
export function canEnrollInPeriod(unitCode, container)
{
    let unit = planner.unitInformation.get(unitCode);
    let semester = container.id;
    let unitAvaliability = unit.semester;

    //remove the year from semester
    semester = semester.substring(2,4);

    //if semester matched when unit is offered.
    return (unitAvaliability.includes(semester) ||
      (unitAvaliability == "BOTH" && !semester.includes("NS")));
}