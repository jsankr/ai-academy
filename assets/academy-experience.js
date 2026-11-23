/* AI Adventure Academy – Milo mentor + progress studio. Zero external APIs or tracking. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const prefersStill=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const existing=Array.isArray(window.done)?window.done:undefined;
let activeName="Welcome";
const advice={
"token":"A token is a small piece of text a language model processes. A word can be one token or several. Think of building a sentence from LEGO pieces. Try asking: 'Explain tokenization using chocolate bars.'",
"gpu":"A GPU is built for lots of calculations at once. Imagine 100 chefs chopping vegetables together rather than one chef chopping everything in turn. It helps speed the math used by AI models.",
"weight":"Weights are learned numbers inside a neural network. They're not little folders full of facts. Imagine adjusting thousands of tiny volume knobs during training.",
"parameter":"A parameter is a numerical setting learned during training. Many parameters together determine how the model behaves. Most weights are parameters.",
"llm":"LLM stands for Large Language Model. It processes tokens and predicts likely next tokens to generate a response. It can sound confident even when it's wrong.",
"chatgpt":"ChatGPT is an assistant application that can use models and, when available, tools. The trained model generates language; a web tool can retrieve fresh evidence. Always check important claims.",
"claude":"Claude is another AI assistant. Compare models using the same clear prompt, then score completeness, correctness and sources. Neither should be trusted without verification.",
"prompt":"Use this recipe: Goal + Context + Constraints + Output format + Verification. Example: 'Explain AI to a 10-year-old, use an animal analogy, and ask me one quiz question.'",
"image":"Start with subject, background, lighting, viewpoint, style and aspect ratio. Compare three original versions. Ask before using anyone's photo, especially a child's.",
"video":"A good video begins with a short script, storyboard, shots, review, voiceover and captions. Check continuity; generative video can alter objects and physics.",
"voice":"For a voiceover, write a short clear script, choose a licensed voice, check names and pronunciation, and add accurate captions. Don't clone a real person's voice without permission.",
"slide":"Use one clear idea per slide, strong headings, evidence and legible type. Try a five-slide presentation about how AI helps your day.",
"finance":"Use synthetic numbers first. Ask for categories, assumptions and calculations; check totals with a calculator. Don't allow autonomous transfers or trading.",
"trading":"AI can help explain market concepts and backtests, but it cannot promise profits. Include fees, historical bias and risk; never give an agent unsupervised trading authority.",
"manufactur":"Try turning a fictional defects log into a Pareto table and inspect whether the counts match. AI can summarize, but shop-floor decisions require quality assurance.",
"agent":"A real agent combines a goal with tool use, feedback and sometimes repeated steps. Start with a manual trigger, sample input, read-only tool and human approval before writes.",
"autom":"Automation follows predefined steps. Agents may choose actions dynamically. Both need permissions and error handling. A copied prompt is not a scheduled autonomous agent.",
"vibe":"Vibe coding means describing software in everyday language and iterating with an AI coding helper. Still test the code, accessibility, security and the deployed site.",
"github":"To share a static site, place index.html and assets in a GitHub repository and deploy with GitHub Pages. Never put private API keys in browser source.",
"publish":"Static sites work on GitHub Pages; private APIs need a secure backend. Test in a private browser window, mobile layout and keyboard navigation.",
"security":"Protect secrets, validate inputs, treat retrieved text as untrusted, require approval for changes and test failures. OWASP reviews reduce risk but cannot guarantee zero vulnerabilities.",
"quiz":"Visit Quiz Quest below. Pick one answer per question, read the feedback, and retry. A wrong answer is an excellent discovery!",
"progress":"Mark a week complete after doing its experiment. The progress dashboard updates instantly. Your record stays in this browser, and you can export it.",
"kid":"Try this: invent three robot pets with different features. Sort them into groups, then explain one mistake your rule could make. Use age-appropriate tools with an adult.",
"help":"I'm Milo! Ask about tokens, GPU, LLM, prompts, images, video, agents, finance, vibe coding, publishing, quiz, security, or progress. I use built-in lesson guidance, not a live AI model."
};
const starters=["What is an LLM?","Explain tokens","How do agents work?","What should I learn next?"];
function getDone(){try{const x=JSON.parse(localStorage.getItem('academy-done')||'[]');return Array.isArray(x)?[...new Set(x.filter(v=>Number.isInteger(v)&&v>=0&&v<12))]:[]}catch{return []}}
function getQuizScore(){const el=$('quiz-score');const s=el?el.textContent.match(/(\d+)\s*\/\s*(\d+)/):null;return s?{correct:Number(s[1]),total:Number(s[2])}:{correct:0,total:6}}
function weekLabel(i){const data=typeof DATA!=='undefined'?DATA:window.DATA;return data?.weeks?.[i]?.[0]||'your next lesson'}
function nextStep(){const done=getDone(),next=Array.from({length:12},(_,i)=>i).find(i=>!done.includes(i));return next===undefined?"You finished every week! Try an agent lab, redo the quiz, or improve your final project. Amazing work!":"Your next mission is Week "+(next+1)+": "+weekLabel(next)+". Open that week's card, complete the experiment and mark it done. I'll cheer you on!"}
let coach,dialog,messages,utterance,shown=false,hopCount=0,closedByUser=false,quiet=localStorage.getItem('academy-milo-quiet')==='1';
function speak(msg,who="milo"){if(!messages)return;const n=make('div','mentor-msg'+(who==='user'?' user':''),msg);messages.append(n);messages.scrollTop=messages.scrollHeight}
function reply(question){const raw=String(question||"").trim();if(!raw)return;const q=raw.toLowerCase();if(q.length>500)return "That's a big question! Try a shorter one about a specific lesson.";
if(/what.*next|next.*learn|next.*week|where.*start/.test(q))return nextStep();
if(/how.*(doing|far|complete|finished)|my progress|progress report/.test(q)){const n=getDone().length;return "You've completed "+n+" of 12 weeks ("+Math.round(n/12*100)+"%). "+nextStep()}
if(/question.*(week|lesson)|this.*week|current.*lesson/.test(q)){return "We're exploring "+activeName+". "+nextStep()}
const hits=Object.keys(advice).filter(k=>q.includes(k));if(hits.length)return advice[hits[0]];
if(/hello|hi\b|hey|monkey|milo/.test(q))return "Hi! I'm Milo 🐵. Great to see you! "+nextStep();
if(/example|exercise|challenge|practice/.test(q))return "Try a mini mission: explain "+activeName+" in one funny analogy, test it with a made-up example, then check one claim against a trusted source.";
return "Great question! I have offline guidance for our course topics, but I can't safely invent a detailed answer to that one. Open the relevant lesson or copy its tutor prompt into ChatGPT/Claude for a fuller discussion, then verify the response.";
}
function ask(question){if(!question)return;speak(question,'user');speak(reply(question))}
function setQuiet(v){quiet=!!v;try{localStorage.setItem('academy-milo-quiet',quiet?'1':'0')}catch{};if(coach)coach.style.display=quiet?'none':'';if(quiet&&dialog)dialog.hidden=true}
function openDialog(){dialog.hidden=false;shown=true;closedByUser=false;if(!messages.childElementCount)speak("Hey explorer! I'm Milo, your curious monkey guide. Ask me about a lesson or let me suggest your next mission.");$('milo-question').focus();document.dispatchEvent(new Event('milo:opened'))}
function closeDialog(){dialog.hidden=true;shown=false;closedByUser=true;coach.querySelector('button').focus()}
function createDashboard(){const section=make('section','mentor-dashboard');section.id='learning-studio';section.setAttribute('aria-label','My learning progress dashboard');
const top=make('div','mentor-header'),left=make('div');left.append(make('span','tag','MISSION CONTROL · LIVE PROGRESS'),make('h2','','Your learning cockpit'),make('p','mentor-sub','Track your journey, revisit weak spots and earn momentum as you explore.'));
const go=make('a','btn primary','Continue learning →');go.href='#weeks';top.append(left,go);section.append(top);
const metrics=make('div','mentor-metrics');[
['milo-weeks','0 / 12','Weeks completed'],['milo-rate','0%','Course progress'],['milo-quiz','0 / 6','Quiz score'],['milo-level','Explorer','Learning rank']
].forEach(([id,v,label])=>{const c=make('div','mentor-metric'),strong=make('strong','',v);strong.id=id;c.append(strong,make('span','',label));metrics.append(c)});section.append(metrics);
const meter=make('div','mentor-meter'),fill=make('div');fill.id='milo-fill';meter.append(fill);section.append(meter);
const note=make('p','mentor-sub',''),road=make('div','mentor-road');note.id='milo-next';road.id='milo-road';road.setAttribute('aria-label','Completion status by week');section.append(note,road);
const hero=document.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',section);
refreshDashboard();
}
function refreshDashboard(){if(!$('milo-weeks'))return;const done=getDone(),n=done.length,q=getQuizScore(),pct=Math.round(n/12*100);$('milo-weeks').textContent=n+' / 12';$('milo-rate').textContent=pct+'%';$('milo-quiz').textContent=q.correct+' / '+q.total;$('milo-level').textContent=n>=12?'Trailblazer':n>=9?'Architect':n>=6?'Builder':n>=3?'Explorer+':'Explorer';$('milo-fill').style.width=pct+'%';$('milo-next').textContent=nextStep();const road=$('milo-road');road.replaceChildren();const next=Array.from({length:12},(_,i)=>i).find(i=>!done.includes(i));for(let i=0;i<12;i++){const item=make('div','mentor-road-dot'+(done.includes(i)?' is-done':'')+(i===next?' is-now':''),done.includes(i)?'✓':String(i+1));item.title='Week '+(i+1)+(done.includes(i)?': complete':': incomplete');road.append(item)}}
function createMilo(){coach=make('div','mentor-coach');coach.id='milo-coach';const img=make('img');img.src='assets/milo-monkey.svg';img.alt='Milo, the friendly monkey learning guide';img.width=104;img.height=130;const launch=make('button','mentor-launcher');launch.type='button';launch.setAttribute('aria-label','Talk to Milo the learning guide');launch.title='Ask Milo for help';launch.addEventListener('click',openDialog);const bubble=make('div','mentor-speech','Ask Milo! 🐵');bubble.id='milo-bubble';coach.append(img,launch,bubble);document.body.append(coach);
dialog=make('section','mentor-dialog');dialog.id='milo-dialog';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label','Milo learning guide');
const head=make('div','mentor-dialog-head'),avatar=make('img');avatar.src='assets/milo-monkey.svg';avatar.alt='';const heading=make('div');heading.append(make('strong','','Milo · Learning Buddy'),make('small','','Course-aware offline guide'));const close=make('button','mentor-close','×');close.type='button';close.setAttribute('aria-label','Close Milo guide');close.addEventListener('click',closeDialog);head.append(avatar,heading,close);
messages=make('div','mentor-messages');messages.id='milo-messages';messages.setAttribute('aria-live','polite');
const suggestions=make('div','mentor-suggestions');starters.forEach(s=>{const b=make('button','mentor-quick',s);b.type='button';b.addEventListener('click',()=>ask(s));suggestions.append(b)});
const form=make('form','mentor-form'),input=make('input');input.id='milo-question';input.name='question';input.placeholder='Ask about AI, agents, progress…';input.setAttribute('aria-label','Your question for Milo');input.maxLength=500;const send=make('button','','Ask');send.type='submit';form.addEventListener('submit',ev=>{ev.preventDefault();const v=input.value.trim();if(v){ask(v);input.value=''}});form.append(input,send);
const info=make('div','mentor-info','Milo answers from built-in lessons, not a connected LLM. No questions leave this browser.');
const controls=make('div','mentor-suggestions');const still=make('button','mentor-quick','Pause mascot movement');still.type='button';still.addEventListener('click',()=>{setQuiet(true);const restore=$('milo-restore');if(restore)restore.hidden=false});controls.append(still);
dialog.append(head,messages,suggestions,form,info,controls);document.body.append(dialog);
const restore=make('button','btn','Show Milo 🐵');restore.id='milo-restore';restore.type='button';restore.hidden=!quiet;restore.style.cssText='position:fixed;z-index:58;left:12px;bottom:12px;font-size:12px;padding:8px 10px';restore.addEventListener('click',()=>{setQuiet(false);restore.hidden=true;openDialog()});document.body.append(restore);
if(quiet)coach.style.display='none';
}
const targets=['paths','schedule','weeks','mechanics','agents','toolbox','glossary','quiz','final'];
function positionCoach(){if(!coach||quiet)return;const edge=window.innerWidth<650?13:23;const maxX=Math.max(edge,window.innerWidth-coach.offsetWidth-edge);const minY=85,maxY=Math.max(minY,window.innerHeight-coach.offsetHeight-16);const x=Math.min(maxX,Math.max(edge,window.innerWidth-(coach.offsetWidth+edge)));const y=Math.min(maxY,Math.max(minY,window.innerHeight-(coach.offsetHeight+35)));coach.style.left=x+'px';coach.style.top=y+'px'}
function hop(){if(prefersStill||quiet||shown||document.hidden||!coach)return;hopCount++;const target=$(targets[hopCount%targets.length]);if(!target)return;const box=target.getBoundingClientRect();if(box.bottom<60||box.top>window.innerHeight-40){positionCoach();return}const room=window.innerWidth-coach.offsetWidth-16;const x=Math.min(room,Math.max(12,hopCount%2?box.left+18:box.right-coach.offsetWidth-25));const y=Math.max(95,Math.min(window.innerHeight-coach.offsetHeight-20,box.top+35));coach.style.left=x+'px';coach.style.top=y+'px';coach.classList.remove('is-jumping');void coach.offsetWidth;coach.classList.add('is-jumping')}
function decorateHero(){const hero=document.querySelector('.hero');if(!hero)return;hero.classList.add('glass-hero');const art=make('img','mentor-hero-art');art.src='assets/milo-monkey.svg';art.alt='';art.setAttribute('aria-hidden','true');hero.append(art)}
function detectLesson(ev){const target=ev.target.closest?.('button,a,summary');if(!target)return;const label=(target.textContent||'').toLowerCase();if(label.includes('open week')||label.includes('completed')||label.includes('mark complete')){setTimeout(()=>{const d=$('week-detail');activeName=d?.querySelector('h2')?.textContent||'a new week';refreshDashboard();const bubble=$('milo-bubble');if(bubble&&!quiet&&!shown){bubble.textContent='New mission! 🚀';bubble.hidden=false}},80)}
if(label.includes('explore this level')){setTimeout(()=>{const d=$('path-detail');activeName=d?.querySelector('h2')?.textContent||'your path'},80)}
if(label.includes('try again')||label.includes('reset progress'))setTimeout(refreshDashboard,90)}
function observeDynamicProgress(){document.addEventListener('click',detectLesson);window.addEventListener('storage',refreshDashboard);const quiz=$('quiz-score');if(quiz){new MutationObserver(refreshDashboard).observe(quiz,{childList:true,characterData:true,subtree:true})}const count=$('progress-count');if(count){new MutationObserver(refreshDashboard).observe(count,{childList:true,characterData:true,subtree:true})}}
function setupTilt(){if(prefersStill||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;for(const panel of document.querySelectorAll('.glass-hero,.mentor-dashboard')){panel.addEventListener('pointermove',ev=>{const r=panel.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;panel.style.transform='perspective(1100px) rotateX('+(-y*4).toFixed(2)+'deg) rotateY('+(x*4).toFixed(2)+'deg)'},{passive:true});panel.addEventListener('pointerleave',()=>{panel.style.transform=''})}}
function setup(){decorateHero();createDashboard();createMilo();setupTilt();observeDynamicProgress();positionCoach();window.addEventListener('resize',positionCoach,{passive:true});if(!prefersStill)window.addEventListener('scroll',()=>{if(!shown)positionCoach()},{passive:true});if(!prefersStill)setInterval(hop,11000);document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&dialog&&!dialog.hidden)closeDialog()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
