/* Buildless, file:// compatible. No fetch, imports, remote fonts or network calls. */
(() => {
  'use strict';
  const C = window.WILLOW, $ = id => document.getElementById(id);
  const KEY = 'willow-manor-lesson-v1';
  const fresh = () => ({stage:0, revealed:[], visited:[], marks:[], group:'standard', animations:!matchMedia('(prefers-reduced-motion: reduce)').matches, link:'', mrs:false});
  let state = fresh(), stored = false, storageOK = true, pending = {}, videoURL = '', toastTimer;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Number.isInteger(saved.stage) && saved.stage >= 0 && saved.stage < 12) {
      state = {...state, ...saved};
      state.revealed = Array.isArray(saved.revealed) ? saved.revealed.filter(n => Number.isInteger(n) && n>=2 && n<=10) : [];
      state.visited = Array.isArray(saved.visited) ? saved.visited.filter(n => Number.isInteger(n) && n>=0 && n<12) : [];
      state.marks = Array.isArray(saved.marks) ? saved.marks.filter(m => m && ['a','b'].every(k => Array.isArray(m[k]) && m[k].length===2 && m[k].every(x=>Number.isFinite(x)&&x>=0&&x<=100)) && typeof m.text==='string').slice(0,10) : [];
      state.group = state.group === 'easy' ? 'easy' : 'standard';
      state.link = typeof state.link === 'string' ? state.link : '';
      stored = true;
    }
  } catch (_) { storageOK = false; }
  const audio = document.createElement('audio');
  audio.src = C.audio; audio.controls = true; audio.preload = 'none'; audio.setAttribute('aria-label','Meet the Cats listening');
  audio.addEventListener('error',()=>toast('Audio is unavailable. Your teacher can continue without sound.'));
  const stages = [
    {title:'The Mystery of Mr Muffin', task:'Знакомство с историей. Mrs Willow просит помочь найти Mr Muffin. Start открывает карту.'},
    {title:'Explore Willow Manor', task:'Выберите комнату или начните по порядку. Можно пропускать этапы. Золотая метка: кот открыт. Для слабой группы выберите вариант there is / there are.'},
    {title:'The Letter', prompt:'Complete the questions and the story.', room:'study', cat:'socks', quote:'Let’s look around the manor!', task:'Письмо Mrs Willow: 8 вопросительных слов, вопросы и карточки ответов. Полный комплект письма отсутствует. Используйте свой лист. 03_Detective_Questions.jpeg относится к упрощённому чтению, это не замена письма.'},
    {title:'Who Is Doing What?', prompt:'Look at the people. What are they doing?', image:C.manor, cat:'sherlock', quote:'You are great detectives!', task:'Готовый особняк с 12 подписанными людьми. Шесть детей составляют по два предложения в Present Continuous. Имена и действия берите только с картинки. В начальной группе используйте there is / there are.'},
    {title:'The Kitchen Mystery', prompt:'Ask the other team about their kitchen.', room:'kitchen', cat:'pudding', quote:'Mr Muffin isn’t in the kitchen.', task:'Командная игра: распечатайте Messy_Kitchen_Team_A.jpeg и Messy_Kitchen_Team_B.jpeg. Каждая команда видит только свой лист. Вопросы и ответы с some / any. Для начальной группы выберите простые вопросы Is there / Are there без any. Не показывайте кухни команд на проекторе.'},
    {title:'Usually or Today?', prompt:'What does the cat usually do? What is the cat doing today?', room:'bedroom', cat:'luna', quote:'Let’s keep looking!', task:'10 пар Usually / Today в комплекте отсутствуют. Используйте подготовленные листы и выберите нужные пары. Этот этап можно пропустить. Начальная группа описывает комнату через there is / there are.'},
    {title:'Meet the Cats', prompt:'Listen. Match each cat with its description and favourite place.', room:'laundry', cat:'duchess', quote:'Have you seen Mr Muffin?', task:'Аудирование. listening.mp3 приложен, лист сопоставления отсутствует. До урока прослушайте запись и проверьте соответствие своему заданию. Автоматических ответов нет. При отсутствии звука прочитайте свой текст или пропустите этап.'},
    {title:'Mr Muffin’s Habits', prompt:'Read about Mr Muffin. Choose True, False or Not Stated.', room:'library', cat:'chester', quote:'Mr Muffin isn’t here. Let’s look in another room.', task:'Упрощённое чтение: 01_Mr_Muffin_Text.jpeg, 02_True_False.jpeg, 03_Detective_Questions.jpeg. Выдайте отдельно. Проверьте, есть ли Not Stated в вашем листе. Ответы и развязку до проверки не показывайте.'},
    {title:'Spot the Differences', prompt:'Look carefully. Find 10 differences.', room:'living', cat:'sherlock', quote:'Well done! Let’s look for one more clue.', task:'Ручной режим: отметьте точку на A, затем соответствующую точку на B, выберите предложение и подтвердите. Координаты и предложения не проверяются автоматически. Повторные точки рядом с уже отмеченными не засчитываются. Подтверждены 9 изменений из ключа. Цветок есть в обеих вазах. Не выдумывайте десятое: завершите этап кнопкой ниже.', warning:'В исходном ключе 10 отличий, но цветок присутствует в обеих версиях. Можно закончить после обсуждения через «Завершить этап».',},
    {title:'One Last Clue', prompt:'Mr Muffin heard a loud noise. Where did he go?', task:'Обсудите догадки. Нажмите Open the door, когда дети будут готовы к развязке. Зимний сад и причина исчезновения раскрываются на следующем экране.'},
    {title:'We Found Mr Muffin!', prompt:'There you are, Mr Muffin!', room:'conservatory', cat:'mr_muffin', quote:'He was scared of the vacuum cleaner and fell asleep in the winter garden.', task:'Финальная развязка после игры отличий. Нажмите Reveal the cat, затем Mrs Willow. Оригинальная карточка показывает сидящего Маффина целиком. Сцены спящего кота и портрета Mrs Willow нет; заменяемые поля находятся в config.js.'},
    {title:'Congratulations!', task:'Завершение. Видео необязательно. Выберите локальный файл или сохраните ссылку в настройках. Ссылка открывается только вашей кнопкой. Файл после обновления страницы нужно выбрать заново.'}
  ];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; }
    catch (_) { storageOK = false; }
    $('storage-status').textContent = storageOK ? '' : 'Браузер не сохраняет прогресс. Урок работает, но после закрытия страницы состояние может потеряться.';
  }
  function esc(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function img(src, alt, cls='') { return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}">`; }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent=message; $('toast').classList.add('visible'); toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4500); }
  function go(n) {
    if(n<0||n>11)return;
    if(state.stage===6 && n!==6)audio.pause();
    if(state.stage===8 && n!==8)pending={};
    state.stage=n; if(!state.visited.includes(n))state.visited.push(n); save();render();
    $('stage').focus({preventScroll:true});window.scrollTo(0,0);
  }
  function next(){go(state.stage===0?1:state.stage===1?2:state.stage===4&&state.group==='easy'?6:Math.min(11,state.stage+1));}
  function back(){go(state.stage===6&&state.group==='easy'?4:Math.max(0,state.stage-1));}
  function reveal(force=false) {
    if(!stages[state.stage].cat)return;
    if(state.stage===8&&state.marks.length<10&&!force){toast('Your teacher can finish this activity.');return;}
    if(!state.revealed.includes(state.stage)){state.revealed.push(state.stage);save();render();}
  }
  function actionButtons(revealButton=true) {
    const isRevealed=state.revealed.includes(state.stage);
    return `<div class="room-nav"><button class="secondary" data-action="back">Back</button><div class="actions">${revealButton?`<button data-action="reveal" ${isRevealed?'disabled':''}>${isRevealed?'Cat found':'Reveal the cat'}</button>`:''}<button data-action="next">${state.stage===9?'Open the door':state.stage===10?'Celebrate':'Next room'}</button></div></div>`;
  }
  function placeholder(kind) {
    if(kind==='gates')return `<div class="gates" aria-label="Temporary illustration of the manor gates"><div class="gate"></div><div class="gate"></div></div>`;
    if(kind==='corridor')return '<div class="scene-placeholder"><div class="door" aria-label="A closed door"></div><p class="temporary">Temporary scene · a door at Willow Manor</p></div>';
    return '<div class="scene-placeholder"><span class="letter" aria-hidden="true">W</span><p>Willow Manor</p><small>Temporary scene</small></div>';
  }
  function cover(){
    return `<section class="hero"><div class="hero-copy"><p class="eyebrow">Welcome, detectives</p><h1>The Mystery<br>of Mr Muffin</h1><p class="prompt">Mr Muffin is missing.<br>Can you help us find him?</p><button data-action="next">Start</button><div class="hero-people"><span class="character-placeholder">${C.artwork.mrsWillow?img(C.artwork.mrsWillow,'Mrs Willow','cover-character'):''}Mrs Willow: “Please help!”</span><span class="character-placeholder">${C.artwork.detective?img(C.artwork.detective,'The detective','cover-character'):''}Detective: “Let’s find him.”</span></div><p class="seal">An English adventure at Willow Manor</p></div><div class="hero-art">${C.artwork.gates?img(C.artwork.gates,'The gates of Willow Manor'):placeholder('gates')}<div class="caption">${C.artwork.gates?'Willow Manor':'Temporary illustration · the manor gates'}</div></div></section>`;
  }
  function map(){
    const names=['The Letter',state.group==='easy'?'Describe the Manor':'Who Is Doing What?','The Kitchen Mystery',state.group==='easy'?'Describe a Room (optional)':'Usually or Today?','Meet the Cats','Mr Muffin’s Habits','Spot the Differences','One Last Clue','The Final Room','Celebration'];
    return `<section><div class="map-intro"><div><p class="eyebrow">Your investigation</p><h1>Explore Willow Manor</h1><p class="prompt">Visit the rooms and look for clues.</p></div><button data-go="2">First room</button></div><div class="map-layout"><div class="map-art">${img(C.manor,'Willow Manor and its twelve residents')}<p>${state.group==='easy'?'Look at the rooms. What is there?':'A house full of clues. Where shall we look?'}</p></div><nav class="room-list" aria-label="Rooms">${names.map((name,i)=>{const n=i+2,done=state.revealed.includes(n)||(n===11&&state.visited.includes(11));return `<button data-go="${n}" class="room-link ${done?'completed':''}">${name}<small>${done?'Cat found':state.visited.includes(n)?'Visited':'Not visited'}</small></button>`;}).join('')}</nav></div></section>`;
  }
  function room(){
    const n=state.stage,s=stages[n],found=state.revealed.includes(n), easy=state.group==='easy';
    let title=s.title,prompt=s.prompt;
    if(easy&&n===3){title='Describe the Manor';prompt='Look at the rooms. What is there?';}
    if(easy&&n===5){title='Describe a Room';prompt='What is there in this room?';}
    let help='';
    if(n===4)help=easy?'<div class="language-help"><p>Are there apples? Yes, there are. / No, there aren’t.</p><p>Is there milk? Yes, there is. / No, there isn’t.</p></div>':'<div class="language-help"><p>Are there any apples? Yes, there are. / No, there aren’t.</p><p>Is there any milk? Yes, there is. / No, there isn’t.</p></div>';
    if(easy&&(n===3||n===5))help='<div class="language-help">There is a… / There are…</div>';
    const source=n===9?C.artwork.corridor:n===2?(C.artwork.hall||C.rooms.study):s.image||C.rooms[s.room];
    const art=source?img(source,n===3?'Willow Manor with twelve named people':n===2?'Study used as a temporary hall scene':title,'scene-image'):placeholder(n===9?'corridor':'room');
    const catSource=n===10&&C.artwork.sleepingMuffin?C.artwork.sleepingMuffin:C.cats[s.cat];
    return `<section><div class="room-heading"><div><p class="eyebrow">${n===9?'The last clue':n===10?'The mystery solved':'The investigation'}</p><h1>${title}</h1><p class="prompt">${prompt}</p></div></div>${help}${n===6?'<div class="audio-box" id="audio-slot"><button id="audio-play">Play</button><button id="audio-pause" class="secondary">Pause</button><button id="audio-replay" class="secondary">Replay</button></div><p class="subtle">Listen together, or follow your teacher without sound.</p>':''}<div class="room-scene ${found?'revealed':''}">${art}${found?`<div class="cat-reveal">${img(catSource,n===10?'Original full Mr Muffin card':'Full '+s.cat+' character card','cat-card')}<div class="speech">${s.quote}${n===10&&state.mrs?`<p class="mrs-quote">Mrs Willow: “Thank you for finding Mr Muffin!”</p>${C.artwork.mrsWillow?img(C.artwork.mrsWillow,'Mrs Willow','cat-card'):''}`:''}</div></div>`:''}</div>${n===2&&!C.artwork.hall?'<p class="temporary">The study stands in for the hall.</p>':''}${n===10&&found&&!state.mrs?'<div class="actions"><button id="mrs-reveal" class="secondary">Mrs Willow</button></div>':''}${actionButtons(n!==9)}</section>`;
  }
  function game(){
    if(state.revealed.includes(8))return room();
    return `<section><div class="game-top"><div><p class="eyebrow">Two pictures, one careful look</p><h1>Spot the Differences</h1></div><div class="game-tools"><strong class="counter">Found ${state.marks.length}/10</strong><button id="hint" class="secondary">Hint</button><button id="game-reset" class="secondary">Reset</button></div></div><p class="prompt">Look carefully. Find 10 differences.</p><p class="game-instruction" id="game-instruction">${pending.a?'Now mark the same difference on Picture B.':'Discuss with your teacher. Mark a difference on Picture A, then Picture B.'}</p><div class="game-images">${['a','b'].map((k,i)=>`<figure class="picture"><figcaption>Picture ${k.toUpperCase()}</figcaption><div class="picture-area" data-picture="${k}" tabindex="0" role="button" aria-label="Picture ${k.toUpperCase()}: click an observed difference; use teacher controls without a mouse">${img(C.differences[i],'Original Picture '+k.toUpperCase())}${state.marks.map((m,j)=>pin(m[k],j+1)).join('')}${pending[k]?pin(pending[k],'?',true):''}</div></figure>`).join('')}</div>${state.marks.length?`<ol class="game-sentences">${state.marks.map(m=>`<li>${esc(m.text)}</li>`).join('')}</ol>`:''}${state.marks.length===10?'<p class="prompt">Congratulations!</p>':''}${actionButtons(true)}<p class="subtle">Teacher-led discussion. Your teacher checks each observation.</p></section>`;
  }
  function pin(point,label,temporary=false){return `<span class="pin ${temporary?'pending':''}" style="left:${point[0]}%;top:${point[1]}%"><span>${label}</span></span>`;}
  function finale(){
    const canWatch=!!(videoURL||C.video);
    return `<section class="hero finale"><div class="hero-copy celebration"><p class="eyebrow">Case closed</p><h1>Congratulations!</h1><p class="prompt">You found Mr Muffin!<br>You are brilliant detectives!</p><p class="mrs-quote">Mrs Willow: “Thank you, detectives!”</p><div class="actions">${canWatch?'<button id="watch-video">Watch Mr Muffin’s Day</button>':''}<button class="secondary" data-action="map">Back to the map</button><button class="secondary" id="play-again">Play again</button></div>${!canWatch?'<p class="subtle" lang="ru">Добавьте видео позже в панели «Учителю».</p>':''}</div><div class="hero-art">${img(C.cats.mr_muffin,'Mr Muffin, the original full character card')}<div class="caption">The mystery of Mr Muffin · solved together</div></div></section>`;
  }
  function render(){
    document.body.classList.toggle('no-motion',!state.animations);
    $('stage').innerHTML=state.stage===0?cover():state.stage===1?map():state.stage===8?game():state.stage===11?finale():room();
    $('chapter').textContent=state.stage<=1?'THE MYSTERY OF MR MUFFIN':`CHAPTER ${state.stage-1} OF 10`;
    $('progress').textContent=`${state.revealed.filter(n=>n!==8).length + (state.revealed.includes(8)?1:0)} / 8 discoveries`;
    $('map-button').hidden=state.stage===1;
    $('teacher-task').textContent=stages[state.stage].task;
    $('teacher-warning').textContent=stages[state.stage].warning||'';
    $('finish-game').hidden=state.stage!==8;
    $('teacher-panel').querySelector('[data-action="reveal"]').disabled=!stages[state.stage].cat;
    $('group').value=state.group;$('animations').checked=state.animations;
    $('video-link').value=state.link;
    $('audio-download').href=C.audio;
    $('storage-status').textContent=storageOK?'':'Прогресс не сохраняется в этом браузере. После перезагрузки он может потеряться.';
    $('video-status').textContent=videoURL?'Локальный файл готов. После перезагрузки выберите его повторно.':C.video?'Настроено видео из config.js.':'Добавьте видео позже. Урок работает без него.';
    if(state.stage===6){$('audio-slot').prepend(audio);$('audio-play').onclick=()=>playAudio();$('audio-pause').onclick=()=>audio.pause();$('audio-replay').onclick=()=>{audio.currentTime=0;playAudio();};}
    if($('mrs-reveal'))$('mrs-reveal').onclick=()=>{state.mrs=true;save();render();};
    if($('watch-video'))$('watch-video').onclick=()=>{$('final-video').src=videoURL||C.video;$('video-dialog').showModal();};
    if($('play-again'))$('play-again').onclick=()=>$('reset-dialog').showModal();
    if($('hint'))$('hint').onclick=()=>toast('Look at the curtains, the picture and the cats. Discuss what changed.');
    if($('game-reset'))$('game-reset').onclick=()=>{if(confirm('Сбросить только отметки этой игры?')){state.marks=[];state.revealed=state.revealed.filter(n=>n!==8);pending={};save();render();}};
    document.querySelectorAll('.picture-area').forEach(el=>{el.onclick=e=>mark(el,e);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toast('Use the teacher panel to finish this activity without marking pictures.');}};});
    document.querySelectorAll('#stage img').forEach(el=>el.addEventListener('error',()=>{
      const div=document.createElement('div');div.className='missing';div.textContent='Image unavailable. Your teacher can continue.';div.setAttribute('role','img');div.setAttribute('aria-label',el.alt+' unavailable');el.replaceWith(div);
    },{once:true}));
  }
  function playAudio(){audio.play().catch(()=>toast('Audio is unavailable. Please check the file or continue with your teacher.'));}
  function mark(el,e){
    if(state.marks.length>=10){toast('All ten observations are marked.');return;}
    if(!el.querySelector('img')){toast('Picture unavailable. Your teacher can finish this activity.');return;}
    const key=el.dataset.picture;
    if(key==='b'&&!pending.a){toast('Start with Picture A.');return;}
    const box=el.getBoundingClientRect(),point=[Math.max(0,Math.min(100,(e.clientX-box.left)/box.width*100)),Math.max(0,Math.min(100,(e.clientY-box.top)/box.height*100))];
    if(state.marks.some(m=>Math.hypot(m[key][0]-point[0],m[key][1]-point[1])<5)){toast('This area is already marked.');return;}
    pending[key]=point;
    render();
    if(pending.a&&pending.b){
      $('difference-label').innerHTML=C.observations.map(([title],i)=>`<option value="${i}" ${state.marks.some(m=>m.observation===i)&&i<9?'disabled':''}>${esc(title)}</option>`).join('');
      const available=C.observations.findIndex((_,i)=>i===9||!state.marks.some(m=>m.observation===i));
      $('difference-label').value=String(available);$('difference-custom').value='';$('mark-dialog').showModal();
    }
  }
  function reset(){
    const settings={group:state.group,animations:state.animations,link:state.link};state={...fresh(),...settings};pending={};audio.pause();audio.currentTime=0;$('reset-dialog').close();save();render();$('stage').focus();
  }
  function teacher(open){$('teacher-panel').hidden=!open;$('teacher-toggle').setAttribute('aria-expanded',String(open));if(open)$('teacher-close').focus();else $('teacher-toggle').focus();}
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-action],[data-go]');if(!button)return;
    if(button.dataset.go!==undefined){go(Number(button.dataset.go));return;}
    ({next,back,map:()=>go(1),reveal:()=>reveal(button.closest('#teacher-panel')!==null)})[button.dataset.action]?.();
  });
  $('home').onclick=()=>go(1);$('map-button').onclick=()=>go(1);
  $('teacher-toggle').onclick=()=>teacher($('teacher-panel').hidden);$('teacher-close').onclick=()=>teacher(false);
  $('finish-game').onclick=()=>reveal(true);
  $('restart').onclick=()=>$('reset-dialog').showModal();$('restart-top').onclick=()=>$('reset-dialog').showModal();$('reset-confirm').onclick=reset;$('reset-cancel').onclick=()=>$('reset-dialog').close();
  $('group').onchange=e=>{state.group=e.target.value;save();render();};
  $('animations').onchange=e=>{state.animations=e.target.checked;save();render();};
  $('video-file').onchange=e=>{if(videoURL)URL.revokeObjectURL(videoURL);const file=e.target.files[0];videoURL=file?URL.createObjectURL(file):'';render();};
  $('remove-video').onclick=()=>{if(videoURL)URL.revokeObjectURL(videoURL);videoURL='';$('video-file').value='';render();};
  function validLink(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch(_){return '';}}
  $('save-link').onclick=()=>{const raw=$('video-link').value.trim(),url=validLink(raw);if(raw&&!url){toast('Введите корректную ссылку https:// или http://');return;}state.link=url;save();toast('Ссылка сохранена. Откройте её отдельной кнопкой.');};
  $('open-link').onclick=()=>{const url=validLink(state.link);if(url)window.open(url,'_blank','noopener,noreferrer');else toast('Сначала сохраните ссылку на видео.');};
  $('video-close').onclick=()=>{$('final-video').pause();$('video-dialog').close();};
  $('video-dialog').addEventListener('close',()=>$('final-video').pause());
  $('final-video').onerror=()=>toast('Video unavailable. Choose another file in the teacher panel.');
  $('mark-confirm').onclick=()=>{
    if(!pending.a||!pending.b)return;
    const i=Number($('difference-label').value),custom=$('difference-custom').value.trim();
    if(i<9&&state.marks.some(m=>m.observation===i)){toast('Это отличие уже засчитано.');return;}
    state.marks.push({a:pending.a,b:pending.b,observation:i,text:custom||C.observations[i][1]});pending={};$('mark-dialog').close();save();render();
  };
  $('mark-cancel').onclick=()=>{pending={};$('mark-dialog').close();render();};
  $('mark-dialog').addEventListener('cancel',()=>{pending={};render();});
  $('resume-yes').onclick=()=>{$('resume-dialog').close();render();$('stage').focus();};
  $('resume-no').onclick=()=>{$('resume-dialog').close();go(0);};
  $('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>toast('Use your browser’s full screen command.'));};
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('teacher-panel').hidden&&!document.querySelector('dialog[open]')){teacher(false);return;}
    if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|SELECT|TEXTAREA|BUTTON|AUDIO|VIDEO/.test(e.target.tagName)||document.querySelector('dialog[open]'))return;
    if(e.key==='ArrowRight'){e.preventDefault();next();}
    if(e.key==='ArrowLeft'){e.preventDefault();back();}
    if(e.key.toLowerCase()==='r')reveal(true);
    if(e.key.toLowerCase()==='m')go(1);
    if(e.key.toLowerCase()==='t')teacher($('teacher-panel').hidden);
  });
  render(); if(stored)$('resume-dialog').showModal();
})();
