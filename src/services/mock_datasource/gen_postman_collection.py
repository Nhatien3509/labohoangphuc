#!/usr/bin/env python3
"""
gen_postman_collection.py
Sinh Postman collection JSON cho toàn bộ 306 schema mock datasource.

Usage:
    python gen_postman_collection.py
    python gen_postman_collection.py --host http://localhost:8087
"""

import argparse
import csv
import json
import uuid
from pathlib import Path
from urllib.parse import urlparse

SCHEMA_DIR = Path(__file__).parent / "schemas" / "csv"
OUTPUT     = Path(__file__).parent / "mock_datasource.postman_collection.json"

NGUON_TO_G = {
    "BCT":     "G02",
    "BHXH":    "G24",
    "BKHCN":   "G06",
    "BNG":     "G08",
    "BNNMT":   "G10",
    "BNV":     "G09",
    "BTC":     "G12",
    "BTP":     "G15",
    "BVHTTDL": "G16",
    "BXD":     "G17",
    "BYT":     "G18",
    "NHNN":    "G19",
}

G_TO_TEN = {
    "G02": "Bộ Công Thương",
    "G24": "Bảo hiểm Xã hội Việt Nam",
    "G06": "Bộ Khoa học và Công nghệ",
    "G08": "Bộ Ngoại giao",
    "G10": "Bộ Nông nghiệp và Phát triển nông thôn",
    "G09": "Bộ Nội vụ",
    "G12": "Bộ Tài chính",
    "G15": "Bộ Tư pháp",
    "G16": "Bộ Văn hóa, Thể thao và Du lịch",
    "G17": "Bộ Xây dựng",
    "G18": "Bộ Y tế",
    "G19": "Ngân hàng Nhà nước Việt Nam",
}


def read_ten_loai(csv_path: Path) -> str:
    try:
        raw = csv_path.read_bytes()
        if raw[:3] == b"\xef\xbb\xbf":
            raw = raw[3:]
        for row in csv.reader(raw.decode("utf-8").splitlines()):
            if row and row[0].strip() == "1.4":
                desc = row[5].strip() if len(row) > 5 else ""
                i = desc.find("= ")
                if i >= 0:
                    return desc[i+2:].rstrip(")").strip()
    except Exception:
        pass
    return ""


def make_request(g_code: str, ma_loai_g: str, ten_loai: str) -> dict:
    raw_url = (
        "{{baseUrl}}/api/v1/du-lieu-mo/tim-kiem"
        f"?Page=1&Size=10&Count=1"
        f"&OrderBy=NgayTaoGanNhat"
        f"&MaDonVi={g_code}"
        f"&MaLoaiDuLieu={ma_loai_g}"
    )
    name = f"{ma_loai_g}" + (f" — {ten_loai}" if ten_loai else "")
    return {
        "name": name,
        "request": {
            "method": "GET",
            "header": [
                {"key": "X-Expired-Date", "value": "{{x_expired_date}}"}
            ],
            "url": {
                "raw": raw_url,
                "host": ["{{baseUrl}}"],
                "path": ["api", "v1", "du-lieu-mo", "tim-kiem"],
                "query": [
                    {"key": "Page",         "value": "1"},
                    {"key": "Size",         "value": "10"},
                    {"key": "Count",        "value": "1"},
                    {"key": "OrderBy",      "value": "NgayTaoGanNhat"},
                    {"key": "MaDonVi",      "value": g_code},
                    {"key": "MaLoaiDuLieu", "value": ma_loai_g},
                ],
            },
        },
        "response": [],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="http://160.191.32.224:8087")
    args = parser.parse_args()
    host = args.host.rstrip("/")

    folders: dict[str, list[dict]] = {}

    for nguon_dir in sorted(SCHEMA_DIR.iterdir()):
        if not nguon_dir.is_dir():
            continue
        nguon  = nguon_dir.name
        g_code = NGUON_TO_G.get(nguon)
        if not g_code:
            print(f"  SKIP: {nguon}")
            continue

        requests = []
        for schema_dir in sorted(nguon_dir.iterdir()):
            if not schema_dir.is_dir():
                continue
            csv_files = list(schema_dir.glob("*_7cot.csv"))
            if not csv_files:
                continue
            orig_code = schema_dir.name
            parts = orig_code.split("_", 1)
            if len(parts) != 2:
                continue
            ma_loai_g = g_code + "_" + parts[1]
            ten_loai  = read_ten_loai(csv_files[0])
            requests.append(make_request(g_code, ma_loai_g, ten_loai))

        if requests:
            folders[g_code] = requests
            print(f"  {g_code} ({G_TO_TEN.get(g_code, nguon)}): {len(requests)} schemas")

    items = [
        {
            "name": f"{g} — {G_TO_TEN.get(g, g)}",
            "item": folders[g],
        }
        for g in sorted(folders)
    ]

    collection = {
        "info": {
            "name": "Mock Datasource — du-lieu-mo",
            "_postman_id": str(uuid.uuid4()),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "item": items,
        "variable": [
            {"key": "baseUrl",       "value": host,         "type": "string"},
            {"key": "x_expired_date","value": "2026-01-31", "type": "string"},
        ],
    }

    OUTPUT.write_text(json.dumps(collection, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(len(v) for v in folders.values())
    print(f"\nXong! {total} requests / {len(folders)} collections → {OUTPUT.name}")


if __name__ == "__main__":
    main()
