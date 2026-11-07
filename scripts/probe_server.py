import subprocess
import time
import urllib.request
import json
import os
import sys

cwd = r"C:\Users\PAVAN SURAD\.gemini\antigravity\scratch\leaklens-ai"

# Start next start on port 3044
print("Starting Next.js server on port 3044...")
proc = subprocess.Popen(
    ["npx.cmd", "next", "start", "-p", "3044"],
    cwd=cwd,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

try:
    # Wait for server to boot
    time.sleep(4)

    # Probe /api/leaklens/summary?demo=1
    url = "http://localhost:3044/api/leaklens/summary?demo=1"
    print(f"GET {url}")
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("\n--- KPI Summary ---")
        print(json.dumps(data.get("kpis"), indent=2))
        print(f"\nTotal Anomalies Detected: {len(data.get('anomalies', []))}")
        for a in data.get('anomalies', []):
            print(f"- [{a['severity']}] {a['title']} | Excess: +${a['estimatedExcessLeakAmount']} ({a['actualMetricValue']}% vs {a['baselineMetricValue']}%)")
        print(f"\nTotal Products Tracked: {len(data.get('products', []))}")
        for p in data.get('products', []):
            print(f"- {p['productName']}: ${p['grossRevenue']} gross | Return Rate: {(p['refundRate']*100):.1f}% | Excess: +${p['excessRefundAmount']} | Status: {p['status']}")

    # Probe /api/leaklens/investigate with POST
    post_url = "http://localhost:3044/api/leaklens/investigate"
    print(f"\nPOST {post_url}")
    req_body = json.dumps({"query": "Why did refunds increase on NeuralPredict this week?", "forceDemo": True}).encode('utf-8')
    req = urllib.request.Request(post_url, data=req_body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        inv_data = json.loads(resp.read().decode('utf-8'))
        print("\n--- AI Investigation Response ---")
        print(json.dumps(inv_data, indent=2))

    # Probe /leaklens HTML page
    page_url = "http://localhost:3044/leaklens"
    print(f"\nGET {page_url}")
    with urllib.request.urlopen(page_url, timeout=10) as resp:
        html = resp.read().decode('utf-8')
        print(f"HTML Status: {resp.status}, Length: {len(html)} bytes")
        assert "LeakLens AI" in html
        print("Page renders LeakLens AI successfully!")

finally:
    print("\nStopping server process...")
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except:
        proc.kill()
    print("Server stopped.")
