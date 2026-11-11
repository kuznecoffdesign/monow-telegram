import { makeBrief, telegramLink } from './brief.mjs?v=62ba8959db12';

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  document.body.classList.remove('menu-open');
}
menuButton?.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  document.body.classList.toggle('menu-open', opening);
});
document.addEventListener('keydown', event => {
  if (menu.hidden) return;
  if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
  if (event.key === 'Tab') {
    const links = [...menu.querySelectorAll('a')];
    if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuButton.focus(); }
    if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); links.at(-1).focus(); }
  }
});
menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const form = document.querySelector('#project-brief');
if (form) {
  const preview = document.querySelector('#brief-preview');
  const send = document.querySelector('#brief-send');
  const status = document.querySelector('#copy-status');
  let message = '';
  const update = () => {
    const data = new FormData(form);
    message = makeBrief({ task: data.get('task'), features: data.getAll('features'), systems: data.get('systems'), timing: data.get('timing') });
    preview.textContent = message;
    send.href = telegramLink(message);
    status.textContent = '';
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', event => event.preventDefault());
  document.querySelector('#brief-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Текст скопирован. Можно вставить в чат @monow_studio.';
    } catch {
      status.textContent = 'Не удалось скопировать автоматически. Выделите текст брифа выше и скопируйте его вручную.';
    }
  });
  update();
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
document.querySelectorAll('[data-demo]').forEach(scene => {
  const order = scene.querySelector('[data-demo-action]');
  const reset = scene.querySelector('[data-demo-reset]');
  const success = scene.querySelector('.demo-success');
  const message = scene.querySelector('[data-demo-message]');
  scene.querySelector('[data-demo-open]').addEventListener('click', () => {
    order.focus({ preventScroll: true });
    if (gsap && !reducedMotion.matches) gsap.fromTo(scene.querySelector('.mini-window'), { y: 0 }, { y: -9, duration: .3, yoyo: true, repeat: 1, overwrite: 'auto' });
  });
  order.addEventListener('click', () => {
    success.hidden = false;
    order.disabled = true;
    reset.focus({ preventScroll: true });
    message.textContent = 'Демо-заказ получен. Уже собираем! Никакие данные не отправлены.';
    if (gsap && !reducedMotion.matches) {
      gsap.fromTo(success, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .35 });
      gsap.to(message, { opacity: 1, duration: .35 });
    } else message.style.opacity = '1';
  });
  reset.addEventListener('click', () => {
    success.hidden = true;
    order.disabled = false;
    message.textContent = 'Ваш заказ уже собирается. Подробности — в приложении.';
    message.style.opacity = '.45';
    order.focus({ preventScroll: true });
  });
});

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanup = [];
    gsap.from('[data-hero]', { y: 25, opacity: 0, duration: .85, ease: 'power3.out', clearProps: 'all' });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      gsap.from(element, { y: 24, opacity: .2, duration: .75, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    });
    document.querySelectorAll('.format-card').forEach(card => {
      const icon = card.querySelector('.format-icon');
      const enter = () => gsap.to(icon, { y: -7, rotation: 0, duration: .5, ease: 'power3.out', overwrite: 'auto' });
      const leave = () => gsap.to(icon, { y: 0, rotation: card.classList.contains('bot-card') ? 7 : -8, duration: .5, ease: 'power3.out', overwrite: 'auto' });
      card.addEventListener('pointerenter', enter);
      card.addEventListener('pointerleave', leave);
      card.addEventListener('focus', enter);
      card.addEventListener('blur', leave);
      cleanup.push(() => {
        card.removeEventListener('pointerenter', enter);
        card.removeEventListener('pointerleave', leave);
        card.removeEventListener('focus', enter);
        card.removeEventListener('blur', leave);
      });
    });
    const scene = document.querySelector('.product-scene');
    if (scene) {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
      timeline.from('.bot-window', { y: 35, rotation: -12, opacity: 0 }, .1)
        .from('.mini-window', { y: 45, rotation: 13, opacity: 0 }, .2)
        .from('.signal-chip', { y: 15, opacity: 0 }, .65);
      gsap.to('.scene-orbit', { rotation: 35, scale: 1.05, ease: 'none', scrollTrigger: { trigger: scene, start: 'top 70%', end: 'bottom top', scrub: 1 } });
    }
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => cleanup.forEach(remove => remove());
  });
}
