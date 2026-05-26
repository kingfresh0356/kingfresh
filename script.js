document.addEventListener('DOMContentLoaded', function () {
  const heroCard = document.querySelector('.hero-card');
  if (heroCard) {
    heroCard.classList.add('animate-fade-in');
  }

  const animatedItems = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-zoom-in');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedItems.forEach(item => {
    observer.observe(item);
  });
});
