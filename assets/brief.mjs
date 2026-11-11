export const choices = Object.freeze({
  task: ['Продавать товары', 'Записывать клиентов', 'Автоматизировать работу', 'Запустить свой сервис', 'Помогите выбрать'],
  features: ['Каталог', 'Запись', 'Личный кабинет', 'Оплата', 'Уведомления', 'Программа лояльности', 'Другое'],
  timing: ['Есть конкретная дата', 'В ближайшие месяцы', 'Пока изучаю варианты', 'Пока не знаю'],
});

export function makeBrief(input = {}) {
  const task = choices.task.includes(input.task) ? input.task : 'Помогите выбрать';
  const features = Array.isArray(input.features) ? choices.features.filter(value => input.features.includes(value)) : [];
  const systems = typeof input.systems === 'string' ? input.systems.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 600) : '';
  const timing = choices.timing.includes(input.timing) ? input.timing : 'Пока не знаю';
  return ['Здравствуйте, monow! Хочу обсудить продукт в Telegram.', '', `Задача: ${task}`, `Функции: ${features.join(', ') || 'Обсудим вместе'}`, `Системы и контекст: ${systems || 'Уточним при обсуждении'}`, `Запуск: ${timing}`].join('\n');
}

export function telegramLink(message) {
  return `https://t.me/monow_studio?text=${encodeURIComponent(String(message).slice(0, 1800))}`;
}
