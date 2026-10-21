
(() => {
  const translatorTab = document.getElementById("translatorTab");
  const gameTab = document.getElementById("gameTab");
  const translatorSection = document.getElementById("translatorSection");
  const gameSection = document.getElementById("gameSection");

  // Çeviri ve oyun ekranları arasında geçiş
  translatorTab.addEventListener("click", () => {
    translatorSection.hidden = false;
    gameSection.hidden = true;
  });

  gameTab.addEventListener("click", () => {
    translatorSection.hidden = true;
    gameSection.hidden = false;
  });

  // Dilleri değiştir
  const sourceLanguage = document.getElementById("sourceLanguage");
  const targetLanguage = document.getElementById("targetLanguage");
  const swapLanguages = document.getElementById("swapLanguages");

  swapLanguages.addEventListener("click", () => {
    const oldSource = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = oldSource;
  });

  // Fotoğrafı seç ve ön izlemesini göster
  const photoInput = document.getElementById("photoInput");
  const photoPreview = document.getElementById("photoPreview");
  const photoStatus = document.getElementById("photoStatus");

  let previousPhotoUrl = null;

  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];

    if (previousPhotoUrl) {
      URL.revokeObjectURL(previousPhotoUrl);
      previousPhotoUrl = null;
    }

    if (!file) {
      photoPreview.hidden = true;
      photoPreview.removeAttribute("src");
      photoStatus.textContent = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      photoInput.value = "";
      photoPreview.hidden = true;
      photoPreview.removeAttribute("src");
      photoStatus.textContent = "Lütfen bir fotoğraf dosyası seç.";
      return;
    }

    previousPhotoUrl = URL.createObjectURL(file);
    photoPreview.src = previousPhotoUrl;
    photoPreview.hidden = false;
    photoStatus.textContent =
      "Fotoğraf hazır! Oku ve Çevir düğmesine bas.";
  });
})();
