import { planner } from "./planner.js";
import { updateInfoBar, highlightIfUnitHasProblems } from "./support.js";

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

    //colour red if problem found.
    if(planner.unitNames.indexOf(unitCode) == -1 )
    {
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

    // console.log(container.id);
    // console.log("points needed " + unit.pointRequirements);

    //if no point requirements, then requirements met.
    if(unit.pointRequirements.length == 0)
    {
        return true;
    }

    //I cri.
    //IT WORKSS
    for(let otherUnit of planner.unitInformation.values())
    {
        let otherUnitCode = otherUnit.unitCode;

        //if in planner and before current enrollment period
        if(planner.unitNames.indexOf(otherUnitCode) == -1 &&
            otherUnit.enrollmentPeriod < container.id)
        {

            //pass last letter in, if it has unit point requirements
            if(unitType(otherUnitCode, unit.pointRequirements[0].slice(-1)))
            {
                CoreUnitCount += parseInt(otherUnit.creditPoints);
            }

            pointCount += parseInt(otherUnit.creditPoints);

        }
    }

    // check if char is alpha (different upp and lower)
    // then first index is core units.
    // I have become death. Destroyer of JScode clarity.
    if(unit.pointRequirements[0].slice(-1).toLowerCase() != unit.pointRequirements[0].slice(-1).toUpperCase())
    {
        if(parseInt(unit.pointRequirements[0].substring(0,unit.pointRequirements[0].length-1)) > CoreUnitCount)
        {
            unit.problems.push(`${unitCode} requires ${unit.pointRequirements[0]} core unit credit points!`);
            updateInfoBar(`${unitCode} requires ${unit.pointRequirements[0]} core unit credit points!`);

            return false;
        }

        if(unit.pointRequirements.length > 1 && unit.pointRequirements[1] > pointCount)
        {
            unit.problems.push(`${unitCode} requires ${unit.pointRequirements[1]} credit points!`);
            updateInfoBar(`${unitCode} requires ${unit.pointRequirements[1]} credit points!`);
                
            return false;
        }
    } else {
        //otherwise first index is the point point.
        if(unit.pointRequirements[0] > pointCount)
        {
            unit.problems.push(`${unitCode} requires ${unit.pointRequirements[0]} credit points!`);
            updateInfoBar(`${unitCode} requires ${unit.pointRequirements[0]} credit points!`);
                
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

        if(planner.unitNames.indexOf(corequisite) != -1)
        {
            //if corequisite in name list then it isn't in planner
            return false;

        } else if(corequisiteUnit != null)
        {
            if(corequisiteUnit.enrollmentPeriod > container.id && 
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

        if(planner.unitNames.indexOf(prerequisite) != -1)
        {
            //if prerequisite in name list then it isn't in planner
            return false;

        } else if (prerequisiteUnit != null){

            if(prerequisiteUnit.enrollmentPeriod >= container.id && 
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