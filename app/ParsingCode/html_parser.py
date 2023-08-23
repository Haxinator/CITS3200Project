from bs4 import BeautifulSoup
import re

# Class to handle prerequisites
class Prerequisites:
    def __init__(self, unit_prereq: str = "", enrollment_prereq: str = "", unit_points: str = ""):
        self.unit_prereq = unit_prereq
        self.enrollment_prereq = enrollment_prereq
        self.unit_points = unit_points

    def __repr__(self):
        return f"UnitPrereq: {self.unit_prereq}, EnrollmentPrereq: {self.enrollment_prereq}, UnitPoints: {self.unit_points}"

# Class to represent each unit
class Unit:
    def __init__(self, availability: str, unit_code: str, unit_name: str, prerequisites: Prerequisites, incompatibilities: str, unit_type: str):
        self.availability = availability
        self.unit_code = unit_code
        self.unit_name = unit_name
        self.prerequisites = prerequisites
        self.incompatibilities = incompatibilities
        self.unit_type = unit_type

    def __repr__(self):
        return f"Unit({self.availability}, {self.unit_code}, {self.unit_name}, {self.prerequisites}, {self.incompatibilities}, {self.unit_type})"


def parse_prerequisites(requirements):
    unit_prereq = ""
    enrollment_prereq = ""
    unit_points = ""
    
    # Helper function to extract unit codes and ATAR requirements from a string
    def extract_units(text):
        units = ""
        atar_match = re.search(r'(\w+)\s+ATAR', text)
        if atar_match:
            units += "ATAR_" + atar_match.group(1) + " or "
        unit_codes = re.findall(r'[A-Z]{4,5}\d{4}', text)
        units += " or ".join(unit_codes)
        return units

    # Iterate through implied and auto divs
    for div in requirements.find_all(['div', 'a'], class_=['implied', 'auto']):
        text = div.get_text().strip()

        # Check if "Enrolment in" appears in the text
        if 'Enrolment in' in text:
            enrollment_prereq += extract_units(text) + " or "
            continue

        # Check for unit prerequisites
        unit_prereq += extract_units(text) + " and "

    # Check for point prerequisites
    points_match = re.search(r'(\d+ Points)', requirements.get_text().strip())
    if points_match:
        unit_points = points_match.group(1)

    # Remove trailing " or " and " and "
    unit_prereq = unit_prereq.rstrip(" or ").rstrip(" and ")
    enrollment_prereq = enrollment_prereq.rstrip(" or ").rstrip(" and ")

    return Prerequisites(unit_prereq.strip(), enrollment_prereq.strip(), unit_points.strip())






# Function to parse incompatibilities
def parse_incompatibilities(requirements):
    incompatibility_tag = requirements.find('dt', string=lambda x: x and 'Incompatibility' in x)
    if incompatibility_tag:
        return incompatibility_tag.find_next_sibling('dd').get_text().strip()
    return ""

# Function to parse a single row of the table
def parse_row(row, unit_type):
    columns = row.find_all('td')
    availability = columns[0].get_text().strip()
    unit_code = columns[1].get_text().strip()
    unit_name = columns[2].get_text().strip()
    requirements = columns[3]
    
    prerequisites = parse_prerequisites(requirements)
    incompatibilities = parse_incompatibilities(requirements)
    
    return Unit(availability, unit_code, unit_name, prerequisites, incompatibilities, unit_type)

# Sample initialization for testing
sample_prerequisites = Prerequisites(unit_prereq="MATH1012 or MATX1012 and CITS2401", enrollment_prereq="Bachelor of Engineering")
sample_unit = Unit(availability="S1", unit_code="MATH1012", unit_name="Mathematical Theory", prerequisites=sample_prerequisites, incompatibilities="None", unit_type="Core")

# Path to the re-uploaded HTML file
html_file_path = r'C:\Users\syedm\OneDrive\Uni\Year 3\Sem 2\CITS3200\CITS3200Project\MechEng.html'

# Reading the HTML file
with open(html_file_path, 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parsing the HTML content again
soup = BeautifulSoup(html_content, 'html.parser')


# Function to extract the content under each level heading (Level 1, Level 2, etc.)
def extract_content_under_heading(heading_text):
    heading = soup.find('h4', string=heading_text)
    content = []
    for sibling in heading.find_next_siblings():
        if sibling.name and sibling.name.startswith('h'):
            break
        content.append(str(sibling))
    return content

# Extracting content under each level heading
level_1_content = extract_content_under_heading("Level 1")
level_2_content = extract_content_under_heading("Level 2")
level_3_content = extract_content_under_heading("Level 3")
level_4_content = extract_content_under_heading("Level 4")

# Function to extract units from the content under a specific heading
def extract_units_from_level_content(content, unit_type):
    units = []
    for item in content:
        item_soup = BeautifulSoup(item, 'html.parser')
        table = item_soup.find('table', {'class': 'styled', 'data-type': 'DSM'})
        if table:
            rows = table.find_all('tr')[1:] # Exclude header row
            for row in rows:
                unit = parse_row(row, unit_type)
                units.append(unit)
    return units

# Extracting Core units from Level 1 content
level_1_core_units = extract_units_from_level_content(level_1_content, "Core")
# Extracting Core units from Level 2 content
level_2_core_units = extract_units_from_level_content(level_2_content, "Core")
# Extracting Core units from Level 3 content
level_3_core_units = extract_units_from_level_content(level_3_content, "Core")
# Extracting Core units from Level 4 content
level_4_core_units = extract_units_from_level_content(level_4_content, "Core")


print (level_1_content)


from transformerImport import extract_from_html

extract_from_html(level_1_core_units)



# Finding the specific div containing the "Bridging units" text
bridging_units_div = soup.find('div', string="Bridging units")

# Extracting content surrounding the Bridging units div
bridging_units_surrounding_content = []
for sibling in bridging_units_div.find_parent().find_next_siblings():
    if sibling.name and sibling.name.startswith('h'):
        break
    bridging_units_surrounding_content.append(str(sibling))

# Extracting Bridging units using the surrounding content
bridging_units = extract_units_from_level_content(bridging_units_surrounding_content, "Bridging")



group_a_paragraphs = soup.find_all('p', string=lambda text: "Group A" in text if text else False)
group_a_paragraph_texts = [paragraph.get_text().strip() for paragraph in group_a_paragraphs]
# Finding the specific paragraph containing the text "Group A—take"
group_a_paragraph = soup.find('p', string=lambda text: "Group A—take" in text if text else False)

# Extracting content under the Group A paragraph
group_a_content = []
for sibling in group_a_paragraph.find_next_siblings():
    if sibling.name and sibling.name.startswith('h'):
        break
    group_a_content.append(str(sibling))

# Extracting Group A units using the content under the Group A paragraph
group_a_units = extract_units_from_level_content(group_a_content, "GroupA")

# Finding the specific paragraph containing the text "Group B—take"
group_b_paragraph = soup.find('p', string=lambda text: "Group B—take" in text if text else False)

# Extracting content under the Group B paragraph
group_b_content = []
for sibling in group_b_paragraph.find_next_siblings():
    if sibling.name and sibling.name.startswith('h'):
        break
    group_b_content.append(str(sibling))

# Extracting Group B units using the content under the Group B paragraph
group_b_units = extract_units_from_level_content(group_b_content, "GroupB")


# Example:
all_units = level_1_core_units + level_2_core_units + level_3_core_units + level_4_core_units + bridging_units + group_a_units + group_b_units
for i in range (len(all_units)):
    print(all_units[i].unit_code)
    print("    /n     Pre requisites: ")
    print(all_units[i].prerequisites)
    print("\n\n\n\n\n\n\n\n")


# print(all_units[:5])