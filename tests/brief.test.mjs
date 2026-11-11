import test from 'node:test';
import assert from 'node:assert/strict';

let brief;
try { brief = await import('../src/brief.mjs'); } catch { brief = {}; }

test('brief links always address monow and round-trip punctuation safely', () => {
  assert.equal(typeof brief.telegramLink, 'function');
  const message = 'Каталог & CRM? #заказы + оплата';
  const url = new URL(brief.telegramLink(message));
  assert.equal(url.origin, 'https://t.me');
  assert.equal(url.pathname, '/monow_studio');
  assert.equal(url.searchParams.get('text'), message);
});

test('brief accepts only known choices and limits free text', () => {
  assert.equal(typeof brief.makeBrief, 'function');
  const result = brief.makeBrief({ task: 'https://evil.example', features: ['Каталог', '<script>'], systems: 'x'.repeat(900), timing: 'Пока не знаю' });
  assert.ok(!result.includes('evil.example'));
  assert.ok(!result.includes('<script>'));
  assert.ok(result.includes('Каталог'));
  assert.ok(result.length < 1200);
});

test('empty brief is useful without requiring personal information', () => {
  assert.equal(typeof brief.makeBrief, 'function');
  const result = brief.makeBrief({});
  assert.match(result, /Помогите выбрать/);
  assert.doesNotMatch(result, /телефон|почта|имя:/i);
});
