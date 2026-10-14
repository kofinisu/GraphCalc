let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    const cleaned = transcript
      .replace(/\bsquared\b/g,'^2').replace(/\bcubed\b/g,'^3')
      .replace(/\bplus\b/g,'+').replace(/\bminus\b/g,'-')
      .replace(/\btimes\b/g,'*').replace(/\bdivided by\b/g,'/')
      .replace(/\bequals\b/g,'=')
      .replace(/\bsine\b/g,'sin').replace(/\bcosine\b/g,'cos').replace(/\btangent\b/g,'tan')
      .replace(/\bsquare root of\b/g,'sqrt').replace(/\bpi\b/g,'pi');
    const inp = document.querySelector('#exprList input:focus') || document.querySelector('#exprList input');
    if (inp){ inp.value += cleaned; inp.dispatchEvent(new Event('input',{bubbles:true})); }
    if (window.__gc && window.__gc.announce) window.__gc.announce('Heard: '+transcript);
  };
  recognition.onerror = e => console.warn('Speech error', e.error);
  recognition.onend = () => document.getElementById('btnVoice')?.classList.remove('listening');
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnVoice'); if (!btn) return;
  if (!recognition){ btn.style.opacity = '.4'; btn.title = 'Voice input not supported'; return; }
  btn.addEventListener('click', () => {
    if (btn.classList.contains('listening')){ recognition.stop(); btn.classList.remove('listening'); }
    else { recognition.start(); btn.classList.add('listening'); }
  });
});