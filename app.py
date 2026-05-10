import json
import os
import re
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
RECIPE_FILE = DATA_DIR / "recipes.json"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

app = Flask(__name__, static_folder=str(PUBLIC_DIR), static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024


SEED_RECIPES = [
    {
        "id": "galbijjim",
        "title": "갈비찜",
        "summary": "달큰한 간장 양념에 부드럽게 조린 명절 느낌의 소갈비찜",
        "servings": "4인분",
        "time": "90분",
        "difficulty": "보통",
        "image": "/images/galbijjim.png",
        "ingredients": [
            "소갈비 1kg",
            "무 200g",
            "당근 1/2개",
            "표고버섯 4개",
            "밤 8개",
            "대파 1대",
            "간장 1/2컵",
            "배 1/2개",
            "양파 1/2개",
            "설탕 2큰술",
            "맛술 3큰술",
            "다진 마늘 2큰술",
            "참기름 1큰술",
            "후추 약간"
        ],
        "steps": [
            "갈비는 찬물에 1시간 정도 담가 핏물을 빼고 깨끗하게 헹군다.",
            "끓는 물에 갈비를 5분 데친 뒤 다시 헹궈 불순물을 제거한다.",
            "배, 양파, 간장, 설탕, 맛술, 마늘, 후추를 갈아 양념장을 만든다.",
            "냄비에 갈비와 양념, 물 2컵을 넣고 중약불에서 40분 끓인다.",
            "무, 당근, 버섯, 밤을 넣고 25분 더 조린다.",
            "대파와 참기름을 넣고 윤기가 돌 때까지 살짝 더 졸여 마무리한다."
        ],
        "source": "만개의레시피 갈비찜 레시피 흐름을 참고해 가정용으로 재구성",
        "createdAt": "2026-05-03T00:00:00.000Z"
    },
    {
        "id": "kimchijjim",
        "title": "김치찜",
        "summary": "묵은지와 돼지고기를 푹 익혀 밥과 잘 어울리는 깊은 맛",
        "servings": "4인분",
        "time": "60분",
        "difficulty": "쉬움",
        "image": "/images/kimchijjim.png",
        "ingredients": [
            "묵은지 1/2포기",
            "돼지고기 목살 또는 앞다리살 600g",
            "양파 1개",
            "대파 1대",
            "청양고추 2개",
            "김치국물 1컵",
            "물 또는 육수 3컵",
            "고춧가루 2큰술",
            "설탕 1큰술",
            "다진 마늘 1큰술",
            "맛술 1큰술",
            "참치액 또는 간장 1큰술"
        ],
        "steps": [
            "냄비 바닥에 돼지고기를 깔고 묵은지를 포기째 올린다.",
            "김치국물, 물, 고춧가루, 설탕, 마늘, 맛술, 참치액을 넣는다.",
            "센 불에서 끓어오르면 중약불로 줄여 40분 정도 뭉근하게 끓인다.",
            "양파, 대파, 청양고추를 넣고 10분 더 끓인다.",
            "김치가 부드럽게 찢어지고 고기가 익으면 먹기 좋게 잘라 담는다."
        ],
        "source": "만개의레시피 돼지고기 김치찜 조리 흐름을 참고해 재구성",
        "createdAt": "2026-05-03T00:00:00.000Z"
    },
    {
        "id": "jeyuk-bokkeum",
        "title": "제육볶음",
        "summary": "고추장 양념에 재운 돼지고기를 빠르게 볶은 매콤달콤 반찬",
        "servings": "3-4인분",
        "time": "30분",
        "difficulty": "쉬움",
        "image": "/images/jeyuk-bokkeum.png",
        "ingredients": [
            "돼지 앞다리살 600g",
            "양파 1/2개",
            "대파 1대",
            "당근 약간",
            "청양고추 1개",
            "고추장 2큰술",
            "고춧가루 3큰술",
            "간장 3큰술",
            "맛술 3큰술",
            "설탕 2큰술",
            "물엿 1큰술",
            "다진 마늘 1큰술",
            "후추 약간",
            "참기름 1큰술",
            "통깨 약간"
        ],
        "steps": [
            "돼지고기는 먹기 좋은 크기로 썰고 채소도 비슷한 두께로 준비한다.",
            "고추장, 고춧가루, 간장, 맛술, 설탕, 물엿, 마늘, 후추를 섞어 양념장을 만든다.",
            "고기에 양념장을 버무려 10분 이상 재운다.",
            "달군 팬에 고기를 먼저 볶아 겉면을 익힌다.",
            "양파, 당근, 대파, 고추를 넣고 센 불에서 빠르게 볶는다.",
            "불을 끄고 참기름과 통깨를 뿌려 마무리한다."
        ],
        "source": "만개의레시피 제육볶음 양념 구성을 참고해 재구성",
        "createdAt": "2026-05-03T00:00:00.000Z"
    }
]


def ensure_data_files():
    DATA_DIR.mkdir(exist_ok=True)
    UPLOAD_DIR.mkdir(exist_ok=True)
    if not RECIPE_FILE.exists():
        RECIPE_FILE.write_text(json.dumps(SEED_RECIPES, ensure_ascii=False, indent=2), encoding="utf-8")


def read_recipes():
    ensure_data_files()
    return json.loads(RECIPE_FILE.read_text(encoding="utf-8"))


def write_recipes(recipes):
    ensure_data_files()
    temp_file = RECIPE_FILE.with_suffix(".tmp")
    temp_file.write_text(json.dumps(recipes, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.move(str(temp_file), str(RECIPE_FILE))


def parse_lines(value):
    return [line.strip() for line in re.split(r"[\r\n]+", value or "") if line.strip()]


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get("/")
def index():
    return send_from_directory(PUBLIC_DIR, "index.html")


@app.get("/api/recipes")
def list_recipes():
    query = (request.args.get("q") or "").strip().lower()
    recipes = read_recipes()
    if query:
        recipes = [
            recipe for recipe in recipes
            if query in json.dumps(recipe, ensure_ascii=False).lower()
        ]
    return jsonify(sorted(recipes, key=lambda item: item.get("createdAt", ""), reverse=True))


@app.post("/api/recipes")
def create_recipe():
    title = (request.form.get("title") or "").strip()
    if not title:
        return jsonify({"error": "레시피 이름을 입력해 주세요."}), 400

    image_path = "/images/placeholder.svg"
    upload = request.files.get("photo")
    if upload and upload.filename:
        if not allowed_file(upload.filename):
            return jsonify({"error": "JPG, PNG, WebP 이미지만 업로드할 수 있어요."}), 400
        original_name = secure_filename(upload.filename)
        extension = original_name.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{extension}"
        upload.save(UPLOAD_DIR / filename)
        image_path = f"/uploads/{filename}"

    recipe = {
        "id": uuid.uuid4().hex,
        "title": title,
        "summary": (request.form.get("summary") or "").strip(),
        "servings": (request.form.get("servings") or "알맞게").strip(),
        "time": (request.form.get("time") or "기록 없음").strip(),
        "difficulty": (request.form.get("difficulty") or "보통").strip(),
        "image": image_path,
        "ingredients": parse_lines(request.form.get("ingredients")),
        "steps": parse_lines(request.form.get("steps")),
        "source": "사용자 등록",
        "createdAt": datetime.utcnow().isoformat(timespec="milliseconds") + "Z"
    }

    recipes = read_recipes()
    recipes.append(recipe)
    write_recipes(recipes)
    return jsonify(recipe), 201


@app.get("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


if __name__ == "__main__":
    ensure_data_files()
    app.run(host="0.0.0.0", port=5000)
