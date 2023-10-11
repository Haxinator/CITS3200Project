from flask import render_template, flash, redirect, url_for, request, jsonify
from neo4j import GraphDatabase
# from neo4j import __version__ as neo4j_version
from app import app
import itertools

# ------------------------------------- HTML RENDERING ------------------------------------------------
# Home page
@app.route('/')
@app.route('/index/')
def index():
    # Render the index template with the title
    return render_template('index.html', title='Home')

# getStarted
@app.route('/getStarted/')
def getStarted():
    # Render the index template with the title
    return render_template('getStarted.html', title='Get Started')

# Stafflogin
@app.route('/staffLogin/')
def staffLogin():
    # Render the staff Login template with the title
    return render_template('staffLogin.html', title='Staff Login')



@app.route('/preferences', methods=['POST'])
def preferences():
    # You can access form data using request.form
    specialization = request.form['specialization']
    yearLevel = request.form['yearLevel']
    #prints out unit code SP-ECHEM
    #Create vars to pass to preferences page
    mathSpecialist = request.form['mathSpecialist']
    chemistry = request.form['chemistry']
    physics = request.form['physics']
    return render_template('preferences.html', title='Preferences', specialization = specialization, mathSpecialist = mathSpecialist, chemistry = chemistry, physics = physics, yearLevel = yearLevel) # Render the preferences page


# ------------------------------------- NEO4J QUERIES ------------------------------------------------
driver = GraphDatabase.driver(
    "bolt://e5218dc4.databases.neo4j.io:7687", 
    auth=("neo4j", "svH9RLz19fQFpDDgjnQCZMO9MF6WEVPRmtpXEaNVQ2o"), 
    encrypted=True, 
    trust="TRUST_ALL_CERTIFICATES"
)

@app.route("/get_majors=<string:year>", methods=["GET"])
def get_majors(year):
    with driver.session() as session:
        query = f"""
        MATCH (m:Major)
        WHERE (m)--() AND m.year_offered CONTAINS "{year}"
        RETURN m.major as major, m.name as name
        """

        results = session.run(query)
        data = results.data()
        return jsonify(data)
    
    
@app.route("/get_max_broadening=<string:major>", methods=["GET"])
def get_broadening_pts(major):
    with driver.session() as session:
        query = f"""
        MATCH (m:Major)
        WHERE m.major = "{major}"
        RETURN m.max_broadening_pts as max_broadening_pts
        """
        results = session.run(query)
        data = results.data()
        return jsonify(data)
    

@app.route("/unitInformation/<string:major>/bridging=<string:bridging>/year=<string:year>", methods=["GET"])
def send_unit_information(major, bridging, year):
    with driver.session() as session:
        units = bridging.split(",") 
        unit_conditions = " OR ".join([f"bridge.unitcode = '{unit}'" for unit in units])

    # REVISED VERSION: ----------------------------------------------------------------------
        # fix js first before implementing this query
        # 'unit_req' property now implements AND-OR
        # instead of returning e.g., ["MATH1012", "GENG2000", "CITS1401", "ENSC2004", "CITS2401"],  
        # it returns e.g., [" MATH1012_AND", " GENG2000_AND", " CITS1401_OR", " ENSC2004_AND", " CITS2401_OR"]
        # AND = must-have unit 
        # OR = not necessarily a must-have but can fill the requirements if one of them are taken
        # ATAR-type units have an "NA" (non-applicable) flag as they do not appear on the table

        query = f"""
        MATCH ((u:Unit)-[a:CORE_OF]->(m:Major))
        WHERE m.major = "{major}" AND a.year = "{year}"
        OPTIONAL MATCH (bridge:Unit)
        WHERE {unit_conditions}
        WITH COLLECT(DISTINCT u) + COLLECT(DISTINCT bridge) AS combined
        UNWIND combined as node
        OPTIONAL MATCH (node)-[or:REQUIRES]->(r_or)
        WHERE or.year = "{year}" AND or.type = "OR"
        OPTIONAL MATCH (node)-[and:REQUIRES]->(r_and)
        WHERE and.year = "{year}" AND and.type = "AND"
        OPTIONAL MATCH (node)-[cc:COREQUIRES]->(c)
        WHERE cc.year = "{year}"
        WITH node, COLLECT(DISTINCT r_or.unitcode) as or_req, COLLECT(DISTINCT r_and.unitcode) as and_req, COLLECT(DISTINCT c.unitcode) as corequisites
        WITH node, or_req, and_req, [or_req,and_req] as unit_req, corequisites
        RETURN node.unitcode as unitcode, node.unitname as unitname, node.type as type, node.semester as semester, node.major as major, node.level as level, node.credit_points as credit_points, node.points_req as points_req, node.enrolment_req as enrolment_req, or_req, and_req, unit_req, node.incompatible_units as incompatibilities, corequisites
        ORDER BY level
        """
        
        results = session.run(query)
        data = results.data()
        return jsonify(data)

@app.route("/option_units=<string:major>/year=<string:year>", methods=["GET"])
def get_option_units(major, year):
    with driver.session() as session:
        query = f"""
        MATCH ((u:Unit)-[a:GROUP_A_OF|GROUP_B_OF]->(m:Major))
        WHERE m.major = "{major}" AND a.year = "{year}"
        OPTIONAL MATCH (u)-[or:REQUIRES]->(r_or)
        WHERE or.year = "{year}" AND or.type = "OR"
        OPTIONAL MATCH (u)-[and:REQUIRES]->(r_and)
        WHERE and.year = "{year}" AND and.type = "AND"
        OPTIONAL MATCH (u)-[cc:COREQUIRES]->(c)
        WHERE cc.year = "{year}"
        WITH u, COLLECT(DISTINCT r_or.unitcode) as or_req, COLLECT(DISTINCT r_and.unitcode) as and_req, COLLECT(DISTINCT c.unitcode) as corequisites
        WITH u, or_req, and_req, [or_req,and_req] as unit_req, corequisites
        RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, or_req, and_req, unit_req, u.incompatible_units as incompatibilities, corequisites
        ORDER BY level
        """
        results = session.run(query)
        data = results.data()
        return jsonify(data)

@app.route("/option_combos=<string:major>/year=<string:year>", methods=["GET"])  
def get_option_combos(major, year): 
     with driver.session() as session:
        query = f"""MATCH (u:Unit) -[rel:GROUP_A_OF|GROUP_B_OF]-> (m:Major)
        WHERE m.major = "{major}" AND rel.year = "{year}"
        RETURN COLLECT(DISTINCT u.unitcode) as options, TYPE(rel) as group_type"""

        results = session.run(query)
        result_list = [dict(record) for record in results]
        print(result_list)

        # lists of different option units
        if(major != "SP-ESOFT"):
            options_a = result_list[0]['options']
            options_b = result_list[1]['options']
            both = options_a+options_b

        combinations = []
        # FOR MECH ENGINEERING
        if major == "SP-EMECH":
            # one 12-point unit (from Group A) + one 6-point (from any group)
            combos_1 = []
            if ("GENG4411" in options_a) and ("GENG4412" in options_a):
                combos_1 = [["GENG4411", "GENG4412", unit] for unit in both if (unit != "GENG4411") and (unit != "GENG4412")]

            # three 6-point units - must have AT LEAST ONE Group A unit
            group_b = list(itertools.combinations(options_b, 2))
            combos_2 = []
            for combination in group_b:
                valid_combo = list(combination) 
                valid_combo.append("MECH5552")
                combos_2.append(valid_combo)
            # combine two types of combinations
            combinations = combos_1 + combos_2
            print(combinations)

        # FOR CHEM ENGINEERING
        if major == "SP-ECHEM":
            # two Group A units
            group_a = list(itertools.combinations(options_a, 2))
            combos_1 = [list(combination) for combination in group_a]

            # two Group B units
            group_b = list(itertools.combinations(options_b, 2))
            combos_2 = [list(combination) for combination in group_b]

            # combine both groups and do cartesian product
            chem_ab = itertools.product(combos_1, combos_2)

            # cleans up the tuple by removing lists within the combo - returns just four units in the combination
            for c in chem_ab: 
                finalised = []
                g_A = c[0]
                g_B = c[1]
                for i in range(2):
                    finalised.append(g_A[i])
                    finalised.append(g_B[i])
                combinations.append(finalised)
            print(combinations)

        return jsonify(combinations)
     

# ------------------------------------- TREE VIEW QUERIES ------------------------------------

@app.route("/prereqs/<string:major>/<string:chosen_unit>", methods=["GET"])
def get_prereq_units(chosen_unit, major):
    with driver.session() as session:
        query = """
        MATCH (u:Unit {unitcode: $chosen_unit})
        MATCH (m:Major {major: $major})
        CALL apoc.path.expandConfig(u, {relationshipFilter: "REQUIRES>", minLevel: 1, maxLevel: 5})
        YIELD path
        RETURN [node IN nodes(path) WHERE ((node)-[:CORE_OF|GROUP_A_OF|GROUP_B_OF]->(m) OR (node.type = "ATAR") OR (node.type = "BRIDGING")) | node.unitcode] AS prerequisites  
        """
        x = {"chosen_unit": chosen_unit, "major": major}
        results = session.run(query, x)
        data = results.data()
        return jsonify(data)

@app.route("/child_units/<string:major>/<string:chosen_unit>", methods=["GET"])
def get_child_units(chosen_unit, major):
    with driver.session() as session:
        query = """
        MATCH (u:Unit {unitcode: $chosen_unit})
        MATCH (m:Major {major: $major})
        CALL apoc.path.expandConfig(u, {relationshipFilter: "<REQUIRES", minLevel: 1, maxLevel: 5})
        YIELD path
        RETURN [node IN nodes(path) WHERE ((node)-[:CORE_OF|GROUP_A_OF|GROUP_B_OF]->(m) OR (node.type = "ATAR") OR (node.type = "BRIDGING")) | node.unitcode] AS child_units
        """
        x = {"chosen_unit": chosen_unit, "major": major}
        results = session.run(query, x)
        data = results.data()
        return jsonify(data)