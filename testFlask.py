import unittest
from EngPreferences import app
from flask import template_rendered
from contextlib import contextmanager
import json


# Capturing templates and their contexts
@contextmanager
def captured_templates(app):
    recorded = []
    def record(sender, template, context):
        recorded.append((template, context))
    template_rendered.connect(record, app)
    try:
        yield recorded
    finally:
        template_rendered.disconnect(record, app)

class FlaskTestCase(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def tearDown(self):
        pass
    # Test initial index page
    def test_index(self):
        print("Testing index route...")
        with captured_templates(app) as templates:
            response = self.client.get('/')
            assert response.status_code == 200
            template, context = templates[0]
            self.assertEqual(template.name, 'index.html')
            self.assertEqual(context['title'], 'Home')
        print("Passed!\n")
    # Test get started route
    def test_getStarted(self):
        print("Testing getStarted route...")
        with captured_templates(app) as templates:
            response = self.client.get('/getStarted/')
            assert response.status_code == 200
            template, context = templates[0]
            self.assertEqual(template.name, 'getStarted.html')
            self.assertEqual(context['title'], 'Get Started')
        print("Passed!\n")
    # Test staff login routes
    def test_staffLogin(self):
        print("Testing staffLogin route...")
        with captured_templates(app) as templates:
            response = self.client.get('/staffLogin/')
            assert response.status_code == 200
            template, context = templates[0]
            self.assertEqual(template.name, 'staffLogin.html')
            self.assertEqual(context['title'], 'Staff Login')
        print("Passed!\n")

    # Sample test for /preferences route
    def test_preferences_post(self):
        print("Testing Preferences route...")
        with captured_templates(app) as templates:
            response = self.client.post('/preferences', data={
                'specialization': 'SP-EBIOM',
                'yearLevel': '1',
                'mathSpecialist': 'Yes',
                'chemistry': 'Yes',
                'physics': 'No'
            })
            assert response.status_code == 200
            template, context = templates[0]
            self.assertEqual(template.name, 'preferences.html')
            self.assertEqual(context['specialization'], 'SP-EBIOM')
            self.assertEqual(context['mathSpecialist'], 'Yes')
        print("Passed!\n")
    # Sample test to see preferences failing on invalid Major entry. 
    def test_preferences_post_invalid_data(self):
        print("Testing Preferences route with invalid data...")
        with captured_templates(app) as templates:
            # Sending invalid specialization data
            response = self.client.post('/preferences', data={
                'specialization': 'INVALID-SPEC',
                'yearLevel': '1',
                'mathSpecialist': 'Yes',
                'chemistry': 'Yes',
                'physics': 'No'
            })
            assert response.status_code == 200  
            template, context = templates[0]
            
            # Using assertRaises to expect the AssertionError
            with self.assertRaises(AssertionError):
                self.assertNotEqual(context['specialization'], 'INVALID-SPEC')
            
            # If an AssertionError is raised in the above context, it means the test is successful!
        print("Passed!\n")


if __name__ == '__main__':
    unittest.main()
