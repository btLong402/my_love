from playwright.sync_api import sync_playwright
import os
import time

def verify_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the file
        filepath = os.path.abspath("index.html")
        page.goto(f"file://{filepath}")

        # Wait for animation to start (init is called after 1000ms)
        time.sleep(2)

        # Take a screenshot of the default state
        page.screenshot(path="verification/verification_default.png")
        print("Default state screenshot taken.")

        # Click settings button
        page.click("#settings-btn")
        time.sleep(1)

        # Take a screenshot of the settings open
        page.screenshot(path="verification/verification_settings.png")
        print("Settings open screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ux()
