const recipesEl = document.querySelector("#recipes");
const searchInput = document.querySelector("#search-input");
const form = document.querySelector("#recipe-form");
const formMessage = document.querySelector("#form-message");
const photoInput = document.querySelector("#photo-input");
const photoPreview = document.querySelector("#photo-preview");
const photoName = document.querySelector("#photo-name");
const dialog = document.querySelector("#recipe-dialog");
const dialogClose = document.querySelector("#dialog-close");

let recipes = [];

const STATIC_RECIPES = [
  {
    id: "galbijjim",
    title: "갈비찜",
    summary: "달큰한 간장 양념에 부드럽게 조린 명절 느낌의 소갈비찜",
    servings: "4인분",
    time: "90분",
    difficulty: "보통",
    image: "images/galbijjim.png",
    ingredients: ["소갈비 1kg", "무 200g", "당근 1/2개", "표고버섯 4개", "밤 8개", "대파 1대", "간장 1/2컵", "배 1/2개", "양파 1/2개", "설탕 2큰술", "맛술 3큰술", "다진 마늘 2큰술", "참기름 1큰술", "후추 약간"],
    steps: ["갈비는 찬물에 1시간 정도 담가 핏물을 빼고 깨끗하게 헹군다.", "끓는 물에 갈비를 5분 데친 뒤 다시 헹궈 불순물을 제거한다.", "배, 양파, 간장, 설탕, 맛술, 마늘, 후추를 갈아 양념장을 만든다.", "냄비에 갈비와 양념, 물 2컵을 넣고 중약불에서 40분 끓인다.", "무, 당근, 버섯, 밤을 넣고 25분 더 조린다.", "대파와 참기름을 넣고 윤기가 돌 때까지 살짝 더 졸여 마무리한다."],
    source: "정적 페이지 기본 레시피"
  },
  {
    id: "kimchijjim",
    title: "김치찜",
    summary: "묵은지와 돼지고기를 푹 익혀 밥과 잘 어울리는 깊은 맛",
    servings: "4인분",
    time: "60분",
    difficulty: "쉬움",
    image: "images/kimchijjim.png",
    ingredients: ["묵은지 1/2포기", "돼지고기 목살 또는 앞다리살 600g", "양파 1개", "대파 1대", "청양고추 2개", "김치국물 1컵", "물 또는 육수 3컵", "고춧가루 2큰술", "설탕 1큰술", "다진 마늘 1큰술", "맛술 1큰술", "참치액 또는 간장 1큰술"],
    steps: ["냄비 바닥에 돼지고기를 깔고 묵은지를 포기째 올린다.", "김치국물, 물, 고춧가루, 설탕, 마늘, 맛술, 참치액을 넣는다.", "센 불에서 끓어오르면 중약불로 줄여 40분 정도 뭉근하게 끓인다.", "양파, 대파, 청양고추를 넣고 10분 더 끓인다.", "김치가 부드럽게 찢어지고 고기가 익으면 먹기 좋게 잘라 담는다."],
    source: "정적 페이지 기본 레시피"
  },
  {
    id: "jeyuk-bokkeum",
    title: "제육볶음",
    summary: "고추장 양념에 재운 돼지고기를 빠르게 볶은 매콤달콤 반찬",
    servings: "3-4인분",
    time: "30분",
    difficulty: "쉬움",
    image: "images/jeyuk-bokkeum.png",
    ingredients: ["돼지 앞다리살 600g", "양파 1/2개", "대파 1대", "당근 약간", "청양고추 1개", "고추장 2큰술", "고춧가루 3큰술", "간장 3큰술", "맛술 3큰술", "설탕 2큰술", "물엿 1큰술", "다진 마늘 1큰술", "후추 약간", "참기름 1큰술", "통깨 약간"],
    steps: ["돼지고기는 먹기 좋은 크기로 썰고 채소도 비슷한 두께로 준비한다.", "고추장, 고춧가루, 간장, 맛술, 설탕, 물엿, 마늘, 후추를 섞어 양념장을 만든다.", "고기에 양념장을 버무려 10분 이상 재운다.", "달군 팬에 고기를 먼저 볶아 겉면을 익힌다.", "양파, 당근, 대파, 고추를 넣고 센 불에서 빠르게 볶는다.", "불을 끄고 참기름과 통깨를 뿌려 마무리한다."],
    source: "정적 페이지 기본 레시피"
  }
];

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);

function recipeMeta(recipe) {
  return [recipe.servings, recipe.time, recipe.difficulty].filter(Boolean);
}

function renderRecipes(items) {
  if (!items.length) {
    recipesEl.innerHTML = '<div class="empty-state">찾는 레시피가 아직 없어요. 새 레시피를 몽글하게 추가해 주세요.</div>';
    return;
  }

  recipesEl.innerHTML = items.map((recipe) => `
    <article class="recipe-card" tabindex="0" role="button" data-id="${recipe.id}" aria-label="${escapeHtml(recipe.title)} 상세 보기">
      <img src="${recipe.image}" alt="${escapeHtml(recipe.title)} 사진">
      <div class="recipe-card-content">
        <p class="pill-line">
          ${recipeMeta(recipe).map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}
        </p>
        <h3>${escapeHtml(recipe.title)}</h3>
        <p>${escapeHtml(recipe.summary || "맛있는 기록이 기다리고 있어요.")}</p>
      </div>
    </article>
  `).join("");
}

async function loadRecipes() {
  const query = searchInput.value.trim();
  try {
    const response = await fetch(`api/recipes${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    if (!response.ok) throw new Error("API unavailable");
    recipes = await response.json();
  } catch {
    const storedRecipes = JSON.parse(localStorage.getItem("mongle-recipes") || "[]");
    const allRecipes = [...storedRecipes, ...STATIC_RECIPES];
    const normalizedQuery = query.toLowerCase();
    recipes = normalizedQuery
      ? allRecipes.filter((recipe) => JSON.stringify(recipe).toLowerCase().includes(normalizedQuery))
      : allRecipes;
  }
  renderRecipes(recipes);
}

function openRecipe(recipe) {
  document.querySelector("#dialog-image").src = recipe.image;
  document.querySelector("#dialog-image").alt = `${recipe.title} 사진`;
  document.querySelector("#dialog-title").textContent = recipe.title;
  document.querySelector("#dialog-summary").textContent = recipe.summary || "";
  document.querySelector("#dialog-meta").innerHTML = recipeMeta(recipe)
    .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
    .join("");
  document.querySelector("#dialog-ingredients").innerHTML = (recipe.ingredients || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  document.querySelector("#dialog-steps").innerHTML = (recipe.steps || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  document.querySelector("#dialog-source").textContent = recipe.source ? `참고: ${recipe.source}` : "";
  dialog.showModal();
}

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadRecipes, 180);
});

recipesEl.addEventListener("click", (event) => {
  const card = event.target.closest(".recipe-card");
  if (!card) return;
  const recipe = recipes.find((item) => item.id === card.dataset.id);
  if (recipe) openRecipe(recipe);
});

recipesEl.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".recipe-card");
  if (!card) return;
  event.preventDefault();
  const recipe = recipes.find((item) => item.id === card.dataset.id);
  if (recipe) openRecipe(recipe);
});

dialogClose.addEventListener("click", () => dialog.close());

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) {
    photoPreview.src = "images/placeholder.svg";
    photoName.textContent = "사진을 선택해 주세요";
    return;
  }
  photoPreview.src = URL.createObjectURL(file);
  photoName.textContent = file.name;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "저장 중이에요...";

  try {
    const response = await fetch("api/recipes", {
      method: "POST",
      body: new FormData(form)
    });
    const result = await response.json();
    if (!response.ok) {
      formMessage.textContent = result.error || "저장하지 못했어요.";
      return;
    }
  } catch {
    const data = new FormData(form);
    const file = photoInput.files[0];
    const image = file ? await fileToDataUrl(file) : "images/placeholder.svg";
    const savedRecipes = JSON.parse(localStorage.getItem("mongle-recipes") || "[]");
    savedRecipes.unshift({
      id: crypto.randomUUID(),
      title: data.get("title"),
      summary: data.get("summary"),
      servings: data.get("servings") || "알맞게",
      time: data.get("time") || "기록 없음",
      difficulty: data.get("difficulty") || "보통",
      image,
      ingredients: parseTextarea(data.get("ingredients")),
      steps: parseTextarea(data.get("steps")),
      source: "이 브라우저에 저장됨"
    });
    localStorage.setItem("mongle-recipes", JSON.stringify(savedRecipes));
  }

  form.reset();
  photoPreview.src = "images/placeholder.svg";
  photoName.textContent = "사진을 선택해 주세요";
  formMessage.textContent = "레시피가 저장됐어요.";
  searchInput.value = "";
  await loadRecipes();
});

function parseTextarea(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

loadRecipes();
