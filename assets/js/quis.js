let userAnswers = {};
let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', () => {
  initQuiz();
});

function getJsonPathQuiz() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

function initQuiz() {
  const quizButtons = document.querySelectorAll('.quiz-opt-btn');
  if (quizButtons.length === 0) return;
  
  quizButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const category = button.getAttribute('data-category');
      const answer = button.getAttribute('data-answer');

      userAnswers[category] = answer;

      const currentCard = document.querySelector(`.quiz-card[data-step="${currentStep}"]`);
      if (currentCard) {
        currentCard.classList.remove('active');
        currentCard.classList.add('shuffle-out');
      }

      currentStep++;

      if (currentStep <= totalSteps) {
        const nextCard = document.querySelector(`.quiz-card[data-step="${currentStep}"]`);
        if (nextCard) {
          setTimeout(() => {
            nextCard.classList.add('active');
          }, 150);
        }
      } else {
        // Karena kuis ada di page awal (index.html), langsung tampilkan hasil di tempat
        setTimeout(() => {
          showQuizResultPage(); 
        }, 300);
      }
    });
  });

  // Cek jika ada hasil tersimpan saat halaman dimuat ulang
  const resultSection = document.getElementById('resultSection');
  if (resultSection && Object.keys(userAnswers).length > 0) {
    showQuizResultPage();
  }
}

function showQuizResultPage() {
  const coffeeTitle = document.getElementById('coffeeTitle');
  const coffeeSub = document.getElementById('coffeeSub');
  const coffeeImg = document.getElementById('coffeeImg');
  const matchPercent = document.getElementById('matchPercent');
  const buyBtn = document.getElementById('buyBtn');

  fetch(getJsonPathQuiz())
    .then(res => res.json())
    .then(products => {
      if (!products || products.length === 0) return;

      let bestMatch = products[0];
      let highestFinalScore = -1;

      const attributes = [
        'bold', 'sweet', 'fruity', 'floral', 'earthy', 
        'body', 'familiar', 'adventure', 'highland', 
        'volcanic', 'tropical', 'eastern'
      ];

      const answerWeights = {
        step1: {
          rutinitas: { familiar: 5, sweet: 3, bold: 3, body: 3, earthy: 3, adventure: 1, fruity: 1, floral: 1, highland: 2, volcanic: 2, tropical: 1, eastern: 1 },
          quality:   { sweet: 4, floral: 4, fruity: 3, familiar: 3, body: 3, adventure: 2, bold: 1, earthy: 1, highland: 3, volcanic: 1, tropical: 2, eastern: 2 },
          produktif: { bold: 5, body: 5, earthy: 5, familiar: 4, volcanic: 4, highland: 2, sweet: 1, fruity: 0, floral: 0, adventure: 1, tropical: 1, eastern: 1 },
          penasaran: { adventure: 5, fruity: 5, floral: 4, tropical: 5, eastern: 5, earthy: 2, bold: 2, sweet: 2, body: 2, familiar: 1, highland: 2, volcanic: 2 }
        },
        step2: {
          pekat:  { bold: 5, earthy: 5, body: 5, volcanic: 5, familiar: 4, sweet: 1, fruity: 0, floral: 0, adventure: 1, highland: 2, tropical: 1, eastern: 1 },
          manis:  { sweet: 5, body: 4, familiar: 4, adventure: 2, bold: 2, fruity: 2, floral: 2, earthy: 2, highland: 3, volcanic: 2, tropical: 2, eastern: 2 },
          wangi:  { floral: 5, fruity: 5, sweet: 3, adventure: 3, highland: 4, tropical: 3, eastern: 3, familiar: 2, bold: 1, earthy: 1, body: 2, volcanic: 1 },
          liar:   { adventure: 5, earthy: 4, tropical: 5, eastern: 5, fruity: 4, bold: 3, floral: 3, volcanic: 3, body: 3, sweet: 2, familiar: 1, highland: 2 }
        },
        step3: {
          aman:    { familiar: 5, sweet: 3, body: 3, bold: 3, highland: 3, volcanic: 3, adventure: 1, fruity: 1, floral: 1, earthy: 3, tropical: 1, eastern: 1 },
          nyaman:  { sweet: 4, familiar: 3, body: 3, floral: 3, fruity: 3, earthy: 2, adventure: 3, bold: 2, highland: 3, volcanic: 2, tropical: 2, eastern: 2 },
          sabi:    { adventure: 4, fruity: 4, floral: 3, sweet: 3, body: 3, tropical: 3, eastern: 3, highland: 3, familiar: 2, bold: 2, earthy: 2, volcanic: 2 },
          gabiasa: { adventure: 5, fruity: 5, floral: 5, tropical: 5, eastern: 5, earthy: 4, bold: 2, sweet: 2, body: 3, familiar: 1, highland: 3, volcanic: 3 }
        },
        step4: {
          lembah: { highland: 5, body: 4, sweet: 3, familiar: 3, earthy: 3, floral: 2, bold: 2, adventure: 2, fruity: 1, volcanic: 2, tropical: 1, eastern: 1 },
          gurun:  { volcanic: 5, bold: 4, earthy: 4, body: 4, familiar: 3, sweet: 2, adventure: 2, highland: 2, fruity: 1, floral: 1, tropical: 1, eastern: 1 },
          tropis: { tropical: 5, fruity: 4, floral: 3, sweet: 3, adventure: 3, body: 3, earthy: 2, highland: 2, volcanic: 2, familiar: 2, bold: 1, eastern: 3 },
          timur:  { eastern: 5, tropical: 4, adventure: 4, fruity: 3, floral: 3, earthy: 3, body: 3, sweet: 3, bold: 2, highland: 2, volcanic: 2, familiar: 2 }
        }
      };

      function calculateQuestionMatch(stepKey, productProfile) {
        let chosenAnswer = userAnswers[stepKey];
        if (!chosenAnswer || !answerWeights[stepKey][chosenAnswer]) return 50;

        let selectedWeights = answerWeights[stepKey][chosenAnswer];
        let totalAttributeMatch = 0;

        attributes.forEach(attr => {
          let userVal = selectedWeights[attr] || 2;
          let coffeeVal = productProfile[attr] || 0;
          let matchAttr = 5 - Math.abs(userVal - coffeeVal);
          totalAttributeMatch += matchAttr;
        });

        let averageMatch = totalAttributeMatch / attributes.length;
        return (averageMatch / 5) * 100;
      }

      products.forEach((product) => {
        const qp = product.quizProfile;
        if (!qp) return;

        let q1Match = calculateQuestionMatch('step1', qp);
        let q2Match = calculateQuestionMatch('step2', qp);
        let q3Match = calculateQuestionMatch('step3', qp);
        let q4Match = calculateQuestionMatch('step4', qp);

        let finalScore = (q1Match * 0.20) + (q2Match * 0.35) + (q3Match * 0.25) + (q4Match * 0.20);

        if (product.id === 'kopi-07' && userAnswers.step4 === 'tropis' && userAnswers.step3 === 'gabiasa') {
          finalScore += 5;
        }
        if (product.id === 'kopi-08' && userAnswers.step4 === 'gurun' && userAnswers.step3 === 'sabi') {
          finalScore += 5;
        }

        if (finalScore > highestFinalScore) {
          highestFinalScore = finalScore;
          bestMatch = product;
        }
      });

      if (Object.keys(userAnswers).length === 0) {
        bestMatch = products[Math.floor(Math.random() * products.length)];
        highestFinalScore = 88;
      }

      const calculatedMatch = Math.round(highestFinalScore);

      if (coffeeTitle) coffeeTitle.textContent = bestMatch.name; 
      if (coffeeSub) coffeeSub.textContent = bestMatch.quizProfile.personality + " | " + bestMatch.tagline;
      if (coffeeImg && bestMatch.images && bestMatch.images.length > 0) {
        coffeeImg.src = bestMatch.images[0];
      }
      if (matchPercent) matchPercent.textContent = `${calculatedMatch}%`;
      if (buyBtn) buyBtn.href = `deskripsi-produk.html?id=${bestMatch.id}`;

      updateFlavorBars(bestMatch.quizProfile);

      const resultSection = document.getElementById('resultSection');
      if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    })
    .catch(err => console.error("Gagal memuat hasil kuis dari JSON:", err));
}

function updateFlavorBars(profile) {
  const fillSweet = document.getElementById('fillSweet');
  const fillBody = document.getElementById('fillBody');
  const fillSpicy = document.getElementById('fillSpicy');
  
  const valSweet = document.getElementById('valSweet');
  const valBody = document.getElementById('valBody');
  const valSpicy = document.getElementById('valSpicy');

  let sPercent = (profile.sweet / 5) * 100;
  let bPercent = (profile.body / 5) * 100;
  let maxAroma = Math.max(profile.earthy, profile.floral, profile.fruity);
  let aPercent = (maxAroma / 5) * 100;

  if (fillSweet) fillSweet.style.width = `${sPercent}%`;
  if (fillBody) fillBody.style.width = `${bPercent}%`;
  if (fillSpicy) fillSpicy.style.width = `${aPercent}%`;

  if (valSweet) valSweet.textContent = `${sPercent}%`;
  if (valBody) valBody.textContent = `${bPercent}%`;
  if (valSpicy) valSpicy.textContent = `${aPercent}%`;
}

window.resetQuiz = function() {
  userAnswers = {};
  currentStep = 1;

  // Sembunyikan hasil kuis kembali jika ada
  const resultSection = document.getElementById('resultSection');
  if (resultSection) {
    resultSection.style.display = 'none';
  }

  const allCards = document.querySelectorAll('.quiz-card');
  allCards.forEach(card => {
    card.classList.remove('active', 'shuffle-out');
  });

  const firstCard = document.querySelector('.quiz-card[data-step="1"]');
  if (firstCard) {
    firstCard.classList.add('active');
    firstCard.scrollIntoView({ behavior: 'smooth' });
  }
};