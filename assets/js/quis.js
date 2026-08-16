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

      // Simpan jawaban user berdasarkan kategori pertanyaan
      userAnswers[category] = answer;

      // Animasi Kartu Keluar
      const currentCard = document.querySelector(`.quiz-card[data-step="${currentStep}"]`);
      if (currentCard) {
        currentCard.classList.remove('active');
        currentCard.classList.add('shuffle-out');
      }

      // Lanjut ke Step Berikutnya
      currentStep++;

      if (currentStep <= totalSteps) {
        const nextCard = document.querySelector(`.quiz-card[data-step="${currentStep}"]`);
        if (nextCard) {
          setTimeout(() => {
            nextCard.classList.add('active');
          }, 150);
        }
      } else {
        // Jika kuis selesai (step 4 tercapai)
        setTimeout(() => {
          const resultSection = document.getElementById('resultSection');
          if (resultSection) {
            showQuizResultPage(); // Proses hasil di quis.html
            
            // RESET KARTU KUIS KE STEP 1 AGAR SECTION DI BAWAH TIDAK HILANG / BISA TES ULANG
            currentStep = 1;
            const allCards = document.querySelectorAll('.quiz-card');
            allCards.forEach(card => card.classList.remove('shuffle-out'));
            const firstCard = document.querySelector('.quiz-card[data-step="1"]');
            if (firstCard) firstCard.classList.add('active');
          } else {
            // Jika kuis dikerjakan di index.html, simpan jawaban ke localStorage lalu lempar ke quis.html
            localStorage.setItem('userQuizAnswers', JSON.stringify(userAnswers));
            window.location.href = 'quis.html';
          }
        }, 300);
      }
    });
  });

  // Jika halaman dibuka langsung di quis.html
  const resultSection = document.getElementById('resultSection');
  if (resultSection) {
    const savedAnswers = localStorage.getItem('userQuizAnswers');
    if (savedAnswers) {
      userAnswers = JSON.parse(savedAnswers);
    }
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

      // --- ALGORITMA PENCOCOKAN DINAMIS BERDASARKAN JAWABAN ---
      let bestMatch = products[0];
      let highestScore = -1;

      products.forEach((product, index) => {
        let score = 60; // Skor dasar

        if (userAnswers.experience === 'pemula' && product.specs && product.specs.roast && product.specs.roast.toLowerCase().includes('light')) {
          score += 25;
        } else if (userAnswers.experience === 'expert' && product.specs && product.specs.roast && product.specs.roast.toLowerCase().includes('dark')) {
          score += 25;
        } else if (userAnswers.experience === 'penikmat') {
          score += 15;
        }

        if (userAnswers.acidity === 'low' && product.specs && product.specs.jenis && product.specs.jenis.toLowerCase().includes('robusta')) {
          score += 20;
        } else if (userAnswers.acidity === 'high' && product.specs && product.specs.roast && product.specs.roast.toLowerCase().includes('light')) {
          score += 20;
        } else if (userAnswers.acidity === 'medium') {
          score += 15;
        }

        if (userAnswers.body === 'full' && product.specs && product.specs.jenis && product.specs.jenis.toLowerCase().includes('robusta')) {
          score += 15;
        } else if (userAnswers.body === 'medium') {
          score += 10;
        }

        let finalScore = score + (index * 2); 
        
        if (finalScore > highestScore) {
          highestScore = finalScore;
          bestMatch = product;
        }
      });

      if (Object.keys(userAnswers).length === 0) {
        bestMatch = products[Math.floor(Math.random() * products.length)];
      }

      const calculatedMatch = 82 + (Math.abs(bestMatch.name.length * 3) % 17);

      // Update UI Hasil Kuis di quis.html
      if (coffeeTitle) coffeeTitle.textContent = bestMatch.name;
      if (coffeeSub) coffeeSub.textContent = bestMatch.tagline || bestMatch.eyebrow || "Rekomendasi Spesial Untukmu";
      if (coffeeImg && bestMatch.images && bestMatch.images.length > 0) {
        coffeeImg.src = bestMatch.images[0];
      }
      if (matchPercent) matchPercent.textContent = `${calculatedMatch}%`;
      if (buyBtn) buyBtn.href = `deskripsi-produk.html?id=${bestMatch.id}`;

      updateFlavorBars(calculatedMatch);

      const resultSection = document.getElementById('resultSection');
      if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    })
    .catch(err => console.error("Gagal memuat hasil kuis dari JSON:", err));
}

function updateFlavorBars(match) {
  const fillSweet = document.getElementById('fillSweet');
  const fillBody = document.getElementById('fillBody');
  const fillSpicy = document.getElementById('fillSpicy');
  
  const valSweet = document.getElementById('valSweet');
  const valBody = document.getElementById('valBody');
  const valSpicy = document.getElementById('valSpicy');

  let sVal = Math.min(Math.max(match - 8, 60), 95);
  let bVal = Math.min(Math.max(match - 3, 65), 98);
  let aVal = Math.min(Math.max(match - 15, 50), 90);

  if (fillSweet) fillSweet.style.width = `${sVal}%`;
  if (fillBody) fillBody.style.width = `${bVal}%`;
  if (fillSpicy) fillSpicy.style.width = `${aVal}%`;

  if (valSweet) valSweet.textContent = `${sVal}%`;
  if (valBody) valBody.textContent = `${bVal}%`;
  if (valSpicy) valSpicy.textContent = `${aVal}%`;
}

// Fungsi Reset Kuis Global
window.resetQuiz = function() {
  userAnswers = {};
  localStorage.removeItem('userQuizAnswers');
  currentStep = 1;

  const allCards = document.querySelectorAll('.quiz-card');
  allCards.forEach(card => {
    card.classList.remove('active', 'shuffle-out');
  });

  const firstCard = document.querySelector('.quiz-card[data-step="1"]');
  if (firstCard) firstCard.classList.add('active');
};