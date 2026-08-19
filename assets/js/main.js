/* ==========================================================================
   KOPIKOE SRIUS - MAIN INTERACTION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initFloatingNavbar();
  initShuffleQuiz();
  initEnsiKopidia();
  initScrollReveal(); // <= Penyelamat White Screen
});

/* --------------------------------------------------------------------------
   0. SCROLL REVEAL ANIMATION (Memunculkan Section saat Di-scroll)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   1. HERO AUTOMATIC & MANUAL SLIDE
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  
  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === index) slide.classList.add('active');
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  function startAutoplay() {
    slideInterval = setInterval(nextSlide, 4000);
  }

  function resetAutoplay() {
    clearInterval(slideInterval);
    startAutoplay();
  }

  startAutoplay();
}

/* animasih navbar ilang */
function initFloatingNavbar() {
  const bottomBarWrapper = document.querySelector('.bottom-bar-wrapper');
  const menuToggle = document.getElementById('menuToggle');
  const dropupMenu = document.getElementById('dropupMenu');

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (!bottomBarWrapper) return;
    
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      bottomBarWrapper.classList.add('hide');
      if (dropupMenu) dropupMenu.classList.remove('show');
    } else {
      bottomBarWrapper.classList.remove('hide');
    }
    lastScrollY = window.scrollY;
  });

  if (menuToggle && dropupMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropupMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropupMenu.contains(e.target)) {
        dropupMenu.classList.remove('show');
      }
    });
  }
}

/* kartu kuuis mundur */
function initShuffleQuiz() {
  const quizCards = document.querySelectorAll('.quiz-card');
  const optButtons = document.querySelectorAll('.quiz-opt-btn');
  const resultCard = document.getElementById('quizResult');
  const resultTitle = document.getElementById('resultTitle');

  if (!quizCards.length) return;

  const userAnswers = {};

  optButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentCard = btn.closest('.quiz-card');
      const step = currentCard.dataset.step;
      const answer = btn.dataset.answer;

      userAnswers[step] = answer;

      currentCard.classList.add('shuffle-out');

      setTimeout(() => {
        currentCard.classList.remove('active', 'shuffle-out');

        const nextStepNum = parseInt(step) + 1;
        const nextCard = document.querySelector(`.quiz-card[data-step="${nextStepNum}"]`);

        if (nextCard) {
          nextCard.classList.add('active');
        } else {
          if (resultCard) {
            resultCard.classList.add('active');

            let recName = "KOPIKOK Special Blend";
            if (userAnswers['2'] === 'pahit' || userAnswers['1'] === 'lama') {
              recName = "KOPIMEN Strong Dark";
            } else if (userAnswers['2'] === 'manis') {
              recName = "Ciwidey Honey Light";
            }

            if (resultTitle) resultTitle.textContent = recName;
          }
        }
      }, 300);
    });
  });
}

/*ensikopidia ea */
function initEnsiKopidia() {
  const beanImgs = document.querySelectorAll('.bean-img');
  const titleElem = document.getElementById('ensiBeanTitle');
  const descElem = document.getElementById('ensiBeanDesc');
  const imgElem = document.getElementById('ensiBeanImg');

  if (!beanImgs.length) return;

  beanImgs.forEach(bean => {
    bean.addEventListener('click', () => {
      beanImgs.forEach(b => b.classList.remove('active-bean'));
      bean.classList.add('active-bean');

      const title = bean.getAttribute('data-title');
      const desc = bean.getAttribute('data-desc');
      const imgSrc = bean.getAttribute('data-img');

      const cardText = document.querySelector('.ensi-card-text');
      if (cardText) cardText.style.opacity = '0.3';

      setTimeout(() => {
        if (titleElem) titleElem.textContent = title;
        if (descElem) descElem.textContent = desc;
        if (imgElem && imgSrc) imgElem.src = imgSrc;

        if (cardText) cardText.style.opacity = '1';
      }, 150);
    });
  });
}