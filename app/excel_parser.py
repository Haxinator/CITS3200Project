import pandas as pd
from typing import List
# Defining the class for a Unit
class Unit:
    def __init__(self, unit_id, code, title, availability, prerequisites, corequisites, incompatibilities):
        self.unit_id = unit_id
        self.code = code
        self.title = title
        self.availability = availability
        self.prerequisites = prerequisites
        self.corequisites = corequisites
        self.incompatibilities = incompatibilities

    def __repr__(self):
        return f"Unit(code={self.code}, title={self.title})"


# Defining the class for a Major Pathway
class MajorPathway:
    def __init__(self, name, units):
        self.name = name
        self.units = units

    def __repr__(self):
        return f"MajorPathway(name={self.name}, units={len(self.units)} units)"


# Example usage
unit_example = Unit(
    unit_id="1063",
    code="CHEM1003",
    title="Introductory Chemistry",
    availability="Semester 1",
    prerequisites="Nil.",
    corequisites="Nil.",
    incompatibilities="Not available to students who have completed CHEM1103."
)

major_pathway_example = MajorPathway(name="Mechanical Engineering", units=[unit_example])

unit_example, major_pathway_example



# Function to parse the availability from the given text
def parse_availability(availability_text: str) -> str:
    if "Semester 1" in availability_text and "Semester 2" in availability_text:
        return "both"
    elif "Semester 1" in availability_text:
        return "Sem 1"
    elif "Semester 2" in availability_text:
        return "Sem 2"
    else:
        return "Unknown"
    
    
def parse_prerequisites(prerequisites_text: str) -> str:
    #Code to parse incompatibilities.
    return 0

def parse_corequisites(corequisites_text: str) -> str:
    #Code to parse incompatibilities.
    return 0

def parse_incompatibility(incompatibility_text: str) -> str:
    #Code to parse incompatibilities.
    return 0


# Function to parse the Excel sheet and return a list of Unit objects
def parse_excel(sheet_path: str) -> List[Unit]:
    # Reading the Excel sheet
    data = pd.read_excel(sheet_path, sheet_name="Sequence export", skiprows=2)
    
    # Extracting the required columns
    units = []
    for index, row in data.iterrows():
        unit_id = row[0]
        code = row[1]
        title = row[2]
        availability = parse_availability(row[3])
        prerequisites = row[5]
        corequisites = row[6]
        incompatibilities = row[7]
        
        # Creating a Unit object and adding it to the list
        unit = Unit(unit_id, code, title, availability, prerequisites, corequisites, incompatibilities)
        units.append(unit)
    return units


# Function to extract the major code and name from the Excel sheet
def extract_major_info(sheet_path: str):
    # Reading the first row of the Excel sheet
    first_row = pd.read_excel(sheet_path, sheet_name="Sequence export", nrows=1).iloc[0, 0]
    
    # Extracting the major code and name
    major_code = first_row.split(" ")[-2]
    major_name = first_row.split(" ")[-3] + " Engineering"
    
    return major_code, major_name

# Function to organize the units into a specific major pathway
def create_major_pathway(sheet_path: str) -> MajorPathway:
    # Parsing the units from the Excel sheet
    units = parse_excel(sheet_path)
    
    # Extracting the major code and name
    major_code, major_name = extract_major_info(sheet_path)
    
    # Creating a MajorPathway object
    major_pathway = MajorPathway(name=major_name, units=units)
    
    return major_pathway

# Testing the function with the provided Excel sheet
mechanical_engineering_pathway = create_major_pathway(r"C:\Users\syedm\OneDrive\Uni\Year 3\Sem 2\CITS3200\CITS3200Project\app\Mech2024.xlsx")
print(mechanical_engineering_pathway)