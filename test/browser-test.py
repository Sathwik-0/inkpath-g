import time
import os
from playwright.sync_api import sync_playwright

artifact_dir = r"C:\Users\ADMIN\.gemini\antigravity\brain\6ae8fd91-14e3-4aaf-b12e-3b034e8edd65"

with sync_playwright() as p:
    print("Launching Chromium browser...")
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    print("Step 1: Navigating to http://localhost:3000/create...")
    page.goto("http://localhost:3000/create", wait_until="networkidle")
    time.sleep(2)
    page.screenshot(path=os.path.join(artifact_dir, "step1_create_studio.png"))
    print("Saved step1_create_studio.png")

    print("Step 2: Filling topic and clicking Synthesize button...")
    # Find the title input and set it
    title_input = page.locator('input[type="text"]').first
    title_input.fill("Deep Learning: Neural Backpropagation & Gradient Descent")

    # Find the topic textarea
    textarea = page.locator('textarea').first
    textarea.fill("Feedforward neural networks compute loss via cross-entropy. Backpropagation applies the multivariable chain rule to compute gradients of the loss with respect to layer weights, iteratively updated via stochastic gradient descent.")

    page.screenshot(path=os.path.join(artifact_dir, "step2_filled_form.png"))
    print("Saved step2_filled_form.png")

    # Click synthesize button
    synthesize_btn = page.locator('button:has-text("Synthesize Lore")').first
    synthesize_btn.click()
    print("Clicked Synthesize button, waiting for Gemini API response...")

    # Wait for the preview gate to appear (up to 45 seconds)
    page.wait_for_selector('text=PREVIEW GATE (APPROVAL REQUIRED)', timeout=60000)
    time.sleep(2)
    page.screenshot(path=os.path.join(artifact_dir, "step3_preview_gate.png"))
    print("Saved step3_preview_gate.png - Preview Gate Loaded!")

    # Verify preview contents
    title_elem = page.locator('h2').first
    print("Generated Manhwa Title:", title_elem.inner_text())

    # Click Approve & Render Chapter 01 Artwork button
    print("Step 3: Clicking Approve & Render Chapter 01 Artwork...")
    approve_btn = page.locator('button:has-text("Approve & Render Chapter 01")').first
    approve_btn.click()

    # Wait for completion card
    print("Waiting for Chapter 01 rendering to complete...")
    page.wait_for_selector('text=Chapter 01 Rendered & Ready for Reading!', timeout=60000)
    time.sleep(2)
    page.screenshot(path=os.path.join(artifact_dir, "step4_artwork_rendered.png"))
    print("Saved step4_artwork_rendered.png")

    # Click Open in Webtoon Reader
    print("Step 4: Opening Webtoon Reader...")
    reader_link = page.locator('a:has-text("Open in Webtoon Reader")').first
    reader_link.click()

    # Wait for reader page
    page.wait_for_load_state("networkidle")
    time.sleep(4)
    page.screenshot(path=os.path.join(artifact_dir, "step5_webtoon_reader.png"))
    print("Saved step5_webtoon_reader.png - Webtoon Reader Active!")

    browser.close()
    print("Browser testing finished successfully!")

