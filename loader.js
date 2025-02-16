
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
  
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 500);
      }, 2000);
    });