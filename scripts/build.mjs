import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { services, solutions, articles } from '../src/content.mjs';
import { layout, home, servicePage, solutionsPage, projectPage, aboutPage, briefPage, journalPage, articlePage, privacyPage, anomalyCard, contact, breadcrumb, base, origin, url } from '../src/templates.mjs';

const root = new URL('../', import.meta.url);
const pages = [
  { path: '', title: 'Разработка Telegram Mini Apps и ботов под ключ — monow', description: 'monow — студия разработки Telegram Mini Apps и ботов для бизнеса. Дизайн, серверная часть, интеграции и запуск. Обсудим задачу и оценим проект.', render: home },
  ...services.map(item => ({ path: `services/${item.slug}`, ...item, render: () => servicePage(item) })),
  { path: 'solutions', title: 'Решения для бизнеса в Telegram: Mini Apps и боты — monow', description: 'Магазины, запись, личные кабинеты и программы лояльности в Telegram. Выбираем формат под задачу бизнеса и разрабатываем продукт под ключ.', render: solutionsPage },
  ...solutions.map(item => ({ path: `solutions/${item.slug}`, ...item, render: () => servicePage(item, true) })),
  { path: 'projects', title: 'Проекты Telegram Mini Apps и ботов — monow', description: 'Работа студии monow: Anomaly — реальный Telegram Mini App и бот, разработанные полным циклом от дизайна до серверной части.', render: () => `<div class="wrap projects-index">${breadcrumb('Проекты')}<section class="page-hero"><span class="eyebrow">ДИЗАЙН И РАЗРАБОТКА В ДЕЛЕ</span><h1 data-hero>Продукты,<br><span class="muted">за которыми мы стоим.</span></h1><p class="page-intro">Реальный проект полного цикла. Показываем подтверждённый состав работ и даём ссылку на продукт.</p></section>${anomalyCard()}</div>${contact()}` },
  { path: 'projects/anomaly', title: 'Anomaly: разработка Mini App и Telegram-бота — кейс monow', description: 'Аномалия — платформа, академия и партнёрская программа в Telegram. Полный цикл monow: дизайн, Mini App, бот и серверная часть.', render: projectPage },
  { path: 'about', title: 'О студии monow — дизайн и разработка Telegram-продуктов', description: 'monow — независимая студия стратегии, дизайна и разработки. Создаём Telegram Mini Apps и ботов для специалистов, команд и бизнеса.', render: aboutPage },
  { path: 'brief', title: 'Обсудить разработку Mini App или бота — monow', description: 'Соберите задачу за четыре коротких шага и продолжите разговор с monow в Telegram. Без имени, телефона, почты и регистрации.', render: briefPage },
  { path: 'journal', title: 'О разработке Mini Apps и Telegram-ботов — материалы monow', description: 'Как выбрать между ботом и Mini App, от чего зависит стоимость и с чего начать разработку. Материалы monow для бизнеса.', render: journalPage },
  ...articles.map(article => ({ path: `journal/${article.slug}`, title: `${article.name} — monow`, description: article.description, article: true, render: () => articlePage(article) })),
  { path: 'privacy', title: 'Данные и конфиденциальность — monow', description: 'Как работает бриф monow, где обрабатываются ответы и что происходит при переходе в Telegram. Прозрачно о данных и сторонних сервисах.', render: privacyPage },
];

await mkdir(new URL('assets/vendor/', root), { recursive: true });
for (const file of ['style.css', 'app.mjs', 'brief.mjs']) await copyFile(new URL(`src/${file}`, root), new URL(`assets/${file}`, root));
for (const file of ['gsap.min.js', 'ScrollTrigger.min.js']) await copyFile(new URL(`node_modules/gsap/dist/${file}`, root), new URL(`assets/vendor/${file}`, root));
await writeFile(new URL('assets/vendor/GSAP-LICENSE.txt', root), 'GSAP 3.15.1. Copyright GreenSock. License: https://gsap.com/standard-license/\n');
await writeFile(new URL('assets/favicon.svg', root), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#021c8b"/><path d="m18 70 14-40h7l11 34 11-34h7l14 40h-8L65 42 55 70H45L35 42 26 70Z" fill="white"/></svg>');
await writeFile(new URL('assets/social.svg', root), '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#090b16"/><circle cx="1060" cy="480" r="300" fill="#152974"/><text x="65" y="110" fill="#f0f1fa" font-size="45" font-family="Arial">monow</text><text x="65" y="290" fill="#f0f1fa" font-size="80" font-family="Arial">Telegram Mini Apps</text><text x="65" y="390" fill="#a2afff" font-size="80" font-family="Arial">и боты для бизнеса.</text><text x="65" y="555" fill="#9397ad" font-size="24" font-family="Arial">СТРАТЕГИЯ / ДИЗАЙН / РАЗРАБОТКА</text></svg>');

const generated = [];
for (const page of pages) {
  const canonical = `${origin}${url(page.path)}`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': `${origin}${base}/#studio`, name: 'monow', url: `${origin}${base}/`, sameAs: ['https://t.me/monow_studio', 'https://sites.monow.studio/'] },
    { '@type': page.article ? 'Article' : 'WebPage', '@id': canonical, url: canonical, name: page.title, ...(page.article ? { headline: page.title.replace(/ — monow$/, ''), author: { '@id': `${origin}${base}/#studio` }, datePublished: '2026-11-11', inLanguage: 'ru' } : { description: page.description, inLanguage: 'ru' }) },
    ...(page.path ? [{ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: `${origin}${url()}` }, { '@type': 'ListItem', position: 2, name: page.title.replace(/ — .*$/, ''), item: canonical }] }] : []),
  ] };
  const schemaText = JSON.stringify(schema).replace(/</g, '\\u003c');
  const hash = createHash('sha256').update(schemaText).digest('base64');
  const csp = `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests`;
  const content = layout(page, page.render(), schemaText, csp);
  const relative = page.path ? `${page.path}/index.html` : 'index.html';
  await mkdir(new URL(page.path ? `${page.path}/` : './', root), { recursive: true });
  await writeFile(new URL(relative, root), content);
  generated.push(relative);
}

const errorPage = { path: '404', title: 'Страница не найдена — monow', description: 'Этой страницы нет. Вернитесь на главную monow или обсудите проект в Telegram.' };
await writeFile(new URL('404.html', root), layout(errorPage, `<section class="not-found wrap"><span class="eyebrow">404 / НЕ ТУДА ПОВЕРНУЛИ</span><h1>Здесь пока<br>ничего нет.</h1><p>Вернёмся к тому, что работает.</p><a class="button" href="${url()}">На главную ↗</a></section>`, '{}', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"));
await writeFile(new URL('robots.txt', root), 'User-agent: *\nDisallow: /monow-telegram/\n');
await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p => !['brief', 'privacy'].includes(p.path)).map(p => `<url><loc>${origin}${url(p.path)}</loc></url>`).join('')}</urlset>\n`);
await writeFile(new URL('.nojekyll', root), '');
await writeFile(new URL('assets/pages.json', root), JSON.stringify(generated));
console.log(`Built ${pages.length} pages for develop preview. Search indexing is disabled until production approval.`);
