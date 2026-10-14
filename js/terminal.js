const termHistory = [];
let termHistIdx = -1;
const TERM_COMMANDS = ['help','plot','solve','factor','expand','simplify','deriv','int','unit','theme','lang','history','3d','gif','present','clear'];

function termPrint(text, cls){
  const body = document.getElementById('termBody'); if (!body) return;
  const line = document.createElement('div');
  line.className = 'termLine' + (cls ? ' '+cls : '');
  line.textContent = text;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}
function termEval(input){
  const gc = window.__gc;
  termPrint('› ' + input);
  termHistory.push(input); termHistIdx = termHistory.length;
  const trimmed = input.trim(); if (!trimmed) return;
  const sp = trimmed.split(/\s+/);
  const cmd = sp[0].toLowerCase(); const arg = sp.slice(1).join(' ');
  try {
    switch (cmd){
      case 'help':
        ['plot EXPR','solve EQ','factor EXPR','expand EXPR','simplify EXPR','deriv EXPR','int EXPR','unit 5 m/s','theme dark|light','lang en|es|fr|de|pt|hi|zh|ja','history','3d','gif','present','clear'].forEach(c => termPrint('  '+c, 'hi'));
        break;
      case 'plot': if (!arg) throw new Error('Need expression'); gc.addExpression(arg); termPrint('Added: '+arg, 'hi'); break;
      case 'solve': { const r = window.casSteps('solve', arg); if (r.error) throw new Error(r.error); r.steps.forEach((s,i)=>termPrint((i+1)+'. '+s.title+': '+s.body)); if (r.result?.length) termPrint('Solutions: '+r.result.map(v=>gc.fmt(v,8)).join(', '), 'hi'); break; }
      case 'factor': { const r = window.casSteps('factor', arg); if (r.error) throw new Error(r.error); r.steps.forEach((s,i)=>termPrint((i+1)+'. '+s.body)); termPrint('→ '+r.result, 'hi'); break; }
      case 'expand': if (!window.algebriteReady) throw new Error('Algebrite not loaded'); termPrint('→ '+Algebrite.expand(arg).toString(), 'hi'); break;
      case 'simplify': if (!window.algebriteReady) throw new Error('Algebrite not loaded'); termPrint('→ '+Algebrite.simplify(arg).toString(), 'hi'); break;
      case 'deriv': if (window.algebriteReady){ termPrint('→ '+Algebrite.derivative(arg,'x').toString(), 'hi'); } else { const ast = gc.parseExpression(gc.tokenize(arg)); termPrint('→ '+gc.astToString(gc.simplify(gc.symbolize(ast,'x'))), 'hi'); } break;
      case 'int': if (!window.algebriteReady) throw new Error('Algebrite required'); termPrint('→ '+Algebrite.integral(arg,'x').toString()+' + C', 'hi'); break;
      case 'unit': { const q = window.parseQuantityInput(arg); if (!q) throw new Error('Bad quantity'); termPrint('SI: '+q.si.toPrecision(8)); termPrint('Dim: '+window.dimStr(q.dim)); termPrint('Display: '+q.toString(), 'hi'); break; }
      case 'theme': { const s = gc.getSettings(); s.theme = arg||'dark'; gc.applySettings(); gc.saveSettings(); termPrint('Theme: '+s.theme, 'hi'); break; }
      case 'lang': if (window.applyLanguage){ window.applyLanguage(arg); termPrint('Language: '+arg, 'hi'); } else throw new Error('Unknown language'); break;
      case 'history': termHistory.forEach(h=>termPrint('  '+h)); break;
      case '3d': document.querySelector('nav.tabs button[data-tab="threeD"]').click(); break;
      case 'gif': if (window.startGifRecording) startGifRecording(); break;
      case 'present': if (window.openPresentation) openPresentation(); break;
      case 'clear': document.getElementById('termBody').innerHTML=''; break;
      default:
        try { const v = gc.evaluate(gc.parseExpression(gc.tokenize(trimmed)), gc.getScope()); termPrint('→ '+gc.fmt(v,10), 'hi'); }
        catch(e){ throw new Error('Unknown command: '+cmd); }
    }
  } catch(e){ termPrint('✗ '+e.message, 'err'); }
}
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('termInput'); if (!inp) return;
  termPrint('GraphCalc Terminal — type "help" to see commands.', 'hi');
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter'){ const v = e.target.value; e.target.value=''; termEval(v); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); if (termHistIdx > 0){ termHistIdx--; e.target.value = termHistory[termHistIdx]; } }
    else if (e.key === 'ArrowDown'){ e.preventDefault(); if (termHistIdx < termHistory.length-1){ termHistIdx++; e.target.value = termHistory[termHistIdx]; } else { termHistIdx = termHistory.length; e.target.value=''; } }
    else if (e.key === 'Tab'){ e.preventDefault(); const m = TERM_COMMANDS.filter(c=>c.startsWith(e.target.value)); if (m.length===1) e.target.value = m[0]+' '; else if (m.length>1) termPrint(m.join('  '), 'warn'); }
  });
  document.querySelector('nav.tabs button[data-tab="terminal"]').addEventListener('click', () => setTimeout(()=>inp.focus(), 50));
});
Object.assign(window, { termEval, termPrint });