from excel_parser import Unit, MajorPathway, create_major_pathway
import networkx as nx
import pandas as pd
import matplotlib.pyplot as plt

# Function to evaluate if a unit is available based on specific units or ATAR requirements
def is_unit_available(unit: Unit, atar_prerequisites: dict) -> bool:
    # Handle missing or "Nil." prerequisites
    if pd.isnull(unit.prerequisites) or unit.prerequisites == "Nil.":
        return True

    # Split the prerequisites by "or" to check different options
    prerequisites = unit.prerequisites.split(" or ")
    for prerequisite in prerequisites:
        # Check if the prerequisite is an ATAR subject and if the user has met it
        for atar_subject, status in atar_prerequisites.items():
            if atar_subject in prerequisite and status == "no":
                return True
        return True
        # # Check if the prerequisite is a specific unit that has been completed (can be extended later)
        # if prerequisite in unit.code:  # Placeholder condition; will be extended to check completed units
        #     return True

    return False

# Function to create nodes for each unit, considering ATAR prerequisites
def create_nodes_with_atar(graph: nx.DiGraph, major_pathway: MajorPathway, atar_prerequisites: dict) -> None:
    for unit in major_pathway.units:
        # Check if the unit is available based on specific units or ATAR requirements
        available = is_unit_available(unit, atar_prerequisites)

        # Add the unit as a node to the graph if it is available
        if available:
            graph.add_node(unit.code, unit=unit)
            
            
# Helper function to extract unit codes from a text (prerequisites, corequisites, incompatibilities)
def extract_unit_codes(text: str):
    if pd.isnull(text) or text in ["Nil.", ""]:
        return []
    return [''.join(filter(str.isalnum, item.split(" ")[0])) for item in text.split(" or ")]

# Updated function to create edges for prerequisites
def create_prerequisite_edges(graph: nx.DiGraph, major_pathway: MajorPathway) -> None:
    for unit in major_pathway.units:
        prerequisites = extract_unit_codes(unit.prerequisites)
        for prerequisite_code in prerequisites:
            if prerequisite_code in graph.nodes:
                graph.add_edge(prerequisite_code, unit.code, relationship="prerequisite")

# Updated function to create edges for corequisites
def create_corequisite_edges(graph: nx.DiGraph, major_pathway: MajorPathway) -> None:
    for unit in major_pathway.units:
        corequisites = extract_unit_codes(unit.corequisites)
        for corequisite_code in corequisites:
            if corequisite_code in graph.nodes:
                graph.add_edge(unit.code, corequisite_code, relationship="corequisite")
                graph.add_edge(corequisite_code, unit.code, relationship="corequisite")

# Updated function to create edges for incompatibilities
def create_incompatibility_edges(graph: nx.DiGraph, major_pathway: MajorPathway) -> None:
    for unit in major_pathway.units:
        incompatibilities = extract_unit_codes(unit.incompatibilities)
        for incompatibility_code in incompatibilities:
            if incompatibility_code in graph.nodes:
                graph.add_edge(unit.code, incompatibility_code, relationship="incompatibility")
                graph.add_edge(incompatibility_code, unit.code, relationship="incompatibility")

# create_prerequisite_edges(graph_example_extended, mechanical_engineering_pathway)
# create_corequisite_edges(graph_example_extended, mechanical_engineering_pathway)
# create_incompatibility_edges(graph_example_extended, mechanical_engineering_pathway)

            
            
            
            

# Example usage with updated function
graph_example = nx.DiGraph()

# Example usage with ATAR prerequisites
atar_prerequisites_example = {
    "mathSpecialist": "yes",
    "mathMethods": "no",
    "chemistry": "yes",
    "physics": "yes"
}

mechanical_engineering_pathway = create_major_pathway(r"C:\Users\syedm\OneDrive\Uni\Year 3\Sem 2\CITS3200\CITS3200Project\app\Mech2024.xlsx")
create_nodes_with_atar(graph_example, mechanical_engineering_pathway, atar_prerequisites_example)
nx.draw(graph_example, with_labels = True)
plt.show()
# Displaying the nodes in the updated example graph
print(list(graph_example.nodes(data=True))[:5])  # Displaying the first 5 nodes
