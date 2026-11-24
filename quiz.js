/* Strana: koji paket ti treba */
const PACKS = {
  Start: { price: '500€ mesečno', items: ['6–8 objava mesečno (od toga 4 videa)', 'Ideja i scenario', 'Montaža', 'Plan sadržaja za ceo mesec', 'Objava i vođenje profila'] },
  Rast: { price: '800€ mesečno', items: ['6–8 videa mesečno', '6–8 objava mesečno', 'Creative strategist', 'Meta reklame', 'Sve iz paketa Start'] },
  Pro: { price: '1000€ mesečno', items: ['10–12 videa mesečno', '12 objava mesečno + stories', 'Lični creative strategist', 'Nedeljni strateški sastanak', 'Analiza konkurencije svakog meseca', 'Sve iz paketa Rast'] },
};

const form = document.getElementById('quiz');
const result = document.getElementById('quizResult');
const hint = document.getElementById('quizHint');

form.addEventListener('change', () => {
  const data = new FormData(form);
  const videos = data.get('videos');
  const leads = data.get('leads');
  const ai = data.get('ai');
  if (!videos || !leads || !ai) return;

  let name = 'Start';
  if (ai === 'yes' || videos === '12') name = 'Pro';
  else if (leads === 'yes') name = 'Rast';

  const pack = PACKS[name];
  document.getElementById('quizName').textContent = name;
  document.getElementById('quizPrice').textContent = pack.price;
  const list = document.getElementById('quizList');
  list.replaceChildren(...pack.items.map((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
  document.getElementById('quizGo').href = `index.html?paket=${name}#poziv`;
  hint.hidden = true;
  result.hidden = false;
});

document.getElementById('year').textContent = new Date().getFullYear();
