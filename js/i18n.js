const I18N = {
  en:{ graph:'Graphing',sci:'Scientific',algebra:'Algebra',advanced:'Advanced',practice:'Practice',notebook:'Notebook',terminal:'Terminal',chem:'Chemistry','3d':'3D',examples:'Examples',notes:'Notes' },
  es:{ graph:'Graficar',sci:'Científica',algebra:'Álgebra',advanced:'Avanzado',practice:'Práctica',notebook:'Cuaderno',terminal:'Terminal',chem:'Química','3d':'3D',examples:'Ejemplos',notes:'Notas' },
  fr:{ graph:'Graphique',sci:'Scientifique',algebra:'Algèbre',advanced:'Avancé',practice:'Pratique',notebook:'Carnet',terminal:'Terminal',chem:'Chimie','3d':'3D',examples:'Exemples',notes:'Notes' },
  de:{ graph:'Grafik',sci:'Wissenschaftlich',algebra:'Algebra',advanced:'Erweitert',practice:'Übung',notebook:'Notizbuch',terminal:'Terminal',chem:'Chemie','3d':'3D',examples:'Beispiele',notes:'Notizen' },
  pt:{ graph:'Gráficos',sci:'Científica',algebra:'Álgebra',advanced:'Avançado',practice:'Prática',notebook:'Caderno',terminal:'Terminal',chem:'Química','3d':'3D',examples:'Exemplos',notes:'Notas' },
  hi:{ graph:'ग्राफ',sci:'वैज्ञानिक',algebra:'बीजगणित',advanced:'उन्नत',practice:'अभ्यास',notebook:'नोटबुक',terminal:'टर्मिनल',chem:'रसायन','3d':'3D',examples:'उदाहरण',notes:'नोट्स' },
  zh:{ graph:'图形',sci:'科学',algebra:'代数',advanced:'高级',practice:'练习',notebook:'笔记本',terminal:'终端',chem:'化学','3d':'3D',examples:'示例',notes:'笔记' },
  ja:{ graph:'グラフ',sci:'関数電卓',algebra:'代数',advanced:'高度',practice:'練習',notebook:'ノートブック',terminal:'ターミナル',chem:'化学','3d':'3D',examples:'例',notes:'ノート' }
};
let currentLang = 'en';
try { const s = localStorage.getItem('graphcalc_lang'); if (s && I18N[s]) currentLang = s; } catch(e){}
window.t = k => (I18N[currentLang] && I18N[currentLang][k]) || I18N.en[k] || k;

function applyLanguage(lang){
  if (!I18N[lang]) return;
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang);
  const map = {}; for (const k of ['graph','sci','algebra','advanced','practice','notebook','terminal','chem','threeD','examples','notes']) map[k] = t(k);
  document.querySelectorAll('nav.tabs button').forEach(b => { if (map[b.dataset.tab]) b.textContent = map[b.dataset.tab]; });
  try { localStorage.setItem('graphcalc_lang', lang); } catch(e){}
}
window.applyLanguage = applyLanguage;

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('langSelect');
  if (sel){ sel.value = currentLang; sel.addEventListener('change', e => applyLanguage(e.target.value)); }
  applyLanguage(currentLang);
});