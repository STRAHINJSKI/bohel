/* Strana: koji paket ti treba */
const PACKS = {
  Start: { price: '400€ mesečno', items: ['8 videa mesečno', 'Ideja i scenario', 'Montaža', 'Objava i profil'] },
  Rast: { price: '700€ mesečno', items: ['12 videa mesečno', 'Sve iz paketa Start', 'Lead sistem i praćenje', 'Automatski DM'] },
  Pro: { price: '900€ mesečno', items: ['12 videa mesečno', 'Sve iz paketa Rast', 'AI odgovori na DM', 'AI odgovori na komentare'] },
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
  if (ai === 'yes') name = 'Pro';
  else if (leads === 'yes' || videos === '12') name = 'Rast';

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
