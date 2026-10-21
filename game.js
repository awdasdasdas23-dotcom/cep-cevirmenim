
(() => {
  // ==========================================
  // 1. ÇOK DİLLİ YAZI ÇEVİRİSİ
  // ==========================================

  const sourceLanguage = document.getElementById("sourceLanguage");
  const targetLanguage = document.getElementById("targetLanguage");
  const englishText = document.getElementById("englishText");
  const translatedText = document.getElementById("translatedText");
  const translateTextButton = document.getElementById("translateTextButton");

  async function translateText(text, from, to) {
    if (from === to) return text;

    const url =
      "https://translate.googleapis.com/translate_a/single" +
      "?client=gtx&sl=" + encodeURIComponent(from) +
      "&tl=" + encodeURIComponent(to) +
      "&dt=t&q=" + encodeURIComponent(text);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Çeviri servisine ulaşılamadı.");
    }

    const data = await response.json();

    if (!data[0]) {
      throw new Error("Çeviri sonucu alınamadı.");
    }

    return data[0].map(part => part[0] || "").join("");
  }

  translateTextButton.addEventListener("click", async () => {
    const text = englishText.value.trim();

    if (!text) {
      translatedText.textContent = "Önce çevirmek istediğin yazıyı gir!";
      return;
    }

    translateTextButton.disabled = true;
    translatedText.textContent = "Çevriliyor...";

    try {
      translatedText.textContent = await translateText(
        text,
        sourceLanguage.value,
        targetLanguage.value
      );
    } catch (error) {
      translatedText.textContent =
        "Çeviri başarısız oldu. İnternet bağlantını kontrol edip tekrar dene.";
    } finally {
      translateTextButton.disabled = false;
    }
  });

  // ==========================================
  // 2. FOTOĞRAFTAN YAZI OKUMA VE ÇEVİRİ
  // ==========================================

  const photoInput = document.getElementById("photoInput");
  const translateButton = document.getElementById("translateButton");
  const photoStatus = document.getElementById("photoStatus");

  // Tesseract dil kodları
  const ocrLanguages = {
    en: "eng",
    tr: "tur",
    de: "deu",
    fr: "fra",
    es: "spa",
    it: "ita",
    ru: "rus",
    ar: "ara",
    ja: "jpn",
    ko: "kor"
  };

  let tesseractPromise = null;

  function loadTesseract() {
    if (window.Tesseract) {
      return Promise.resolve(window.Tesseract);
    }

    if (tesseractPromise) return tesseractPromise;

    tesseractPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

      script.onload = () => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
        } else {
          tesseractPromise = null;
          reject(new Error("OCR aracı yüklenemedi."));
        }
      };

      script.onerror = () => {
        tesseractPromise = null;
        reject(new Error("OCR aracı indirilemedi."));
      };

      document.head.appendChild(script);
    });

    return tesseractPromise;
  }

  translateButton.addEventListener("click", async () => {
    const file = photoInput.files[0];

    if (!file) {
      photoStatus.textContent = "Önce dosyalarından fotoğraf seç!";
      return;
    }

    if (!file.type.startsWith("image/")) {
      photoStatus.textContent = "Lütfen bir fotoğraf seç.";
      return;
    }

    const source = sourceLanguage.value;
    const target = targetLanguage.value;

    translateButton.disabled = true;

    try {
      photoStatus.textContent =
        "Fotoğraf okuma aracı yükleniyor. İlk seferinde biraz sürebilir...";

      const Tesseract = await loadTesseract();
      const ocrLanguage = ocrLanguages[source];

      photoStatus.textContent =
        "Fotoğraf okunuyor. Dil dosyası indiriliyor olabilir...";

      const result = await Tesseract.recognize(file, ocrLanguage, {
        logger: message => {
          if (message.status === "recognizing text") {
            const percent = Math.round((message.progress || 0) * 100);
            photoStatus.textContent = "Fotoğraf okunuyor: %" + percent;
          } else if (message.status === "loading language traineddata") {
            photoStatus.textContent = "Fotoğrafın dil dosyası yükleniyor...";
          }
        }
      });

      const recognizedText = result.data.text.trim();

      if (!recognizedText) {
        photoStatus.textContent =
          "Yazı okunamadı. Daha net, aydınlık bir fotoğraf dene.";
        return;
      }

      photoStatus.textContent = "Okunan yazı çevriliyor...";

      const translation = await translateText(
        recognizedText,
        source,
        target
      );

      translatedText.textContent =
        "📖 OKUNAN YAZI:\n" + recognizedText +
        "\n\n🌍 ÇEVİRİ:\n" + translation;

      photoStatus.textContent = "Fotoğraf okundu ve çevrildi!";

    } catch (error) {
      photoStatus.textContent =
        "İşlem yapılamadı. İnterneti kontrol et. Dil dosyası indirilemiyorsa tekrar dene.";
    } finally {
      translateButton.disabled = false;
    }
  });

  // ==========================================
  // 3. KELİME OYUNU - 160 KELİMELİK HAVUZ
  // ==========================================

  // İngilizce kelime ve Türkçe karşılığı
  const vocabulary = [
    ["abandon", "terk etmek"],
    ["ability", "yetenek"],
    ["able", "yapabilen"],
    ["absent", "yok"],
    ["accept", "kabul etmek"],
    ["achieve", "başarmak"],
    ["across", "karşıya"],
    ["admire", "hayran olmak"],
    ["adventure", "macera"],
    ["advice", "tavsiye"],
    ["afford", "gücü yetmek"],
    ["ancient", "antik"],
    ["announce", "duyurmak"],
    ["anxious", "endişeli"],
    ["appear", "görünmek"],
    ["approach", "yaklaşmak"],
    ["argue", "tartışmak"],
    ["arrange", "düzenlemek"],
    ["arrive", "varmak"],
    ["avoid", "kaçınmak"],
    ["behavior", "davranış"],
    ["believe", "inanmak"],
    ["borrow", "ödünç almak"],
    ["brave", "cesur"],
    ["brief", "kısa"],
    ["calm", "sakin"],
    ["careful", "dikkatli"],
    ["cause", "sebep"],
    ["celebrate", "kutlamak"],
    ["certain", "kesin"],
    ["challenge", "meydan okuma"],
    ["choice", "seçim"],
    ["clever", "zeki"],
    ["collect", "toplamak"],
    ["compare", "karşılaştırmak"],
    ["complain", "şikâyet etmek"],
    ["complete", "tamamlamak"],
    ["confident", "kendine güvenen"],
    ["confuse", "kafasını karıştırmak"],
    ["connect", "bağlamak"],
    ["consider", "düşünmek"],
    ["contain", "içermek"],
    ["continue", "devam etmek"],
    ["convenient", "kullanışlı"],
    ["courage", "cesaret"],
    ["create", "oluşturmak"],
    ["curious", "meraklı"],
    ["dangerous", "tehlikeli"],
    ["decide", "karar vermek"],
    ["decrease", "azalmak"],
    ["deliver", "teslim etmek"],
    ["depend", "bağlı olmak"],
    ["describe", "tanımlamak"],
    ["deserve", "hak etmek"],
    ["destroy", "yok etmek"],
    ["develop", "geliştirmek"],
    ["discover", "keşfetmek"],
    ["disease", "hastalık"],
    ["distance", "mesafe"],
    ["divide", "bölmek"],
    ["eager", "hevesli"],
    ["effort", "çaba"],
    ["elderly", "yaşlı"],
    ["encourage", "cesaretlendirmek"],
    ["enemy", "düşman"],
    ["enormous", "kocaman"],
    ["environment", "çevre"],
    ["equal", "eşit"],
    ["escape", "kaçmak"],
    ["essential", "gerekli"],
    ["eventually", "sonunda"],
    ["evidence", "kanıt"],
    ["examine", "incelemek"],
    ["excellent", "mükemmel"],
    ["exist", "var olmak"],
    ["expand", "genişletmek"],
    ["expect", "beklemek"],
    ["experience", "deneyim"],
    ["explain", "açıklamak"],
    ["familiar", "tanıdık"],
    ["famous", "ünlü"],
    ["fear", "korku"],
    ["feature", "özellik"],
    ["foreign", "yabancı"],
    ["forgive", "affetmek"],
    ["freedom", "özgürlük"],
    ["frequent", "sık"],
    ["gather", "toplamak"],
    ["generous", "cömert"],
    ["gentle", "nazik"],
    ["genuine", "gerçek"],
    ["goal", "hedef"],
    ["grateful", "minnettar"],
    ["habit", "alışkanlık"],
    ["harmful", "zararlı"],
    ["hesitate", "tereddüt etmek"],
    ["honest", "dürüst"],
    ["however", "ancak"],
    ["imagine", "hayal etmek"],
    ["improve", "iyileştirmek"],
    ["include", "dahil etmek"],
    ["increase", "artmak"],
    ["independent", "bağımsız"],
    ["influence", "etkilemek"],
    ["inform", "bilgilendirmek"],
    ["instead", "yerine"],
    ["intelligent", "zeki"],
    ["interrupt", "sözünü kesmek"],
    ["invent", "icat etmek"],
    ["journey", "yolculuk"],
    ["knowledge", "bilgi"],
    ["lack", "eksiklik"],
    ["likely", "muhtemel"],
    ["lonely", "yalnız"],
    ["maintain", "sürdürmek"],
    ["manage", "yönetmek"],
    ["mature", "olgun"],
    ["mention", "bahsetmek"],
    ["necessary", "gerekli"],
    ["notice", "fark etmek"],
    ["obvious", "açık"],
    ["opportunity", "fırsat"],
    ["ordinary", "sıradan"],
    ["patient", "sabırlı"],
    ["perform", "gerçekleştirmek"],
    ["perhaps", "belki"],
    ["persuade", "ikna etmek"],
    ["polite", "kibar"],
    ["prevent", "önlemek"],
    ["protect", "korumak"],
    ["provide", "sağlamak"],
    ["purpose", "amaç"],
    ["realize", "farkına varmak"],
    ["receive", "almak"],
    ["recognize", "tanımak"],
    ["reduce", "azaltmak"],
    ["refuse", "reddetmek"],
    ["reliable", "güvenilir"],
    ["remain", "kalmak"],
    ["remind", "hatırlatmak"],
    ["remove", "kaldırmak"],
    ["require", "gerektirmek"],
    ["research", "araştırma"],
    ["respect", "saygı"],
    ["responsible", "sorumlu"],
    ["reveal", "ortaya çıkarmak"],
    ["reward", "ödül"],
    ["risk", "risk"],
    ["rough", "pürüzlü"],
    ["schedule", "program"],
    ["search", "aramak"],
    ["several", "birkaç"],
    ["similar", "benzer"],
    ["solution", "çözüm"],
    ["specific", "belirli"],
    ["strength", "güç"],
    ["struggle", "mücadele etmek"],
    ["succeed", "başarmak"],
    ["suggest", "önermek"],
    ["support", "desteklemek"],
    ["survive", "hayatta kalmak"],
    ["valuable", "değerli"],
    ["various", "çeşitli"],
    ["warn", "uyarmak"],
    ["wealthy", "zengin"],
    ["wonder", "merak etmek"],
    ["worry", "endişelenmek"]
  ];

  const quizStart = document.getElementById("quizStart");
  const quizArea = document.getElementById("quizArea");
  const quizEnd = document.getElementById("quizEnd");
  const startGameButton = document.getElementById("startGameButton");
  const restartGameButton = document.getElementById("restartGameButton");
  const questionNumber = document.getElementById("questionNumber");
  const questionWord = document.getElementById("questionWord");
  const answerOptions = document.getElementById("answerOptions");
  const feedback = document.getElementById("feedback");
  const nextQuestionButton = document.getElementById("nextQuestionButton");
  const finalScore = document.getElementById("finalScore");

  let questions = [];
  let questionIndex = 0;
  let score = 0;
  let answered = false;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startGame() {
    questions = shuffle([...vocabulary]).slice(0, 20);
    questionIndex = 0;
    score = 0;
    answered = false;

    quizStart.hidden = true;
    quizEnd.hidden = true;
    quizArea.hidden = false;

    showQuestion();
  }

  function showQuestion() {
    answered = false;

    const current = questions[questionIndex];

    questionNumber.textContent =
      "Soru " + (questionIndex + 1) + " / 20 · Puan: " + score;

    questionWord.textContent = current[0];
    feedback.textContent = "";
    answerOptions.replaceChildren();
    nextQuestionButton.hidden = true;

    // Doğru cevaptan farklı, mümkün olduğunca benzersiz seçenekler
    const wrongAnswers = shuffle(
      vocabulary.filter(item =>
        item[0] !== current[0] &&
        item[1] !== current[1]
      )
    );

    const choices = shuffle([
      { text: current[1], correct: true },
      ...wrongAnswers.slice(0, 3).map(item => ({
        text: item[1],
        correct: false
      }))
    ]);

    choices.forEach(choice => {
      const button = document.createElement("button");
      button.textContent = choice.text;

      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;

        const buttons = answerOptions.querySelectorAll("button");

        buttons.forEach(option => {
          option.disabled = true;

          if (option.textContent === current[1]) {
            option.classList.add("correct");
          }
        });

        if (choice.correct) {
          score += 10;
          feedback.textContent = "✅ Doğru cevap! +10 puan";
        } else {
          button.classList.add("wrong");
          feedback.textContent =
            "❌ Yanlış! Doğru cevap: " + current[1];
        }

        questionNumber.textContent =
          "Soru " + (questionIndex + 1) + " / 20 · Puan: " + score;

        nextQuestionButton.textContent =
          questionIndex === 19 ? "Sonucu Gör 🏆" : "Sonraki Soru ➜";

        nextQuestionButton.hidden = false;
      });

      answerOptions.appendChild(button);
    });
  }

  function nextQuestion() {
    if (!answered) return;

    questionIndex++;

    if (questionIndex >= 20) {
      quizArea.hidden = true;
      quizEnd.hidden = false;

      let message = "Bir sonraki oyunda tekrar dene!";

      if (score === 200) {
        message = "MÜKEMMEL! Bütün soruları doğru bildin! 🏆";
      } else if (score >= 150) {
        message = "Harika sonuç! 🌟";
      } else if (score >= 100) {
        message = "Güzel iş! Böyle devam et! 💪";
      }

      finalScore.textContent =
        "Puanın: " + score + " / 200. " + message;

      return;
    }

    showQuestion();
  }

  startGameButton.addEventListener("click", startGame);
  restartGameButton.addEventListener("click", startGame);
  nextQuestionButton.addEventListener("click", nextQuestion);
})();
