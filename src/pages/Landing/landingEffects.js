export function initLanding(){
  var _listeners=[], _stopped=false, _mainRaf=0;
  function on(t,ev,fn,opts){ t.addEventListener(ev,fn,opts); _listeners.push([t,ev,fn,opts]); }
  function track(name,params){ if(window.gtag){ try{ gtag('event',name,params||{}); }catch(e){} } }   // fire a named GA4 event on key button presses
  // Turnstile: explicit render (auto-render misses React-inserted widgets)
  var _tsId=null;
  function mountTurnstile(){
    if(_tsId!==null) return;
    if(!(window.turnstile&&window.turnstile.render)){ setTimeout(mountTurnstile,300); return; }   // wait for the async script
    var box=document.getElementById('turnstileBox'); if(!box) return;
    try{ _tsId=window.turnstile.render(box,{sitekey:'0x4AAAAAADwv0OfinxrncT6S',theme:'dark'}); }catch(e){}
  }
  // idempotent: clear DOM-built children so a re-mount (StrictMode/HMR) doesn't duplicate
  document.getElementById('assembly').innerHTML='';
  document.getElementById('filler').innerHTML='';
  document.getElementById('getBg').innerHTML='';
  var _tb=document.getElementById('turnstileBox'); if(_tb)_tb.innerHTML='';
  mountTurnstile();
if('scrollRestoration' in history)history.scrollRestoration='manual';   // don't let Chrome restore scroll (it cancels the auto-drop)
  window.scrollTo(0,0);
  var WORD="let's build one";
  var assembly=document.getElementById('assembly'),filler=document.getElementById('filler'),subcta=document.getElementById('subcta');
  var cue=document.querySelector('.cue');
  var topBar=document.querySelector('.top');
  var progressEl=document.getElementById('progress'), pfill=document.getElementById('pfill');
  var get=document.getElementById('get');
  var getGlow=document.getElementById('getGlow');
  var getKick=get.querySelector('.getKick'),getH=get.querySelector('.getH'),getCards=[].slice.call(get.querySelectorAll('.getCard'));
  var rnd=function(a,b){return a+Math.random()*(b-a);};
  var orbLife=getCards.map(function(){return {ax:rnd(3.5,6),ay:rnd(3.5,6),sp:rnd(0.5,0.85),ph:rnd(0,6.28),depth:rnd(10,18)};});
  var blobEls=[].slice.call(document.querySelectorAll('.blob')).map(function(el){
    return {el:el,ax:rnd(7,13),ay:rnd(7,13),sp:rnd(0.3,0.5),ph:rnd(0,6.28),depth:rnd(14,26)};
  });
  // ---- floating background icons for the essentials (website / google business / analytics) ----
  var getBg=document.getElementById('getBg');
  var ICO_WEB='<rect x="8" y="12" width="48" height="40" rx="9"/><line x1="8" y1="26" x2="56" y2="26"/><rect x="13" y="17.2" width="26" height="4.6" rx="2.3"/><circle cx="48.5" cy="19.5" r="1.5" fill="currentColor" stroke="none"/><path d="M28 30 L28 46 L32.2 42 L35 47.6 L37.7 46.3 L34.9 41 L40.2 40.4 Z"/>';
  var ICO_PIN='<path d="M32 54 C 24 43 17.5 34 17.5 24.5 A14.5 14.5 0 1 1 46.5 24.5 C 46.5 34 40 43 32 54 Z"/><circle cx="32" cy="23.5" r="5.5"/>';
  var ICO_CHART='<line x1="13" y1="47" x2="51" y2="47"/><g stroke-width="4.6"><line x1="21" y1="47" x2="21" y2="38"/><line x1="32" y1="47" x2="32" y2="30"/><line x1="43" y1="47" x2="43" y2="21"/></g>';
  var ICO_SET=[ICO_WEB,ICO_PIN,ICO_CHART];
  var bgIcons=[];
  for(var gi=0;gi<12;gi++){
    var iel=document.createElement('div'); iel.className='bgi';
    iel.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">'+ICO_SET[gi%3]+'</svg>';
    var isz=rnd(34,76);
    iel.style.width=isz.toFixed(0)+'px'; iel.style.height=isz.toFixed(0)+'px';
    iel.style.left=rnd(2,90).toFixed(1)+'%'; iel.style.top=rnd(5,86).toFixed(1)+'%';
    getBg.appendChild(iel);
    bgIcons.push({el:iel,ax:rnd(6,13),ay:rnd(6,13),sp:rnd(0.25,0.5),rsp:rnd(0.2,0.4),ph:rnd(0,6.28),rot:rnd(-18,18),depth:rnd(8,20),base:rnd(0.05,0.09)});
  }

  // ---- form: step system + interest selection ----
  var essGo=document.getElementById('essGo');
  var STEP_PANELS=[document.getElementById('stepEss'),document.getElementById('stepInterest'),document.getElementById('stepDetails'),document.getElementById('stepContact'),document.getElementById('stepDone')];
  var formNav=document.getElementById('formNav'), navBack=document.getElementById('navBack'), navNext=document.getElementById('navNext'), navSend=document.getElementById('navSend');
  var step=0;
  // step 2 adapts to the step-1 picks — one light question per chosen service
  var Q2={
    website:{q:'do you have a website yet?', opts:['yep','needs work','not yet']},
    gbp:{q:'on google maps yet?', opts:["i'm listed",'not sure','nope']},
    analytics:{q:'tracking your visitors today?', opts:['yes','no',"what's that?"]}
  };
  // the "not sure yet" branch: a single diagnostic question that points them the right way
  var Q2_DIAGNOSE={q:'which sounds most like you?', opts:[
    {label:"people can't really find me online", rec:'gbp'},
    {label:"i don't have a website yet", rec:'website'},
    {label:"i have a site but don't know if it's working", rec:'analytics'},
    {label:'a bit of everything, honestly', rec:'all'}
  ]};
  var answers2={}, unsure=false, diagnoseRec=null;
  function buildStep2(){
    var host=document.getElementById('q2host'); host.innerHTML=''; answers2={}; diagnoseRec=null;
    document.getElementById('d2H').textContent  = unsure ? "no worries — let's figure it out" : 'where are you at?';
    document.getElementById('d2Sub').textContent = unsure ? "one quick question and i'll point you the right way." : 'tap what fits — takes two seconds.';
    var blocks;
    if(unsure){
      blocks=[{key:'_diagnose', q:Q2_DIAGNOSE.q, opts:Q2_DIAGNOSE.opts}];
    } else {
      var keys=['website','gbp','analytics'].filter(function(k){return selected[k];});
      blocks = keys.length ? keys.map(function(k){return {key:k,q:Q2[k].q,opts:Q2[k].opts};})
                           : [{key:'_general',q:'what best describes you?',opts:['just getting started','up & running','just exploring']}];
    }
    blocks.forEach(function(bl){
      var block=document.createElement('div'); block.className='qblock';
      var label=document.createElement('p'); label.className='qlabel'; label.textContent=bl.q; block.appendChild(label);
      var chips=document.createElement('div'); chips.className='qchips';
      bl.opts.forEach(function(opt){
        var text = (typeof opt==='string') ? opt : opt.label;
        var chip=document.createElement('button'); chip.type='button'; chip.className='chip'; chip.textContent=text;
        chip.addEventListener('click',function(){
          [].forEach.call(chips.children,function(c){c.classList.remove('on');});
          chip.classList.add('on'); answers2[bl.key]=text;
          if(bl.key==='_diagnose' && typeof opt!=='string') diagnoseRec=opt.rec;
        });
        chips.appendChild(chip);
      });
      block.appendChild(chips); host.appendChild(block);
    });
  }
  function showStep(n){
    step=n;
    if(n===2) buildStep2();                               // (re)build the adaptive questions from current picks
    STEP_PANELS.forEach(function(pn,i){ pn.classList.toggle('on', i===n); });
    document.body.style.overflow = n>0 ? 'hidden' : '';   // lock page scroll while inside the form
    // persistent nav: shown on steps 1-3; 'next' for 1&2, 'send' for 3
    formNav.classList.toggle('show', n>=1 && n<=3);
    navNext.style.display = (n===1||n===2) ? 'inline-flex' : 'none';
    navSend.style.display = (n===3) ? 'inline-flex' : 'none';
    if(n===1) navNext.classList.toggle('ready', Object.keys(selected).length>0);
    if(n===2) navNext.classList.add('ready');
    if(n===3 && navSend.classList.contains('filling')){ navSend.classList.add('noAnim'); navSend.classList.remove('filling'); requestAnimationFrame(function(){requestAnimationFrame(function(){navSend.classList.remove('noAnim');});}); }
    if(n===4 && ticket){ buildTicket(); ticket.classList.remove('print'); void ticket.offsetWidth; ticket.classList.add('print'); }  // build + print the ticket
    if(n===0 && essGo && essGo.classList.contains('filling')){   // reset the fill button instantly when back on essentials
      essGo.classList.add('noAnim'); essGo.classList.remove('filling');
      requestAnimationFrame(function(){requestAnimationFrame(function(){essGo.classList.remove('noAnim');});});
    }
  }
  // populate option icons from the shared icon set
  var ICMAP={web:ICO_WEB,pin:ICO_PIN,chart:ICO_CHART};
  [].forEach.call(document.querySelectorAll('.oicon'),function(sp){
    sp.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">'+ICMAP[sp.getAttribute('data-ic')]+'</svg>';
  });
  var interestOpts=[].slice.call(document.querySelectorAll('#stepInterest .opt'));
  var selected={};
  interestOpts.forEach(function(o){
    o.addEventListener('click',function(){
      var k=o.getAttribute('data-key');
      if(o.classList.toggle('sel')){selected[k]=true; track('service_select',{service:k});} else delete selected[k];
      unsure=false;                                       // picking a service means they're not on the "not sure" path
      navNext.classList.toggle('ready', Object.keys(selected).length>0);
    });
  });
  if(essGo)essGo.addEventListener('click',function(){
    if(essGo.classList.contains('filling'))return;   // fill sweeps across, then advances when full
    track('cta_lets_do_it');
    essGo.classList.add('filling');
    setTimeout(function(){showStep(1);}, 640);
  });
  document.getElementById('iUnsure').addEventListener('click',function(){
    track('form_unsure');
    unsure=true;                                          // distinct path — clear any service picks, ask a diagnostic instead
    Object.keys(selected).forEach(function(k){delete selected[k];});
    interestOpts.forEach(function(o){o.classList.remove('sel');});
    navNext.classList.remove('ready');
    showStep(2);
  });
  // persistent nav actions
  navBack.addEventListener('click',function(){ showStep(step-1); });
  navNext.addEventListener('click',function(){
    if(step===1){ if(Object.keys(selected).length) showStep(2); }
    else if(step===2){ showStep(3); }
  });
  // step 3: contact + send
  var cName=document.getElementById('cName'), cContact=document.getElementById('cContact'), cMsg=document.getElementById('cMsg');
  var ticket=document.getElementById('ticket');
  function buildTicket(){
    var svc={website:'a website',gbp:'google business',analytics:'analytics'};
    var items;
    if(unsure){
      items = (diagnoseRec && diagnoseRec!=='all') ? [svc[diagnoseRec]] : ['figuring it out together'];
    } else {
      items = ['website','gbp','analytics'].filter(function(k){return selected[k];}).map(function(k){return svc[k];});
      if(!items.length) items=['figuring it out together'];
    }
    var list=document.getElementById('tkList'); list.textContent='';
    items.forEach(function(it){
      var li=document.createElement('li');
      var c=document.createElement('span'); c.className='tkc'; c.textContent='✓';
      li.appendChild(c); li.appendChild(document.createTextNode(it));
      list.appendChild(li);
    });
  }
  cName.addEventListener('input',function(){document.getElementById('fldName').classList.remove('invalid');});
  cContact.addEventListener('input',function(){document.getElementById('fldContact').classList.remove('invalid');});
  function gatherPayload(){
    var svc={website:'a website',gbp:'google business',analytics:'analytics'};
    var services = unsure ? ((diagnoseRec&&diagnoseRec!=='all')?[svc[diagnoseRec]]:[])
                          : ['website','gbp','analytics'].filter(function(k){return selected[k];}).map(function(k){return svc[k];});
    var situation=[];
    [].forEach.call(document.querySelectorAll('#q2host .qblock'),function(bl){
      var q=bl.querySelector('.qlabel'), on=bl.querySelector('.chip.on');
      if(q&&on) situation.push({q:q.textContent, a:on.textContent});
    });
    return { name:cName.value, contact:cContact.value, message:cMsg.value,
             services:services, situation:situation, unsure:unsure,
             turnstileToken:(window.turnstile&&_tsId!==null)?(window.turnstile.getResponse(_tsId)||''):'',
             company:document.getElementById('hp').value, page:location.href };
  }
  function failSend(res){
    navSend.classList.add('noAnim'); navSend.classList.remove('filling');
    if(window.turnstile&&_tsId!==null){try{window.turnstile.reset(_tsId);}catch(e){}}   // fresh token for a retry
    requestAnimationFrame(function(){requestAnimationFrame(function(){navSend.classList.remove('noAnim');});});
    var e=document.getElementById('sendErr');
    e.textContent = (res&&res.error) ? ("couldn't send — "+res.error) : "couldn't send — check your connection and try again.";
    e.classList.add('show');
  }
  navSend.addEventListener('click',function(){
    if(navSend.classList.contains('filling'))return;
    var okName=cName.value.trim().length>0, okContact=cContact.value.trim().length>0;
    document.getElementById('fldName').classList.toggle('invalid',!okName);
    document.getElementById('fldContact').classList.toggle('invalid',!okContact);
    if(!okName||!okContact){ (okName?cContact:cName).focus(); return; }
    document.getElementById('sendErr').classList.remove('show');
    navSend.classList.add('filling');
    var wait=new Promise(function(r){setTimeout(r,640);});   // let the fill sweep complete visually
    fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(gatherPayload())})
      .then(function(r){return r.json();}).catch(function(){return {ok:false};})
      .then(function(res){ return wait.then(function(){return res;}); })
      .then(function(res){ if(res&&res.ok){ if(window.gtag){try{gtag('event','generate_lead',{form:'intake'});}catch(e){}} showStep(4); } else { failSend(res); } });
  });
  // navigation: logo (and the confirmation link) = home — exit any step, unlock scroll, glide back to the start
  // 'see my work' blob -> list modal
  var workBlob=document.getElementById('workBlob'), workModal=document.getElementById('workModal');
  function openWork(){ workModal.classList.add('open'); track('cta_my_work'); }
  function closeWork(){ workModal.classList.remove('open'); }
  if(workBlob){
    workBlob.addEventListener('click',openWork);
    workBlob.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openWork(); } });
  }
  document.getElementById('wmClose').addEventListener('click',closeWork);
  [].forEach.call(document.querySelectorAll('.wmItem[href]'),function(a){ a.addEventListener('click',function(){ track('work_visit_click',{url:a.href}); }); });
  workModal.addEventListener('click',function(e){ if(e.target===workModal) closeWork(); });
  on(window,'keydown',function(e){ if(e.key==='Escape') closeWork(); });
  function goHome(){ showStep(0); window.scrollTo({top:0,behavior:'smooth'}); }
  var homeLink=document.getElementById('homeLink');
  if(homeLink)homeLink.addEventListener('click',goHome);
  document.getElementById('doneHome').addEventListener('click',goHome);
  var letters=[], fills=[];

  // build assembling heading letters
  [].forEach.call(WORD,function(ch){var s=document.createElement('span');s.className='tl';
    s.innerHTML=(ch===' '?'&nbsp;':ch);assembly.appendChild(s);});
  // build filler (each gets its own idle drift params — the "life")
  var pool='abcdefghijklmnopqrstuvwxyz?!'.split('');
  for(var i=0;i<26;i++){var s=document.createElement('span');
    s.textContent=pool[Math.floor(Math.random()*pool.length)];
    s.style.fontSize=rnd(20,86).toFixed(0)+'px';
    s.style.left=rnd(2,94).toFixed(1)+'%';s.style.top=rnd(4,90).toFixed(1)+'%';
    filler.appendChild(s);
    fills.push({el:s,fall:rnd(0.4,1.1),rot:rnd(-40,40),ph:rnd(0,6.28),ax:rnd(5,11),ay:rnd(5,11),sp:rnd(0.35,0.7),rsp:rnd(0.3,0.6),depth:rnd(7,16)});}

  // subtle mouse-reactive push
  var mx=0,my=0,tmx=0,tmy=0;
  on(window,'mousemove',function(e){tmx=e.clientX/innerWidth-0.5;tmy=e.clientY/innerHeight-0.5;},{passive:true});
  // (phone-tilt/gyroscope parallax removed — on iOS it triggered a motion-permission
  //  prompt on visit, which broke the "quick, seamless" feel. desktop mouse-parallax stays.)

  function setup(){
    letters=[].map.call(assembly.querySelectorAll('.tl'),function(el){
      var r=el.getBoundingClientRect();var hx=r.left+r.width/2,hy=r.top+r.height/2;
      var sx=rnd(innerWidth*0.04,innerWidth*0.96),sy=rnd(innerHeight*0.06,innerHeight*0.92);
      return {el:el,ox:sx-hx,oy:sy-hy,rot:rnd(-55,55),sc:rnd(0.35,1.6),ph:rnd(0,6.28),ax:rnd(4,8),ay:rnd(4,8),sp:rnd(0.35,0.65),depth:rnd(6,12)};
    });
  }
  // ---- section 3: one timeline eased toward a scroll-set target — plays forward AND reverses on the way up ----
  var TL_FWD=1.05, TL_BACK=0.9;   // seconds to play forward (whip+reveal) / to reverse back out
  var tl=0, tlTarget=0, _lt=performance.now()/1000;
  var easeIO=function(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;};
  var easeS=function(p){return p*p*(3-2*p);};

  function loop(){ if(_stopped)return;
    var t=performance.now()/1000; var dt=Math.min(0.05,t-_lt); _lt=t;
    mx+=(tmx-mx)*0.06;my+=(tmy-my)*0.06;                 // ease the cursor influence (spring-like)
    var p=Math.min(1,Math.max(0,scrollY/(innerHeight*1.02)));
    var e=p*p*(3-2*p); var q=1-e;
    var fo=1;   // keep "let's build one" solid — the dark whip covers it instead of fading it
    // filler — continuous idle float + cursor push
    fills.forEach(function(F){
      var ix=Math.sin(t*F.sp+F.ph)*F.ax + mx*F.depth;
      var iy=Math.cos(t*F.sp*0.85+F.ph)*F.ay + my*F.depth;
      var ir=Math.sin(t*F.rsp+F.ph)*4.5;
      F.el.style.transform='translate('+ix.toFixed(1)+'px,'+((e*innerHeight*F.fall)+iy).toFixed(1)+'px) rotate('+(F.rot+ir).toFixed(1)+'deg)';
      F.el.style.opacity=((1-e)*0.9).toFixed(2);
    });
    // floating past-work blobs — drift + parallax through hero/assembly, fade out before the whip
    var bf=Math.max(0,Math.min(1,1-(scrollY-innerHeight*1.0)/(innerHeight*0.42)));
    blobEls.forEach(function(B){
      var bx=Math.sin(t*B.sp+B.ph)*B.ax + mx*B.depth;
      var by=Math.cos(t*B.sp*0.8+B.ph)*B.ay + my*B.depth;
      B.el.style.transform='translate('+bx.toFixed(1)+'px,'+by.toFixed(1)+'px)';
      B.el.style.opacity=bf.toFixed(2);
      B.el.style.pointerEvents = bf>0.15 ? 'auto' : 'none';
    });
    // assembling letters — idle life while scattered (q), settles clean at assembly
    letters.forEach(function(L){
      var ix=(Math.sin(t*L.sp+L.ph)*L.ax + mx*L.depth)*q;
      var iy=(Math.cos(t*L.sp*0.85+L.ph)*L.ay + my*L.depth)*q;
      var ir=Math.sin(t*0.55+L.ph)*5*q;
      L.el.style.transform='translate('+((L.ox*q)+ix).toFixed(1)+'px,'+((L.oy*q)+iy).toFixed(1)+'px) rotate('+((L.rot*q)+ir).toFixed(1)+'deg) scale('+(1+(L.sc-1)*q).toFixed(3)+')';
      L.el.style.opacity=((0.16+0.84*e)*fo).toFixed(2);
    });
    subcta.style.opacity=(Math.max(0,(e-0.75)/0.25)*fo).toFixed(2);
    cue.style.opacity=Math.max(0,1-scrollY/200).toFixed(2);
    // "the essentials" — one timeline (tl) eases toward a scroll-set target, so it plays forward AND reverses on the way up
    var vh=innerHeight, trig=vh*1.35;
    if(scrollY>trig) tlTarget=1; else if(scrollY<vh*1.05) tlTarget=0;        // hysteresis band avoids flicker
    if(step>0) tlTarget=1;                                                   // once inside the form, keep the dark panel up
    var stepAmt=dt/((tl>tlTarget)?TL_BACK:TL_FWD);
    if(tl<tlTarget) tl=Math.min(tlTarget,tl+stepAmt); else if(tl>tlTarget) tl=Math.max(tlTarget,tl-stepAmt);
    // whip crossing (tl 0 -> 0.62), ease-in-out
    var we=easeIO(Math.max(0,Math.min(1,tl/0.62)));
    var edge=104-we*108;
    get.style.clipPath='polygon('+(edge-4).toFixed(1)+'% 0, 100% 0, 100% 100%, '+(edge+4).toFixed(1)+'% 100%)';
    topBar.classList.toggle('onDark',we>0.5);
    progressEl.classList.toggle('onDark',we>0.5);
    pfill.style.height=(Math.max(0,Math.min(1,scrollY/(document.body.scrollHeight-innerHeight)))*100).toFixed(2)+'%';
    // warm sunset glow behind the heading — fades in with the reveal + a slow breathing pulse
    var glowRev=easeS(Math.max(0,Math.min(1,(tl-0.45)/0.4)));
    getGlow.style.opacity=(glowRev*(0.82+0.18*Math.sin(t*0.55))).toFixed(3);
    getGlow.style.transform='translate('+(mx*-26*glowRev).toFixed(1)+'px,'+(my*-16*glowRev).toFixed(1)+'px) scale('+(1+0.05*Math.sin(t*0.4)).toFixed(3)+')';
    // floating website/business/analytics icons — idle drift + parallax, fade in with the section
    var bgRev=easeS(Math.max(0,Math.min(1,(tl-0.4)/0.45)));
    bgIcons.forEach(function(B){
      var ix=Math.sin(t*B.sp+B.ph)*B.ax + mx*B.depth;
      var iy=Math.cos(t*B.sp*0.85+B.ph)*B.ay + my*B.depth;
      var ir=B.rot+Math.sin(t*B.rsp+B.ph)*5;
      B.el.style.transform='translate('+ix.toFixed(1)+'px,'+iy.toFixed(1)+'px) rotate('+ir.toFixed(1)+'deg)';
      B.el.style.opacity=(B.base*bgRev).toFixed(3);
    });
    // number balls fly in from the dark (tl 0.55 -> 0.87), then keep gently living (idle float + cursor drift)
    getCards.forEach(function(card,i){
      var num=card.querySelector('.num'); var OL=orbLife[i];
      var bp=Math.max(0,Math.min(1,(tl-0.55-i*0.05)/0.22)); var be=easeS(bp);
      var lx=(Math.sin(t*OL.sp+OL.ph)*OL.ax + mx*OL.depth)*be;
      var ly=(Math.cos(t*OL.sp*0.8+OL.ph)*OL.ay + my*OL.depth)*be;
      num.style.transform='translate('+lx.toFixed(1)+'px,'+(((1-be)*54)+ly).toFixed(1)+'px) scale('+(0.15+0.85*be).toFixed(3)+')';
      num.style.opacity=be.toFixed(2);
      num.style.filter='blur('+((1-be)*8).toFixed(1)+'px)';
    });
    // text fades in right on the whip's heels (tl 0.62 -> 1)
    var te=easeS(Math.max(0,Math.min(1,(tl-0.62)/0.38)));
    getKick.style.opacity=te.toFixed(2);
    getKick.style.transform='translate('+(mx*20*te).toFixed(1)+'px,'+(my*13*te).toFixed(1)+'px)';
    getH.style.opacity=te.toFixed(2);
    getH.style.transform='translate('+(mx*12*te).toFixed(1)+'px,'+(((1-te)*16)+my*8*te).toFixed(1)+'px)';
    getCards.forEach(function(card){
      var h3=card.querySelector('h3'),pp=card.querySelector('p');
      h3.style.opacity=te.toFixed(2); h3.style.transform='translate('+(mx*8*te).toFixed(1)+'px,'+(((1-te)*10)+my*5*te).toFixed(1)+'px)';
      pp.style.opacity=te.toFixed(2); pp.style.transform='translate('+(mx*6*te).toFixed(1)+'px,'+(((1-te)*13)+my*4*te).toFixed(1)+'px)';
    });
    if(essGo){ essGo.style.opacity=te.toFixed(2); essGo.style.transform = te<0.999 ? 'translateY('+((1-te)*12).toFixed(1)+'px)' : ''; }
    _mainRaf=requestAnimationFrame(loop);
  }
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){setup();_mainRaf=requestAnimationFrame(loop);autoDrop();});
  on(window,'resize',setup);

  // auto-drop to the assembled section after a beat — spring-timed (react-spring feel), yields to the user
  var userMoved=false, scrollRAF=null;
  function smoothScrollTo(target,dur){                        // custom glide with a controllable (slower) duration
    if(scrollRAF)cancelAnimationFrame(scrollRAF);
    var start=scrollY,dist=target-start,t0=null;
    function step(ts){ if(t0==null)t0=ts; var p=Math.min(1,(ts-t0)/dur);
      var e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;             // ease-in-out cubic
      window.scrollTo(0,start+dist*e);
      scrollRAF = p<1 ? requestAnimationFrame(step) : null; }
    scrollRAF=requestAnimationFrame(step);
  }
  ['wheel','touchstart','keydown'].forEach(function(ev){on(window,ev,function(){userMoved=true;if(scrollRAF){cancelAnimationFrame(scrollRAF);scrollRAF=null;}},{passive:true});});
  // jump straight into the intake form (skip the scroll journey) — used by the hero CTA + the always-on top button
  function jumpToForm(){
    track('cta_start_project');
    userMoved=true;
    if(scrollRAF){cancelAnimationFrame(scrollRAF);scrollRAF=null;}
    window.scrollTo(0, Math.max(window.scrollY, innerHeight*1.5));   // land past the trigger so state stays consistent
    showStep(1);
  }
  var startBtn=document.querySelector('.subcta .go');
  if(startBtn)startBtn.addEventListener('click',jumpToForm);
  var topCta=document.getElementById('topCta');
  if(topCta)topCta.addEventListener('click',jumpToForm);
  var chaosEl=document.querySelector('.chaos');   // click 'got a website?' -> glide to the 'let's build one' beat
  if(chaosEl)chaosEl.addEventListener('click',function(){userMoved=true;smoothScrollTo(innerHeight*1.02,1800);});
  function autoDrop(){
    setTimeout(function(){
      if(userMoved||scrollY>12)return;
      var target=innerHeight*1.02,pos=scrollY,vel=0,k=30,d=11,dt=1/60;   // very soft spring = slow, cinematic glide
      (function step(){
        if(_stopped||userMoved)return;
        var a=-k*(pos-target)-d*vel; vel+=a*dt; pos+=vel*dt;
        if(pos<0){pos=0;vel=0;}
        window.scrollTo(0,pos);
        if(Math.abs(pos-target)<0.5&&Math.abs(vel)<1){window.scrollTo(0,target);return;}
        requestAnimationFrame(step);
      })();
    },1400);
  }
  return function cleanup(){
    _stopped=true;
    cancelAnimationFrame(_mainRaf);
    if(scrollRAF) cancelAnimationFrame(scrollRAF);
    _listeners.forEach(function(l){ l[0].removeEventListener(l[1],l[2],l[3]); });
    if(window.turnstile&&_tsId!==null){try{window.turnstile.remove(_tsId);}catch(e){}}
    document.body.style.overflow='';
  };
}
