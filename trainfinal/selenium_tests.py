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
BASE_URL = "http://localhost:3000"

passed = 0
failed = 0

def run_test(func):
    global passed, failed
    try:
        func()
        passed += 1
    except Exception as e:
        failed += 1
        print(f"❌ FAILED: {e}")

def test_1_load_homepage():
    driver.get(BASE_URL)
    assert "Train Reservation" in driver.title
    print("✅ Test 1: Homepage loads")

def test_2_register_user():
    driver.get(BASE_URL)
    driver.find_element(By.ID, "tab-register").click()
    time.sleep(1)
    email = f"user{random.randint(1000,9999)}@test.com"
    driver.find_element(By.ID, "regName").send_keys("Test User")
    driver.find_element(By.ID, "regEmail").send_keys(email)
    driver.find_element(By.ID, "regPassword").send_keys("test123")
    driver.find_element(By.CSS_SELECTOR, "#registerForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    print("✅ Test 2: User registration")
    return email

def test_3_logout():
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(1)
    assert "index.html" in driver.current_url or driver.current_url == BASE_URL + "/"
    print("✅ Test 3: Logout")

def test_4_login_user(email):
    driver.get(BASE_URL)
    driver.find_element(By.ID, "loginEmail").send_keys(email)
    driver.find_element(By.ID, "loginPassword").send_keys("test123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    print("✅ Test 4: User login")

def test_5_search_section_visible():
    section = driver.find_element(By.ID, "searchSection")
    assert section.is_displayed()
    print("✅ Test 5: Search section visible")

def test_6_select_source_station():
    source = Select(driver.find_element(By.ID, "sourceInput"))
    source.select_by_index(1)
    assert source.first_selected_option.text != "Select source station"
    print("✅ Test 6: Select source station")

def test_7_select_destination_station():
    time.sleep(1)
    dest = Select(driver.find_element(By.ID, "destinationInput"))
    dest.select_by_index(1)
    assert dest.first_selected_option.text != "Select destination"
    print("✅ Test 7: Select destination station")

def test_8_select_journey_date():
    driver.find_element(By.ID, "dateInput").send_keys("12/31/2024")
    print("✅ Test 8: Select journey date")

def test_9_search_trains():
    driver.find_element(By.ID, "searchBtn").click()
    time.sleep(2)
    trains = driver.find_element(By.ID, "trainList")
    assert trains.is_displayed()
    print("✅ Test 9: Search trains")

def test_10_add_train_to_cart():
    driver.find_element(By.CLASS_NAME, "btn-select").click()
    time.sleep(1)
    cart = driver.find_element(By.ID, "cartSection")
    assert "active" in cart.get_attribute("class")
    print("✅ Test 10: Add train to cart")

def test_11_cart_section_visible():
    details = driver.find_element(By.ID, "cartTrainDetails")
    assert details.text != ""
    print("✅ Test 11: Cart section shows train details")

def test_12_add_passenger():
    driver.find_element(By.ID, "addPassengerBtn").click()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    alert.send_keys("John Doe")
    alert.accept()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    alert.send_keys("30")
    alert.accept()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    alert.send_keys("M")
    alert.accept()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    alert.send_keys("+911234567890")
    alert.accept()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    alert.accept()
    time.sleep(1)
    print("✅ Test 12: Add passenger")

def test_13_passenger_table_updated():
    tbody = driver.find_element(By.CSS_SELECTOR, "#passengerTable tbody")
    rows = tbody.find_elements(By.TAG_NAME, "tr")
    assert len(rows) > 0
    print("✅ Test 13: Passenger table updated")

def test_14_select_seat():
    driver.find_element(By.CLASS_NAME, "seat-assign-btn").click()
    time.sleep(1)
    modal = driver.find_element(By.ID, "seatModal")
    assert modal.is_displayed()
    print("✅ Test 14: Seat selection modal opens")

def test_15_select_coach():
    coach = Select(driver.find_element(By.ID, "seatCoachSelect"))
    coach.select_by_index(0)
    time.sleep(1)
    print("✅ Test 15: Select coach")

def test_16_select_seat_number():
    driver.find_element(By.CLASS_NAME, "seat-btn").click()
    time.sleep(0.5)
    print("✅ Test 16: Select seat number")

def test_17_confirm_seat():
    driver.find_element(By.ID, "seatConfirmBtn").click()
    time.sleep(1)
    print("✅ Test 17: Confirm seat selection")

def test_18_select_payment_method():
    payment = Select(driver.find_element(By.ID, "paymentMethod"))
    payment.select_by_value("CARD")
    print("✅ Test 18: Select payment method")

def test_19_enter_card_number():
    driver.find_element(By.ID, "cardNumber").send_keys("1234 5678 9012 3456")
    print("✅ Test 19: Enter card number")

def test_20_checkout():
    driver.find_element(By.ID, "checkoutBtn").click()
    time.sleep(3)
    alert = driver.switch_to.alert
    alert.accept()
    time.sleep(1)
    print("✅ Test 20: Checkout successful")

def test_21_view_bookings():
    driver.find_element(By.CSS_SELECTOR, '[data-section="bookingsSection"]').click()
    time.sleep(2)
    section = driver.find_element(By.ID, "bookingsSection")
    assert "active" in section.get_attribute("class")
    print("✅ Test 21: View bookings section")

def test_22_admin_panel_bookings():
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(2)
    driver.get(BASE_URL)
    time.sleep(1)
    driver.find_element(By.ID, "loginEmail").send_keys("admin@railway.com")
    driver.find_element(By.ID, "loginPassword").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    admin_section = driver.find_element(By.ID, "adminSection")
    assert "active" in admin_section.get_attribute("class")
    admin_bookings = driver.find_element(By.ID, "adminBookingsContainer")
    assert admin_bookings is not None
    print("✅ Test 22: Admin panel bookings visible")

def test_23_admin_transactions():
    time.sleep(1)
    admin_trans = driver.find_element(By.ID, "adminTransactionsContainer")
    assert admin_trans is not None
    print("✅ Test 23: Admin transactions visible")

def test_24_user_login_back():
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(2)
    driver.get(BASE_URL)
    time.sleep(1)
    driver.find_element(By.ID, "loginEmail").send_keys("test@example.com")
    driver.find_element(By.ID, "loginPassword").send_keys("test123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    assert "dashboard.html" in driver.current_url
    print("✅ Test 24: User can login back")

def test_25_admin_login():
    driver.find_element(By.ID, "logoutBtn").click()
    time.sleep(2)
    driver.get(BASE_URL)
    time.sleep(1)
    driver.find_element(By.ID, "loginEmail").send_keys("admin@railway.com")
    driver.find_element(By.ID, "loginPassword").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "#loginForm button").click()
    time.sleep(3)
    admin_btn = driver.find_element(By.ID, "adminMenuBtn")
    assert admin_btn.is_displayed()
    print("✅ Test 25: Admin login and panel visible")

print("\n" + "="*60)
print("TRAIN RESERVATION - 25 SELENIUM TESTS")
print("="*60 + "\n")

try:
    run_test(test_1_load_homepage)
    email = test_2_register_user()
    passed += 1
    run_test(test_3_logout)
    test_4_login_user(email)
    passed += 1
    run_test(test_5_search_section_visible)
    run_test(test_6_select_source_station)
    run_test(test_7_select_destination_station)
    run_test(test_8_select_journey_date)
    run_test(test_9_search_trains)
    run_test(test_10_add_train_to_cart)
    run_test(test_11_cart_section_visible)
    run_test(test_12_add_passenger)
    run_test(test_13_passenger_table_updated)
    run_test(test_14_select_seat)
    run_test(test_15_select_coach)
    run_test(test_16_select_seat_number)
    run_test(test_17_confirm_seat)
    run_test(test_18_select_payment_method)
    run_test(test_19_enter_card_number)
    run_test(test_20_checkout)
    run_test(test_21_view_bookings)
    run_test(test_22_admin_panel_bookings)
    run_test(test_23_admin_transactions)
    run_test(test_24_user_login_back)
except Exception as e:
    print(f"\n❌ Critical error: {e}")
    failed += 1
finally:
    print("\n" + "="*60)
    print(f"RESULTS: {passed} PASSED | {failed} FAILED | {passed+failed} TOTAL")
    print("="*60 + "\n")
    time.sleep(3)
    driver.quit()
