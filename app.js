(() => {
  'use strict';
  const lang = document.documentElement.lang || 'tr';
  const data = window.HAFSA && {...window.HAFSA,...window.HAFSA.locales?.[lang]};
  const words={tr:{pause:'Hareketi durdur',resume:'Hareketi başlat',intro:'Merhaba Hafsa, ',game:' etkinliği hakkında konuşmak istiyorum. Dil tercihim: ',languages:{tr:'Türkçe',en:'İngilizce',fr:'Fransızca'},storiesPause:'Geçişleri durdur',storiesPlay:'Geçişleri başlat'},en:{pause:'Pause motion',resume:'Resume motion',intro:'Hello Hafsa, I’d like to discuss ',game:'. Preferred play language: ',languages:{tr:'Turkish',en:'English',fr:'French'},storiesPause:'Pause stories',storiesPlay:'Play stories'},fr:{pause:'Arrêter les animations',resume:'Reprendre les animations',intro:'Bonjour Hafsa, j’aimerais parler de ',game:'. Langue de jeu souhaitée : ',languages:{tr:'turc',en:'anglais',fr:'français'},storiesPause:'Mettre en pause',storiesPlay:'Reprendre les témoignages'}}[lang];
  const motionButton = document.querySelector('#motion');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  function setMotion() {
    document.documentElement.dataset.motion = paused ? 'paused' : 'running';
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.lastChild.textContent = ' '+(paused ? words.resume : words.pause);
    }
    document.dispatchEvent(new Event('hafsamotionchange'));
  }
  if (motionButton) motionButton.addEventListener('click', () => { paused = !paused; setMotion(); });
  preference.addEventListener('change', event => { paused = event.matches; setMotion(); });
  setMotion();
  const referenceSection=document.querySelector('.references');
  if(referenceSection){
    const items=[...referenceSection.querySelectorAll('.reference-item')];
    const controls=referenceSection.querySelector('.reference-controls');
    if(items.length>1&&controls){
      let active=0,autoplay=!preference.matches,timer=null,inView=false,hovered=false;
      const toggle=controls.querySelector('.reference-autoplay');
      const count=controls.querySelector('.reference-count');
      const show=(next,manual=false)=>{
        items[active].hidden=true;active=(next+items.length)%items.length;items[active].hidden=false;
        count.setAttribute('aria-live',manual?'polite':'off');count.textContent=(active+1)+' / '+items.length;
        if(!paused&&!preference.matches)items[active].animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});
      };
      const sync=()=>{clearInterval(timer);timer=null;toggle.textContent=autoplay?words.storiesPause:words.storiesPlay;toggle.setAttribute('aria-pressed',String(autoplay));if(autoplay&&!paused&&!preference.matches&&inView&&!document.hidden&&!hovered&&!referenceSection.contains(document.activeElement))timer=setInterval(()=>show(active+1),7000);};
      items.forEach((item,i)=>{item.hidden=i!==0;});controls.hidden=false;
      controls.querySelector('.reference-prev').addEventListener('click',()=>{show(active-1,true);sync();});
      controls.querySelector('.reference-next').addEventListener('click',()=>{show(active+1,true);sync();});
      toggle.addEventListener('click',()=>{autoplay=!autoplay;sync();});
      referenceSection.addEventListener('mouseenter',()=>{hovered=true;sync();});referenceSection.addEventListener('mouseleave',()=>{hovered=false;sync();});
      referenceSection.addEventListener('focusin',sync);referenceSection.addEventListener('focusout',()=>setTimeout(sync,0));
      document.addEventListener('visibilitychange',sync);document.addEventListener('hafsamotionchange',sync);
      new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.25}).observe(referenceSection);sync();
    }
  }
  const menu = document.querySelector('#menu-toggle');
  if(menu) {
    menu.hidden = false;
    document.documentElement.classList.add('has-menu');
    const close = () => { menu.setAttribute('aria-expanded','false'); document.querySelector('#navigation').classList.remove('open'); };
    menu.addEventListener('click',()=>{ const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); document.querySelector('#navigation').classList.toggle('open',open); });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus();}});
    document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('click',e=>{if(!e.target.closest('.header'))close();});
  }
  const chooser=document.querySelector('.chooser');
  if(!chooser || !data) return;
  chooser.hidden=false;
  const initialLanguage=chooser.querySelector(`[name="language"][value="${lang}"]`);
  if(initialLanguage)initialLanguage.checked=true;
  let index=0;
  function update() {
    const interest=chooser.querySelector('[name="interest"]:checked').value;
    const language=chooser.querySelector('[name="language"]:checked').value;
    const items=data.activities.filter(a=>a.interest===interest);
    const a=items[index%items.length];
    document.querySelector('#suggestion-title').textContent=a.title;
    document.querySelector('#suggestion-description').textContent=a.description;
    const phrase=document.querySelector('#suggestion-language');
    phrase.textContent='“'+a[language]+'”'; phrase.lang=language;
    document.querySelector('#suggestion-art').className='activity-art art-'+a.art;
    document.querySelector('#suggestion-contact').href='https://wa.me/'+data.profile.whatsapp+'?text='+encodeURIComponent(words.intro+a.title+words.game+words.languages[language]+'.');
  }
  chooser.addEventListener('change',()=>{index=0;update();});
  document.querySelector('#another').addEventListener('click',()=>{index++;update();});
  update();
})();
