import os
import shutil

src_dir = "/Users/nagendrakumarsharma/.gemini/antigravity-ide/brain/23cd92df-220a-410d-ba08-13a7be35ec54"
dst_dir = "/Users/nagendrakumarsharma/Desktop/Startups/Ravi/client/public/images/baraat"

os.makedirs(dst_dir, exist_ok=True)

files = [
    "audi_wedding_1781727797617.png",
    "fortuner_wedding_1781727752315.png",
    "hero_baraat_cabs_1781727713598.png",
    "innova_wedding_1781727739929.png",
    "luxury_bus_wedding_1781727824019.png",
    "scorpio_wedding_1781727726618.png",
    "tempo_traveller_wedding_1781727809663.png"
]

for f in files:
    src = os.path.join(src_dir, f)
    dst = os.path.join(dst_dir, f)
    try:
        shutil.copy2(src, dst)
        print(f"Copied {f}")
    except Exception as e:
        print(f"Failed to copy {f}: {e}")
