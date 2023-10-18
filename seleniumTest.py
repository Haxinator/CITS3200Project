import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import platform
from selenium.webdriver.chrome.service import Service

class ChatAppTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        s = Service('/static/chromedriver.exe')
        if platform.system() == 'Windows':
            cls.driver = webdriver.Chrome(service=s)
        elif platform.system() == 'Darwin':
            cls.driver = webdriver.Chrome('/static/chromedriverMac')  
        cls.driver.implicitly_wait(10)  # Implicit wait for 10 seconds

    @classmethod
    def tearDownClass(cls):
        cls.driver.close()

    def staff_login(self):
        driver = self.driver

        # Navigate to the initial website
        driver.get('http://127.0.0.1:5001/')

        # Scroll down the index page slowly up until halfway
        scroll_height = driver.execute_script("return document.body.scrollHeight") // 2
        for _ in range(scroll_height // 50):  # Assuming each scroll is 50 pixels
            driver.execute_script("window.scrollBy(0, 50);")
            time.sleep(0.5)  # Waiting half a second between scrolls

        # Click on the "staffLogin" button
        staff_login_btn = driver.find_element_by_id("staffLogin")
        staff_login_btn.click()

        # Wait for the new page to render
        time.sleep(0.5)

        # Scroll down slightly
        driver.execute_script("window.scrollBy(0, 50);")
        time.sleep(0.5)

        # Find the username input, click on it, and type the username
        username_input = driver.find_element_by_id("ctl00_LeftCol_txtUWAPersonID")
        username_input.click()
        username_input.send_keys("0000000")

        # Give a short delay
        time.sleep(0.5)

        # Find the password input, click on it, and type the password
        password_input = driver.find_element_by_id("ctl00_LeftCol_txtPassword")
        password_input.click()
        password_input.send_keys("password")

        # Give a short delay
        time.sleep(0.5)

        # Click on the login button
        login_btn = driver.find_element_by_id("ctl00_LeftCol_btnSubmit")
        login_btn.click()

        # Wait for 2 seconds after clicking submit
        time.sleep(2)

    def test_staff_login(self):
        self.staff_login()

if __name__ == '__main__':
    unittest.main()




# Driver needs to initialy get this website "http://127.0.0.1:5001/" It then needs to carry on and progress. It needs to first scroll down this index page slowly (up untill halfway).. and then it will find 2 buttons. Each with element id "getStarted" and another "staffLogin". It needs to click on staffLogin first. The button. This will change the route and take it to another page. wait till the new page renders, then scroll down slightly, and then find the text input id tag "ctl00_LeftCol_txtUWAPersonID" It needs to click on this and then type some text into it. The text should be "0000000" (login username) and then it needs to click the text box right below it which is the password field which should have id tag "ctl00_LeftCol_txtPassword" and enter password "password". It should then click the login button with id tag"ctl00_LeftCol_btnSubmit". BEtween everything, give atleast half a second wait blocks. But when it clicks submit, i want you to give it 2 seconds wait block. Lets implement this thus far.. 