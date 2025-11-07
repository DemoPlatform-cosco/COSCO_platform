(() => {
  const buttons = Array.from(document.querySelectorAll('.nav-btn'));

  // Hover light follows mouse position
  function updateHoverLight(event) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    target.style.setProperty('--mx', `${mx}px`);
    target.style.setProperty('--my', `${my}px`);

    // Subtle 3D tilt based on cursor position
    const px = mx / rect.width - 0.5; // -0.5 ~ 0.5
    const py = my / rect.height - 0.5;
    const rotateX = (-py) * 6; // up/down
    const rotateY = (px) * 8;  // left/right
    target.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-1px)`;
  }

  // Click feedback
  function handleClick(event) {
    const key = event.currentTarget.getAttribute('data-key');
    const label = event.currentTarget.textContent?.trim() || key;
    if (key === 'track') {
      window.location.href = 'track.html';
      return;
    }
    if (key === 'assistant') {
      window.location.href = 'assistant.html';
      return;
    }
    toast(`已选择：${label}`);

    // Ripple effect
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 1.25;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${mx}px`;
    ripple.style.top = `${my}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', updateHoverLight);
    btn.addEventListener('click', handleClick);
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // Panda speech bubble
  const pandaFrame = document.querySelector('.panda-frame');
  const pandaMedia = pandaFrame?.querySelector('.panda');
  if (pandaFrame && pandaMedia) {
    const bubble = document.createElement('div');
    bubble.className = 'panda-bubble';
    bubble.innerHTML = 'Hi, 我是熊猫船长<br/>欢迎来到<br/>中远海运物流供应链智慧中台';
    pandaFrame.appendChild(bubble);

    let hideTimer = null;
    pandaMedia.addEventListener('mouseenter', () => {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      bubble.classList.add('show');
    });
    pandaMedia.addEventListener('mousemove', () => {
      if (!bubble.classList.contains('show')) bubble.classList.add('show');
    });
    pandaMedia.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => bubble.classList.remove('show'), 80);
    });
  }

  // Simple toast
  const toastContainer = document.createElement('div');
  toastContainer.style.position = 'fixed';
  toastContainer.style.left = '50%';
  toastContainer.style.bottom = '36px';
  toastContainer.style.transform = 'translateX(-50%)';
  toastContainer.style.zIndex = '10';
  document.body.appendChild(toastContainer);

  function toast(message) {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.padding = '10px 14px';
    el.style.marginTop = '10px';
    el.style.borderRadius = '10px';
    el.style.color = '#e6f2ff';
    el.style.fontWeight = '600';
    el.style.letterSpacing = '0.3px';
    el.style.border = '1px solid rgba(91,173,255,0.35)';
    el.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))';
    el.style.boxShadow = '0 8px 26px rgba(0, 170, 255, 0.18), inset 0 0 28px rgba(91,173,255,0.12)';
    el.style.backdropFilter = 'blur(6px)';
    el.style.opacity = '0';
    el.style.transition = 'opacity 220ms ease, transform 220ms ease';
    el.style.transform = 'translateY(6px)';
    toastContainer.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 240);
    }, 1500);
  }
})();


