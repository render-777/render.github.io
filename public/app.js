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
  const response = await fetch(`/api/recipes${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  recipes = await response.json();
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
    photoPreview.src = "/images/placeholder.svg";
    photoName.textContent = "사진을 선택해 주세요";
    return;
  }
  photoPreview.src = URL.createObjectURL(file);
  photoName.textContent = file.name;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "저장 중이에요...";

  const response = await fetch("/api/recipes", {
    method: "POST",
    body: new FormData(form)
  });

  const result = await response.json();
  if (!response.ok) {
    formMessage.textContent = result.error || "저장하지 못했어요.";
    return;
  }

  form.reset();
  photoPreview.src = "/images/placeholder.svg";
  photoName.textContent = "사진을 선택해 주세요";
  formMessage.textContent = "레시피가 저장됐어요.";
  searchInput.value = "";
  await loadRecipes();
});

loadRecipes();
