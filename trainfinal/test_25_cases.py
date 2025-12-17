from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options
import time
import random

chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

driver = webdriver.Chrome(options=chrome_options)
driver.maximize_window()
wait = WebDriverWait(driver, 10)
passed = 0
failed = 0

print("\n" + "="*60)
print("TRAIN RESERVATION - 30 TEST CASES (Including Seat Selection)")
print("="*60 + "\n")

def test(num, name):
    print(f"Test {num}: {name}...")

def pass_test():
    global passed
    passed += 1
    print("✅ PASS\n")

def fail_test(msg):
    global failed
    failed += 1
    print(f"❌ FAIL - {msg}\n")

try:
    # Test 1: Homepage loads
    test(1, "Homepage loads")
    driver.get("http://localhost:3000")
    time.sleep(2)
    assert "Train Reservation" in driver.title
    pass_test()
    
    # Test 2: Login form visible
    test(2, "Login form visible")
    login_form = driver.find_element(By.ID, "loginForm")
    assert login_form.is_displayed()
    pass_test()
    
    # Test 3: Switch to register tab
    test(3, "Switch to register tab")
    driver.find_element(By.ID, "tab-register").click()
    time.sleep(1)
    reg_form = driver.find_element(By.ID, "registerForm")
    assert reg_form.is_displayed()
    pass_test()
    
    # Test 4: Register new user
    test(4, "Register new user")
    email = f"user{random.randint(1000,9999)}@test.com"
    driver.find_element(By.ID, "regName").send_keys("Test User")
    driver.find_element(By.ID, "regEmail").send_keys(email)
    driver.find_element(By.ID, "regPassword").send_keys("test123")
    driver.find_element(By.CSS_SELECTOR, "#registerForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    pass_test()
    
    # Test 5: Dashboard loads
    test(5, "Dashboard loads")
    search = driver.find_element(By.ID, "searchSection")
    assert search is not None
    pass_test()
    
    # Test 6: Sidebar visible
    test(6, "Sidebar visible")
    sidebar = driver.find_element(By.CLASS_NAME, "sidebar")
    assert sidebar.is_displayed()
    pass_test()
    
    # Test 7: User name displayed
    test(7, "User name displayed")
    user_name = driver.find_element(By.ID, "chipUserName")
    assert user_name.text != ""
    pass_test()
    
    # Test 8: Navigate to cart
    test(8, "Navigate to cart")
    driver.find_element(By.CSS_SELECTOR, '[data-section="cartSection"]').click()
    time.sleep(1)
    cart = driver.find_element(By.ID, "cartSection")
    assert "active" in cart.get_attribute("class")
    pass_test()
    
    # Test 9: Navigate to bookings
    test(9, "Navigate to bookings")
    driver.find_element(By.CSS_SELECTOR, '[data-section="bookingsSection"]').click()
    time.sleep(1)
    bookings = driver.find_element(By.ID, "bookingsSection")
    assert "active" in bookings.get_attribute("class")
    pass_test()
    
    # Test 10: Navigate to transactions
    test(10, "Navigate to transactions")
    driver.find_element(By.CSS_SELECTOR, '[data-section="transactionsSection"]').click()
    time.sleep(1)
    trans = driver.find_element(By.ID, "transactionsSection")
    assert "active" in trans.get_attribute("class")
    pass_test()
    
    # Test 11: Navigate back to search
    test(11, "Navigate back to search")
    driver.find_element(By.CSS_SELECTOR, '[data-section="searchSection"]').click()
    time.sleep(1)
    search = driver.find_element(By.ID, "searchSection")
    assert "active" in search.get_attribute("class")
    pass_test()
    
    # Test 12: Trains displayed
    test(12, "Trains displayed on load")
    time.sleep(2)
    trains = driver.find_elements(By.CLASS_NAME, "train-card")
    assert len(trains) > 0
    pass_test()
    
    # Test 13: Source dropdown has options
    test(13, "Source dropdown has options")
    source = Select(driver.find_element(By.ID, "sourceInput"))
    assert len(source.options) > 1
    pass_test()
    
    # Test 14: Date input exists
    test(14, "Date input exists")
    date_input = driver.find_element(By.ID, "dateInput")
    assert date_input is not None
    pass_test()
    
    # Test 15: Search button exists
    test(15, "Search button exists")
    search_btn = driver.find_element(By.ID, "searchBtn")
    assert search_btn.is_displayed()
    pass_test()
    
    # Test 16: Train card has details
    test(16, "Train card has details")
    first_train = driver.find_element(By.CLASS_NAME, "train-card")
    assert "₹" in first_train.text
    pass_test()
    
    # Test 17: Add to cart button exists
    test(17, "Add to cart button exists")
    add_btn = driver.find_element(By.CLASS_NAME, "btn-select")
    assert add_btn.is_displayed()
    pass_test()
    
    # Test 18: Logout button exists
    test(18, "Logout button exists")
    logout = driver.find_element(By.ID, "logoutBtn")
    assert logout.is_displayed()
    pass_test()
    
    # Test 19: Logout works
    test(19, "Logout works")
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(2)
    assert driver.current_url == "http://localhost:3000/" or "index.html" in driver.current_url
    pass_test()
    
    # Test 20: Login with registered user
    test(20, "Login with registered user")
    driver.find_element(By.ID, "loginEmail").send_keys(email)
    driver.find_element(By.ID, "loginPassword").send_keys("test123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    pass_test()
    
    # Test 21: Admin login
    test(21, "Admin login")
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(1)
    driver.get("http://localhost:3000")
    time.sleep(1)
    driver.find_element(By.ID, "loginEmail").send_keys("admin@railway.com")
    driver.find_element(By.ID, "loginPassword").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    pass_test()
    
    # Test 22: Admin panel visible
    test(22, "Admin panel visible")
    admin_btn = driver.find_element(By.ID, "adminMenuBtn")
    assert admin_btn.is_displayed()
    pass_test()
    
    # Test 23: Admin panel loads
    test(23, "Admin panel loads")
    admin_btn.click()
    time.sleep(2)
    admin_section = driver.find_element(By.ID, "adminSection")
    assert "active" in admin_section.get_attribute("class")
    pass_test()
    
    # Test 24: Admin bookings container exists
    test(24, "Admin bookings container exists")
    bookings_container = driver.find_element(By.ID, "adminBookingsContainer")
    assert bookings_container is not None
    pass_test()
    
    # Test 25: Admin transactions container exists
    test(25, "Admin transactions container exists")
    trans_container = driver.find_element(By.ID, "adminTransactionsContainer")
    assert trans_container is not None
    pass_test()
    
    # Test 26: Login as regular user for seat selection tests
    test(26, "Login as regular user for seat tests")
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(1)
    driver.get("http://localhost:3000")
    time.sleep(1)
    driver.find_element(By.ID, "loginEmail").send_keys(email)
    driver.find_element(By.ID, "loginPassword").send_keys("test123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    pass_test()
    
    # Test 27: Add train to cart and add passenger
    test(27, "Add train to cart and add passenger")
    time.sleep(2)
    driver.find_element(By.CLASS_NAME, "btn-select").click()
    time.sleep(2)
    driver.find_element(By.ID, "addPassengerBtn").click()
    time.sleep(1)
    driver.switch_to.alert.send_keys("John Doe")
    driver.switch_to.alert.accept()
    time.sleep(0.5)
    driver.switch_to.alert.send_keys("30")
    driver.switch_to.alert.accept()
    time.sleep(0.5)
    driver.switch_to.alert.send_keys("M")
    driver.switch_to.alert.accept()
    time.sleep(0.5)
    driver.switch_to.alert.send_keys("+911234567890")
    driver.switch_to.alert.accept()
    time.sleep(2)
    passenger_row = driver.find_element(By.CSS_SELECTOR, "#passengerTable tbody tr")
    assert "John Doe" in passenger_row.text
    pass_test()
    
    # Test 28: Seat selection button exists
    test(28, "Seat selection button exists")
    seat_btn = driver.find_element(By.CLASS_NAME, "seat-assign-btn")
    assert seat_btn.is_displayed()
    pass_test()
    
    # Test 29: Open seat modal
    test(29, "Open seat modal")
    driver.find_element(By.CLASS_NAME, "seat-assign-btn").click()
    time.sleep(1)
    seat_modal = driver.find_element(By.ID, "seatModal")
    assert seat_modal.is_displayed()
    pass_test()
    
    # Test 30: Select seat and confirm
    test(30, "Select seat and confirm")
    time.sleep(1)
    seat_btns = driver.find_elements(By.CLASS_NAME, "seat-btn")
    available_seat = None
    for btn in seat_btns:
        if "reserved" not in btn.get_attribute("class") and btn.is_enabled():
            available_seat = btn
            break
    assert available_seat is not None
    available_seat.click()
    time.sleep(1)
    driver.find_element(By.ID, "seatConfirmBtn").click()
    time.sleep(2)
    passenger_row = driver.find_element(By.CSS_SELECTOR, "#passengerTable tbody tr")
    assert "-" not in passenger_row.find_elements(By.TAG_NAME, "td")[3].text or len(passenger_row.find_elements(By.TAG_NAME, "td")[3].text) > 1
    pass_test()
    
except Exception as e:
    fail_test(str(e))

finally:
    print("="*60)
    print(f"RESULTS: {passed} PASSED | {failed} FAILED | {passed+failed} TOTAL")
    print("="*60 + "\n")
    time.sleep(3)
    driver.quit()
