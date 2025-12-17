"""
Train Reservation System - Comprehensive Selenium Test Suite
Author: Automated Testing
Date: 2024
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException, NoAlertPresentException
import time
import random

class TrainReservationTests:
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 15)
        self.base_url = "http://localhost:3000"
        self.test_results = []
        self.test_email = None
        self.test_password = None
        
    def log_result(self, test_name, passed, message=""):
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append(f"{status} - {test_name}: {message}")
        print(f"{status} - {test_name}: {message}")
    
    def test_01_homepage_loads(self):
        """Test Case 1: Verify homepage loads successfully"""
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            assert "Train Reservation" in self.driver.title
            login_form = self.wait.until(EC.presence_of_element_located((By.ID, "loginForm")))
            assert login_form.is_displayed()
            self.log_result("Test 1: Homepage Loads", True, "Homepage loaded with login form")
        except AssertionError as e:
            self.log_result("Test 1: Homepage Loads", False, f"Assertion failed: {str(e)}")
        except Exception as e:
            self.log_result("Test 1: Homepage Loads", False, str(e))
    
    def test_02_login_register_tabs(self):
        """Test Case 2: Verify Login/Register tabs switch correctly"""
        try:
            self.driver.get(self.base_url)
            register_link = self.wait.until(EC.element_to_be_clickable((By.ID, "showRegister")))
            register_link.click()
            time.sleep(0.5)
            
            register_form = self.driver.find_element(By.ID, "registerForm")
            assert register_form.is_displayed()
            
            login_link = self.driver.find_element(By.ID, "showLogin")
            login_link.click()
            time.sleep(0.5)
            
            login_form = self.driver.find_element(By.ID, "loginForm")
            assert login_form.is_displayed()
            self.log_result("Test 2: Login/Register Tabs", True, "Tabs switch correctly")
        except Exception as e:
            self.log_result("Test 2: Login/Register Tabs", False, str(e))
    
    def test_03_user_registration(self):
        """Test Case 3: Register a new user"""
        try:
            self.driver.get(self.base_url)
            self.driver.find_element(By.ID, "showRegister").click()
            time.sleep(0.5)
            
            random_num = random.randint(1000, 9999)
            self.test_email = f"testuser{random_num}@example.com"
            self.test_password = "test123"
            
            self.driver.find_element(By.ID, "regName").send_keys(f"Test User {random_num}")
            self.driver.find_element(By.ID, "regEmail").send_keys(self.test_email)
            self.driver.find_element(By.ID, "regPassword").send_keys(self.test_password)
            self.driver.find_element(By.ID, "registerBtn").click()
            
            time.sleep(2)
            assert "dashboard.html" in self.driver.current_url
            self.log_result("Test 3: User Registration", True, f"User registered: {self.test_email}")
        except Exception as e:
            self.log_result("Test 3: User Registration", False, str(e))
    
    def test_04_login_valid_user(self):
        """Test Case 4: Login with valid credentials"""
        try:
            self.driver.find_element(By.ID, "logoutBtn").click()
            time.sleep(1)
            
            self.driver.get(self.base_url)
            self.driver.find_element(By.ID, "loginEmail").send_keys(self.test_email)
            self.driver.find_element(By.ID, "loginPassword").send_keys(self.test_password)
            self.driver.find_element(By.ID, "loginBtn").click()
            
            time.sleep(2)
            assert "dashboard.html" in self.driver.current_url
            self.log_result("Test 4: Login Valid User", True, "Login successful")
        except Exception as e:
            self.log_result("Test 4: Login Valid User", False, str(e))
    
    def test_05_dashboard_loads(self):
        """Test Case 5: Verify dashboard loads with all sections"""
        try:
            search_section = self.driver.find_element(By.ID, "searchSection")
            cart_section = self.driver.find_element(By.ID, "cartSection")
            bookings_section = self.driver.find_element(By.ID, "bookingsSection")
            
            assert search_section is not None
            assert cart_section is not None
            assert bookings_section is not None
            self.log_result("Test 5: Dashboard Loads", True, "All sections present")
        except Exception as e:
            self.log_result("Test 5: Dashboard Loads", False, str(e))
    
    def test_06_sidebar_menu(self):
        """Test Case 6: Verify sidebar menu navigation"""
        try:
            cart_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-section="cartSection"]')
            cart_btn.click()
            time.sleep(0.5)
            cart_section = self.driver.find_element(By.ID, "cartSection")
            assert "active" in cart_section.get_attribute("class")
            
            search_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-section="searchSection"]')
            search_btn.click()
            time.sleep(0.5)
            search_section = self.driver.find_element(By.ID, "searchSection")
            assert "active" in search_section.get_attribute("class")
            
            self.log_result("Test 6: Sidebar Menu", True, "Menu navigation works")
        except Exception as e:
            self.log_result("Test 6: Sidebar Menu", False, str(e))
    
    def test_07_logout(self):
        """Test Case 7: Verify logout functionality"""
        try:
            logout_btn = self.driver.find_element(By.ID, "logoutBtn")
            logout_btn.click()
            time.sleep(1)
            
            assert self.driver.current_url == self.base_url + "/" or "index.html" in self.driver.current_url
            self.log_result("Test 7: Logout", True, "Logout successful")
        except Exception as e:
            self.log_result("Test 7: Logout", False, str(e))
    
    def test_08_login_wrong_user(self):
        """Test Case 8: Login with invalid credentials"""
        try:
            self.driver.get(self.base_url)
            self.driver.find_element(By.ID, "loginEmail").send_keys("wrong@example.com")
            self.driver.find_element(By.ID, "loginPassword").send_keys("wrongpass")
            self.driver.find_element(By.ID, "loginBtn").click()
            
            time.sleep(1)
            error = self.driver.find_element(By.ID, "loginError")
            assert error.text != ""
            self.log_result("Test 8: Login Wrong User", True, "Error message displayed")
        except Exception as e:
            self.log_result("Test 8: Login Wrong User", False, str(e))
    
    def test_09_source_dropdown_selection(self):
        """Test Case 9: Select source station from dropdown"""
        try:
            self.driver.get(self.base_url)
            self.driver.find_element(By.ID, "loginEmail").send_keys(self.test_email)
            self.driver.find_element(By.ID, "loginPassword").send_keys(self.test_password)
            self.driver.find_element(By.ID, "loginBtn").click()
            time.sleep(2)
            
            source_select = Select(self.wait.until(EC.presence_of_element_located((By.ID, "sourceInput"))))
            time.sleep(1)
            source_select.select_by_index(1)
            
            selected = source_select.first_selected_option.text
            assert selected != "Select source station"
            self.log_result("Test 9: Source Dropdown", True, f"Selected: {selected}")
        except Exception as e:
            self.log_result("Test 9: Source Dropdown", False, str(e))
    
    def test_10_destination_dropdown(self):
        """Test Case 10: Select destination station from dropdown"""
        try:
            time.sleep(1)
            dest_select = Select(self.driver.find_element(By.ID, "destinationInput"))
            dest_select.select_by_index(1)
            
            selected = dest_select.first_selected_option.text
            assert selected != "Select destination"
            self.log_result("Test 10: Destination Dropdown", True, f"Selected: {selected}")
        except Exception as e:
            self.log_result("Test 10: Destination Dropdown", False, str(e))
    
    def test_11_date_input(self):
        """Test Case 11: Enter journey date"""
        try:
            date_input = self.driver.find_element(By.ID, "dateInput")
            date_input.clear()
            date_input.send_keys("12/31/2024")
            
            assert date_input.get_attribute("value") != ""
            self.log_result("Test 11: Date Input", True, "Date entered successfully")
        except Exception as e:
            self.log_result("Test 11: Date Input", False, str(e))
    
    def test_12_train_search(self):
        """Test Case 12: Search for trains"""
        try:
            search_btn = self.driver.find_element(By.ID, "searchBtn")
            search_btn.click()
            time.sleep(2)
            
            train_list = self.driver.find_element(By.ID, "trainList")
            assert train_list.is_displayed()
            self.log_result("Test 12: Train Search", True, "Search executed")
        except Exception as e:
            self.log_result("Test 12: Train Search", False, str(e))
    
    def test_13_train_cards_display(self):
        """Test Case 13: Verify train cards are displayed"""
        try:
            train_cards = self.driver.find_elements(By.CLASS_NAME, "train-card")
            assert len(train_cards) > 0
            
            first_card = train_cards[0]
            assert first_card.is_displayed()
            self.log_result("Test 13: Train Cards Display", True, f"{len(train_cards)} trains displayed")
        except Exception as e:
            self.log_result("Test 13: Train Cards Display", False, str(e))
    
    def test_14_cart_details(self):
        """Test Case 14: Add train to cart and verify details"""
        try:
            add_btn = self.driver.find_element(By.CLASS_NAME, "btn-select")
            add_btn.click()
            time.sleep(1)
            
            cart_section = self.driver.find_element(By.ID, "cartSection")
            assert "active" in cart_section.get_attribute("class")
            
            cart_details = self.driver.find_element(By.ID, "cartTrainDetails")
            assert cart_details.text != ""
            self.log_result("Test 14: Cart Details", True, "Train added to cart")
        except Exception as e:
            self.log_result("Test 14: Cart Details", False, str(e))
    
    def test_15_add_passenger(self):
        """Test Case 15: Add passenger with details"""
        try:
            add_passenger_btn = self.driver.find_element(By.ID, "addPassengerBtn")
            add_passenger_btn.click()
            time.sleep(0.5)
            
            alert = self.driver.switch_to.alert
            alert.send_keys("John Doe")
            alert.accept()
            time.sleep(0.5)
            
            alert = self.driver.switch_to.alert
            alert.send_keys("30")
            alert.accept()
            time.sleep(0.5)
            
            alert = self.driver.switch_to.alert
            alert.send_keys("M")
            alert.accept()
            time.sleep(0.5)
            
            alert = self.driver.switch_to.alert
            alert.send_keys("+911234567890")
            alert.accept()
            time.sleep(1)
            
            tbody = self.driver.find_element(By.CSS_SELECTOR, "#passengerTable tbody")
            rows = tbody.find_elements(By.TAG_NAME, "tr")
            assert len(rows) > 0
            self.log_result("Test 15: Add Passenger", True, "Passenger added successfully")
        except Exception as e:
            self.log_result("Test 15: Add Passenger", False, str(e))
    
    def test_16_payment_method(self):
        """Test Case 16: Select payment method"""
        try:
            payment_select = Select(self.driver.find_element(By.ID, "paymentMethod"))
            payment_select.select_by_value("CARD")
            
            card_input = self.driver.find_element(By.ID, "cardNumber")
            assert card_input.is_displayed()
            
            payment_select.select_by_value("UPI")
            time.sleep(0.5)
            
            self.log_result("Test 16: Payment Method", True, "Payment methods work")
        except Exception as e:
            self.log_result("Test 16: Payment Method", False, str(e))
    
    def test_17_navigate_to_bookings(self):
        """Test Case 17: Navigate to bookings section"""
        try:
            bookings_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-section="bookingsSection"]')
            bookings_btn.click()
            time.sleep(1)
            
            bookings_section = self.driver.find_element(By.ID, "bookingsSection")
            assert "active" in bookings_section.get_attribute("class")
            self.log_result("Test 17: Navigate to Bookings", True, "Bookings section active")
        except Exception as e:
            self.log_result("Test 17: Navigate to Bookings", False, str(e))
    
    def test_18_navigate_to_transactions(self):
        """Test Case 18: Navigate to transactions section"""
        try:
            transactions_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-section="transactionsSection"]')
            transactions_btn.click()
            time.sleep(1)
            
            transactions_section = self.driver.find_element(By.ID, "transactionsSection")
            assert "active" in transactions_section.get_attribute("class")
            self.log_result("Test 18: Navigate to Transactions", True, "Transactions section active")
        except Exception as e:
            self.log_result("Test 18: Navigate to Transactions", False, str(e))
    
    def test_19_admin_login(self):
        """Test Case 19: Login as admin user"""
        try:
            self.driver.find_element(By.ID, "logoutBtn").click()
            time.sleep(1)
            
            self.driver.get(self.base_url)
            self.driver.find_element(By.ID, "loginEmail").send_keys("admin@railway.com")
            self.driver.find_element(By.ID, "loginPassword").send_keys("admin123")
            self.driver.find_element(By.ID, "loginBtn").click()
            
            time.sleep(2)
            assert "dashboard.html" in self.driver.current_url
            self.log_result("Test 19: Admin Login", True, "Admin logged in")
        except Exception as e:
            self.log_result("Test 19: Admin Login", False, str(e))
    
    def test_20_admin_panel_visible(self):
        """Test Case 20: Verify admin panel is visible"""
        try:
            admin_btn = self.driver.find_element(By.ID, "adminMenuBtn")
            assert admin_btn.is_displayed()
            
            search_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-section="searchSection"]')
            assert not search_btn.is_displayed()
            
            self.log_result("Test 20: Admin Panel Visible", True, "Admin menu visible, search hidden")
        except Exception as e:
            self.log_result("Test 20: Admin Panel Visible", False, str(e))
    
    def test_21_admin_section_access(self):
        """Test Case 21: Access admin section and verify data"""
        try:
            admin_btn = self.driver.find_element(By.ID, "adminMenuBtn")
            admin_btn.click()
            time.sleep(2)
            
            admin_section = self.driver.find_element(By.ID, "adminSection")
            assert "active" in admin_section.get_attribute("class")
            
            bookings_container = self.driver.find_element(By.ID, "adminBookingsContainer")
            transactions_container = self.driver.find_element(By.ID, "adminTransactionsContainer")
            
            assert bookings_container.is_displayed()
            assert transactions_container.is_displayed()
            self.log_result("Test 21: Admin Section Access", True, "Admin data displayed")
        except Exception as e:
            self.log_result("Test 21: Admin Section Access", False, str(e))
    
    def test_22_mobile_responsive(self):
        """Test Case 22: Test mobile responsive design"""
        try:
            self.driver.set_window_size(375, 667)
            time.sleep(1)
            
            sidebar = self.driver.find_element(By.CLASS_NAME, "sidebar")
            assert sidebar.is_displayed()
            self.log_result("Test 22: Mobile Responsive", True, "Mobile view works")
        except Exception as e:
            self.log_result("Test 22: Mobile Responsive", False, str(e))
    
    def test_23_tablet_responsive(self):
        """Test Case 23: Test tablet responsive design"""
        try:
            self.driver.set_window_size(768, 1024)
            time.sleep(1)
            
            main = self.driver.find_element(By.CLASS_NAME, "main")
            assert main.is_displayed()
            self.log_result("Test 23: Tablet Responsive", True, "Tablet view works")
        except Exception as e:
            self.log_result("Test 23: Tablet Responsive", False, str(e))
    
    def test_24_desktop_responsive(self):
        """Test Case 24: Test desktop responsive design"""
        try:
            self.driver.set_window_size(1920, 1080)
            time.sleep(1)
            
            dashboard = self.driver.find_element(By.CLASS_NAME, "dashboard-shell")
            assert dashboard.is_displayed()
            self.log_result("Test 24: Desktop Responsive", True, "Desktop view works")
        except Exception as e:
            self.log_result("Test 24: Desktop Responsive", False, str(e))
    
    def run_all_tests(self):
        """Execute all test cases"""
        print("\n" + "="*70)
        print("TRAIN RESERVATION SYSTEM - COMPREHENSIVE TEST SUITE")
        print("="*70 + "\n")
        
        tests = [
            self.test_01_homepage_loads,
            self.test_02_login_register_tabs,
            self.test_03_user_registration,
            self.test_04_login_valid_user,
            self.test_05_dashboard_loads,
            self.test_06_sidebar_menu,
            self.test_07_logout,
            self.test_08_login_wrong_user,
            self.test_09_source_dropdown_selection,
            self.test_10_destination_dropdown,
            self.test_11_date_input,
            self.test_12_train_search,
            self.test_13_train_cards_display,
            self.test_14_cart_details,
            self.test_15_add_passenger,
            self.test_16_payment_method,
            self.test_17_navigate_to_bookings,
            self.test_18_navigate_to_transactions,
            self.test_19_admin_login,
            self.test_20_admin_panel_visible,
            self.test_21_admin_section_access,
            self.test_22_mobile_responsive,
            self.test_23_tablet_responsive,
            self.test_24_desktop_responsive,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {test.__name__}: {str(e)}")
                pass
        
        self.print_summary()
    
    def print_summary(self):
        """Print test execution summary"""
        print("\n" + "="*70)
        print("TEST EXECUTION SUMMARY")
        print("="*70)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result)
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result)
        total = len(self.test_results)
        
        print(f"\nTotal Tests: {total}")
        print(f"Passed: {passed} ({(passed/total*100):.1f}%)")
        print(f"Failed: {failed} ({(failed/total*100):.1f}%)")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result:
                    print(result)
        
        print("\n" + "="*70 + "\n")
    
    def cleanup(self):
        """Close browser and cleanup"""
        time.sleep(5)
        try:
            self.driver.quit()
        except:
            pass

if __name__ == "__main__":
    test_suite = TrainReservationTests()
    try:
        test_suite.run_all_tests()
    finally:
        test_suite.cleanup()
