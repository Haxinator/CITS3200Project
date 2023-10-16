import unittest
from neo4j import GraphDatabase

class TestNeo4jQueries(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create a connection to the test Neo4j database (sandbox)
        cls.uri = "bolt://34.227.158.222:7687"
        cls.auth = ("neo4j", "voltages-difficulty-licenses")

        load_majors = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRyHZgzU-R8wb5cbQB2PaH-mFWkIlmlFzL4HQNFgnyW4VZ1g7lbQ8IEL80j_beFAajNoM7xUivpgMRu/pub?gid=0&single=true&output=csv' AS row
                MERGE (m:Major {major: row.major})
                ON CREATE SET m.major = row.major, m.name = row.name,  m.year_offered = row.year_offered
                """
        load_units = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRWr8QNW9F6FkXMeNq3ytscAlHhZ-E_yQCyutZuFVtoQvcygdzmSBR3BfsAFZJjDsybIHfyEPY9SIUj/pub?gid=1006418552&single=true&output=csv' AS row
                MERGE (u:Unit {unitcode: row.unitcode})
                ON CREATE SET u.unitname = row.unitname, u.semester = row.semester, u.type = row.type, u.level = row.level, u.credit_points = row.credit_points, u.points_req = row.points_req, u.incompatible_units = row.incompatible_units, u.notes = row.notes
                """
        load_unit_rel = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxQJBNXRmpfqGbl2ZbKPFLgPLVsqFgiMxtk33pne9bomN1VOSXMkQi778mg-vteejKloFaI7oGoEA3/pub?gid=889593185&single=true&output=csv' AS row
                MATCH (child:Unit {unitcode: row.child_unit})
                MATCH (parent:Unit {unitcode: row.parent_unit})
                CALL apoc.merge.relationship(child, row.relationship, {type: row.rel_type, year: row.year}, {}, parent) YIELD rel
                RETURN rel
                """
        load_major_rel = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTiBLvtK4sV6Kf0g79SCJI0twfYQI0GRv8mJxUJQNBjOqXuuqj2rGRMnYYufLEpzMpKne4mY59kgfgO/pub?gid=0&single=true&output=csv' AS row
                MATCH (child:Unit {unitcode: row.unitcode})
                MATCH (parent:Major {major: row.major})
                CALL apoc.merge.relationship(child, row.relationship, {year: row.year}, {}, parent) YIELD rel
                RETURN rel
                """
        load_units_2022 = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfaz-FOCK4_htdAlU0ysxBkn1iCdhgtHdjQc6pJCxh9qKkiJ-3auUUrl_tNhXnd-MjBzWImlituYd9/pub?gid=0&single=true&output=csv' AS row
                MERGE (u:Unit {unitcode: row.unitcode})
                ON CREATE SET u.unitname = row.unitname, u.semester = row.semester, u.type = row.type, u.level = row.level, u.credit_points = row.credit_points, u.points_req = row.points_req, u.incompatible_units = row.incompatible_units, u.notes = row.notes
                """
        load_unit_rel_2022 = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfaz-FOCK4_htdAlU0ysxBkn1iCdhgtHdjQc6pJCxh9qKkiJ-3auUUrl_tNhXnd-MjBzWImlituYd9/pub?gid=982367849&single=true&output=csv' AS row
                MATCH (child:Unit {unitcode: row.child_unit})
                MATCH (parent:Unit {unitcode: row.parent_unit})
                CALL apoc.merge.relationship(child, row.relationship, {type: row.rel_type, year: row.year}, {}, parent) YIELD rel
                RETURN rel
                """
        load_major_rel_2022 = """
                LOAD CSV WITH HEADERS FROM 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfaz-FOCK4_htdAlU0ysxBkn1iCdhgtHdjQc6pJCxh9qKkiJ-3auUUrl_tNhXnd-MjBzWImlituYd9/pub?gid=171016116&single=true&output=csv' AS row
                MATCH (child:Unit {unitcode: row.unitcode})
                MATCH (parent:Major {major: row.major})
                CALL apoc.merge.relationship(child, row.relationship, {year: row.year}, {}, parent) YIELD rel
                RETURN rel
                """

        with GraphDatabase.driver(cls.uri, auth=cls.auth) as driver:
            with driver.session() as session:
                session.execute_write(lambda tx: tx.run(load_majors))
                session.execute_write(lambda tx: tx.run(load_units))
                session.execute_write(lambda tx: tx.run(load_major_rel))
                session.execute_write(lambda tx: tx.run(load_unit_rel))
                session.execute_write(lambda tx: tx.run(load_units_2022))
                session.execute_write(lambda tx: tx.run(load_major_rel_2022))
                session.execute_write(lambda tx: tx.run(load_unit_rel_2022))

    @classmethod
    def tearDownClass(cls):
        # Clean up by deleting the test data
        with GraphDatabase.driver(cls.uri, auth=cls.auth) as driver:
            with driver.session() as session:
                session.execute_write(lambda tx: tx.run("MATCH (n) DETACH DELETE n"))


    # Validate whether the nodes and relationships have been successfully added to the database
    def test_count_majors(self):
        # Run a query to count majors
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
            with driver.session() as session:
                result = session.run("MATCH (m:Major) RETURN COUNT(m) AS count")
                count = result.single()["count"]

        self.assertEqual(count, 9)
        print(f"There are {count} majors in the database")

    def test_count_units(self):
        # Run a query to count units
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
            with driver.session() as session:
                result = session.run("MATCH (u:Unit) RETURN COUNT(u) AS count")
                count = result.single()["count"]
     
        self.assertGreater(count, 0)  # Ensure there is at least one unit
        print(f"There are {count} units found in the database.")
    
    def test_count_major_rel(self):
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
            with driver.session() as session:
                result = session.run("MATCH (u:Unit)-[r]->(m:Major) RETURN COUNT(r) AS relationship_count")
                count = result.single()["relationship_count"]
     
        self.assertGreater(count, 0)  # Ensure there is at least one unit
        print(f"There are {count} unit-major relationships in the database.")
    
    def test_count_unit_rel(self):
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
            with driver.session() as session:
                result = session.run("MATCH (u:Unit)-[r]->(n:Unit) RETURN COUNT(r) AS relationship_count")
                count = result.single()["relationship_count"]
     
        self.assertGreater(count, 0)  # Ensure there is at least one unit
        print(f"There are {count} unit-unit relationships in the database.")


    # Validate whether information for each unit has been rendered 
    def find_node_prop(self, unitcode):
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
                with driver.session() as session:
                    result = session.run(f"MATCH (u:Unit) WHERE u.unitcode = '{unitcode}' RETURN DISTINCT keys(u) AS existing_properties")
                    return [record["existing_properties"] for record in result]

    def test_node_prop(self):
        math1011_props = ['level', 'semester', 'unitcode', 'type', 'credit_points', 'unitname']
        cits3200_props = ['level', 'unitcode', 'type', 'semester', 'incompatible_units', 'points_req', 'credit_points', 'unitname']
        geng5010_props = ['points_req', 'notes', 'unitname', 'credit_points', 'semester', 'incompatible_units', 'unitcode', 'type', 'level']

        a = self.find_node_prop("MATH1011")
        self.assertEqual(set(a[0]), set(math1011_props))
        b = self.find_node_prop("CITS3200")
        self.assertEqual(set(b[0]), set(cits3200_props))
        c = self.find_node_prop("GENG5010")
        self.assertEqual(set(c[0]), set(geng5010_props))
        print("Units have the correct node properties!")
    

    # Validate information return to table - sample unit: MECH3424
    def test_unit_info(self):
        # expected values for MECH3424
        unitcode = "MECH3424"
        unitname = "Measurement and Instrumentation"
        type = "CORE_SP-EMECH"
        semester = "S2"
        level = "3"
        credit_pts = "6"
        points_req = None
        or_req = ["CITS1401", "CITS2401"]
        and_req = ["ENSC2004", "MATH1012", "GENG2000"]
        unit_req = [["CITS1401", "CITS2401"], ["ENSC2004", "MATH1012", "GENG2000"]]
        incompatible_units = "MECH4424"
        corequisites = []
        notes = None

        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
            with driver.session() as session:
                query = """
                        MATCH ((u:Unit)-[a:CORE_OF]->(m:Major))
                        WHERE u.unitcode = "MECH3424" AND m.major = "SP-EMECH" AND a.year = "2023"
                        OPTIONAL MATCH (bridge:Unit)
                        WHERE bridge.unitcode = "NONE"
                        WITH COLLECT(DISTINCT u) + COLLECT(DISTINCT bridge) AS combined
                        UNWIND combined as node
                        OPTIONAL MATCH (node)-[or:REQUIRES]->(r_or)
                        WHERE or.year = "2023" AND or.type = "OR"
                        OPTIONAL MATCH (node)-[and:REQUIRES]->(r_and)
                        WHERE and.year = "2023" AND and.type = "AND"
                        OPTIONAL MATCH (node)-[cc:COREQUIRES]->(c)
                        WHERE cc.year = "2023"
                        WITH node, COLLECT(DISTINCT r_or.unitcode) as or_req, COLLECT(DISTINCT r_and.unitcode) as and_req, COLLECT(DISTINCT c.unitcode) as corequisites
                        WITH node, or_req, and_req, [or_req, and_req] as unit_req, corequisites
                        RETURN node.unitcode as unitcode, node.unitname as unitname, node.type as type, node.semester as semester, node.level as level, node.credit_points as credit_points, node.points_req as points_req, or_req, and_req, unit_req, node.incompatible_units as incompatibilities, corequisites, node.notes as notes
                        ORDER BY level
                        """
                result = session.run(query)

                for record in result:
                    self.assertEqual(record["unitcode"], unitcode)
                    self.assertEqual(record["unitname"], unitname)
                    self.assertEqual(record["type"], type)
                    self.assertEqual(record["semester"], semester)
                    self.assertEqual(record["level"], level)
                    self.assertEqual(record["credit_points"], credit_pts)
                    self.assertEqual(record["semester"], semester)
                    self.assertEqual(record["points_req"], points_req)
                    self.assertEqual(set(record["or_req"]), set(or_req))
                    self.assertEqual(set(record["and_req"]), set(and_req))
                    self.assertEqual(record["unit_req"], unit_req)
                    self.assertEqual(record["corequisites"], corequisites)
                    self.assertEqual(record["incompatibilities"], incompatible_units)
                    self.assertEqual(record["notes"], notes)
                print("MECH3424 has the correct unit information")

    # Validate if the paths returned have 6 or less elements + units in paths belong to chosen major
    def forward_traversal(self, chosen_unit, major):
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
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
                prerequisites = [record["prerequisites"] for record in results]
                return prerequisites

    def backward_traversal(self, chosen_unit, major):
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
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
                child_units = [record["child_units"] for record in results]
                return child_units

    def test_graph_traversals(self):
        with GraphDatabase.driver(self.uri, auth=self.auth) as driver:
            with driver.session() as session:
                query = """
                MATCH (u:Unit) 
                MATCH (m:Major) 
                WHERE m.major = 'SP-EMECH' AND (u)-[:CORE_OF|GROUP_A_OF|GROUP_B_OF]->(m) OR (u.type = "ATAR") OR (u.type = "BRIDGING") 
                RETURN COLLECT(DISTINCT u.unitcode) as expected_units
                """
                result = session.run(query)
                expected = result.single()["expected_units"]
            
        math1011_prereq = self.forward_traversal("MATH1011", "SP-EMECH")
        math1011_child = self.backward_traversal("MATH1011", "SP-EMECH") 

        for prereq in math1011_prereq:
            # assert number of elements in each path
            self.assertLessEqual(len(prereq), 5)
            # check if units in path are also in major
            for unit in prereq:
                self.assertIn(unit, expected)   
        
        for child in math1011_child:
            # assert number of elements in each path; 6 elements to account for starting node
            self.assertLessEqual(len(child), 5+1)
            # check if units in path are also in major
            for unit in child:
                self.assertIn(unit, expected) 
        
        print("Graph traversal successful for both directions")

if __name__ == "__main__":
    unittest.main()
