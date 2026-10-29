(()=>{'use strict';
const D=window.GAME_DATA,C=window.GAME_CONFIG,main=document.getElementById('main');
const storeKey='halloween-gem-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(storeKey)||'{}')}catch(e){};
const state={unlocked:Array.isArray(saved.unlocked)?saved.unlocked:[],notebookRead:!!saved.notebookRead,solved:!!saved.solved,tab:'rooms',view:'list',person:null,item:null,detail:null,scrolls:{},scanner:null};
const phoneReady=()=>state.unlocked.includes('testimony-05');
const letterReady=()=>state.solved && [...D.rooms,...D.testimonies].every(x=>state.unlocked.includes(x.id));
const all=[...D.rooms,...D.testimonies],byId=Object.fromEntries(all.map(x=>[x.id,x]));
const codeToId=Object.fromEntries(Object.entries(C.unlockCodes).map(([id,code])=>[code,id]));
const persist=()=>{try{localStorage.setItem(storeKey,JSON.stringify({unlocked:state.unlocked,notebookRead:state.notebookRead,solved:state.solved}))}catch(e){}};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const add=(parent,...children)=>{children.forEach(c=>parent.append(c));return parent};
const button=(text,cls,fn)=>{let b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b};
function toast(msg){let t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3500)}
function paragraphText(target,text){const pieces=text.split(/(?<=。)/u);pieces.forEach(s=>{if(s){const p=el('p','',s);target.append(p)}})}
function stopScan(){if(state.scanner){state.scanner.getTracks().forEach(t=>t.stop());state.scanner=null}}
function navigate(view='list',opts={}){stopScan();if(state.view==='list'&&view!=='list')state.scrolls[state.tab]=window.scrollY;state.view=view;state.detail=opts.detail||null;state.person=opts.person??state.person;state.item=opts.item??null;render();if(view==='list'&&opts.restore)window.scrollTo(0,state.scrolls[state.tab]||0);else window.scrollTo(0,0)}
function setTab(tab){state.tab=tab;state.person=null;state.item=null;navigate('list')}
function unlock(raw){let val=String(raw||'').trim();try{const u=new URL(val,location.href);val=u.searchParams.get('unlock')||val}catch(e){};const id=codeToId[val.toUpperCase()];if(!id){toast('この解放コードは登録されていません。');return false}if(byId[id].special){toast('この証言は電話で入手できます。');return false}val=id;const fresh=!state.unlocked.includes(val);if(fresh)state.unlocked.unshift(val);persist();if(fresh)toast('新しい情報を入手しました！');else toast('この情報は入手済みです。');state.tab=val.startsWith('room-')?'rooms':'testimonies';navigate('detail',{detail:val});return true}
function commonBack(fn){main.append(button('← 戻る','back',fn))}
function header(title,count){let h=el('div','section-head');add(h,el('h2','',title),el('span','count',count));main.append(h)}
function listTile(title,subtitle,fn,extra){let b=button('','tile'+(extra?.locked?' locked':''),fn);if(extra?.image){let img=el('img','mini-icon');img.src='assets/'+extra.image+'.webp';img.alt='';b.append(img)}else b.append(el('span','',extra?.locked?'🔒':'✦'));let label=el('span','tile-title',title);if(subtitle)label.append(el('span','hint',subtitle));if(extra?.special)label.append(el('span','pill','特別な証言'));add(b,label,el('span','chevron','›'));return b}
function renderList(){let hero=el('section','hero');add(hero,el('div','pumpkin','🎃'),el('div','eyebrow','HALLOWEEN MYSTERY'),el('h1','','絵画からの宝石盗難事件'),el('p','','手がかりを集め、事件の真相を解き明かそう。'));main.append(hero);
if(state.tab!=='people'){let controls=el('div','scanbar');controls.append(button('▣ QRコードを読み取る','primary',()=>navigate('scan')));main.append(controls)}
if(state.tab==='people'){header('人物情報','7人');let wrap=el('div','stack');D.people.forEach((p,i)=>wrap.append(listTile(p.name,p.costume,()=>navigate('person',{person:i}),{image:p.image})));main.append(wrap);return}
const list=state.tab==='rooms'?D.rooms:D.testimonies,found=state.unlocked.filter(id=>list.some(x=>x.id===id));header(state.tab==='rooms'?'部屋の情報':'証言',`${found.length} / ${list.length} 件解放`);let wrap=el('div','stack');found.forEach(id=>{let x=byId[id];wrap.append(listTile(x.title,'確認する',()=>navigate('detail',{detail:id}),{special:x.special}))});list.filter(x=>!state.unlocked.includes(x.id)).forEach(x=>wrap.append(listTile('？？？？？','QRコードで解放',()=>toast('現地のQRコードを読み取ってください。'),{locked:true})));main.append(wrap)}
function renderDetail(){let x=byId[state.detail];commonBack(()=>navigate('list',{restore:true}));if(!x){main.append(el('p','','情報が見つかりません。'));return}let paper=el('article','paper'+(x.special?' special-paper':''));paper.append(el('h2','',x.title));if(x.text)paragraphText(paper,x.text);else x.lines.forEach(line=>{let d=el('div','dialogue'+(x.special?' special':''));d.append(el('div','speaker',line.speaker));paragraphText(d,line.text);paper.append(d)});main.append(paper)}
function renderPerson(){let p=D.people[state.person];commonBack(()=>navigate('list',{restore:true}));let hero=el('div','character-hero'),img=el('img');img.src='assets/'+p.image+'.webp';img.alt=p.costume+'のアイコン';let name=el('div');add(name,el('h2','',p.name),el('small','',p.costume));add(hero,img,name);main.append(hero);header('所持品',p.items.length+'件');let wrap=el('div','stack');p.items.forEach((x,i)=>wrap.append(listTile(x.title,'詳細を見る',()=>navigate('item',{person:state.person,item:i}))));main.append(wrap)}
function renderItem(){let p=D.people[state.person],x=p.items[state.item];commonBack(()=>navigate('person',{person:state.person}));let paper=el('article','paper');paper.append(el('h2','',x.title));paragraphText(paper,x.text);main.append(paper)}
function renderScan(){
 commonBack(()=>navigate('list',{restore:true}));header('QRコードを読み取る','');
 let box=el('div','paper');box.append(el('p','muted','QRコードを枠内に映してください。読み取れない場合は、通常のカメラでQRを開くか、解放コードを入力してください。'));
 let holder=el('div','video-wrap'),video=el('video');video.autoplay=true;video.muted=true;video.playsInline=true;holder.append(video,el('div','scan-outline'));box.append(holder);
 let status=el('p','muted small','カメラを起動しています…');box.append(status);
 let code=el('input');code.placeholder='6文字の解放コード';code.setAttribute('aria-label','解放コード');box.append(code,button('コードで解放','secondary',()=>unlock(code.value)));main.append(box);
 if(!navigator.mediaDevices?.getUserMedia){status.textContent='カメラを利用できません。HTTPS接続とカメラの許可を確認してください。';return}
 (async()=>{try{
  let stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
  if(state.view!=='scan'){stream.getTracks().forEach(t=>t.stop());return}
  state.scanner=stream;video.srcObject=stream;await video.play();
  let detector=null;if('BarcodeDetector'in window){try{detector=new BarcodeDetector({formats:['qr_code']})}catch(e){}}
  let canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  status.textContent='QRコードをカメラの枠内に合わせてください。';
  let attempts=0;
  const tick=async()=>{
   if(state.view!=='scan'||!state.scanner)return;
   try{
    let raw=null;
    if(detector){let found=await detector.detect(video);if(found.length)raw=found[0].rawValue}
    if(!raw&&typeof window.jsQR==='function'&&video.readyState>=2){
     let w=video.videoWidth,h=video.videoHeight;
     if(w&&h){let scale=Math.min(1,640/w);canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);ctx.drawImage(video,0,0,canvas.width,canvas.height);let pixels=ctx.getImageData(0,0,canvas.width,canvas.height);let found=window.jsQR(pixels.data,canvas.width,canvas.height,{inversionAttempts:'attemptBoth'});if(found)raw=found.data}
    }
    if(raw&&unlock(raw))return;
    if(++attempts===20&&!detector&&typeof window.jsQR!=='function')status.textContent='QR読み取りライブラリを読み込めませんでした。通信状態を確認するか、通常のカメラでQRを開いてください。';
   }catch(e){}
   setTimeout(tick,250)
  };tick();
 }catch(e){status.textContent='カメラを起動できませんでした。ブラウザのカメラ許可とHTTPS接続をご確認ください。'} })()
}
function renderPhone(){commonBack(()=>navigate('list',{restore:true}));header('電話','');if(!phoneReady()){main.append(el('p','muted','電話はまだ使用できません。『使用人の証言③』を確認してください。'));return}let panel=el('div','phone-screen'),p=el('p','muted center','調査で見つけた電話番号を入力してください。'),num=el('input','phone-number');num.type='tel';num.inputMode='tel';num.placeholder='電話番号';panel.append(p,num);let msg=el('p','muted center small','');panel.append(button('☎ 電話をかける','primary',()=>{const digits=num.value.replace(/[^0-9]/g,'');if(!digits){msg.textContent='電話番号を入力してください。';return}const id=C.phoneNumbers[digits];if(!id||!byId[id]){msg.textContent='おかけになった電話番号は現在使われておりません。';return}if(!state.unlocked.includes(id))state.unlocked.unshift(id);persist();toast('電話で新しい証言を入手しました！');state.tab='testimonies';navigate('detail',{detail:id})}));panel.append(msg);main.append(panel)}
function renderLetter(){
 commonBack(()=>navigate('list',{restore:true}));
 if(!letterReady()){header('秘密の手紙','🔒');main.append(el('p','muted','この手紙はまだ封印されています。事件を解決し、部屋の情報と証言をすべて集めると読むことができます。'));return}
 header('秘密の手紙','✉');let paper=el('article','paper secret-letter');paper.append(el('h2','','✉ ある手紙'));
 D.secretLetter.forEach(line=>{
  if(line.type==='heading'){paper.append(el('div','letter-heading',line.text));return}
  if(line.type==='letter'){let note=el('div','letter-body');paragraphText(note,line.text);paper.append(note);return}
  let block=el('div','dialogue');block.append(el('div','speaker',line.speaker));paragraphText(block,line.text);paper.append(block)
 });main.append(paper)
}
function renderDeduce(){commonBack(()=>navigate('list',{restore:true}));header('真相解明','');let paper=el('div','paper');paper.append(el('p','muted','事件の真相を推理して回答してください。'));let fields=[['犯人の名前','text'],['犯行手口','textarea'],['現在宝石が隠されているところは？','text']],inputs=[];fields.forEach(([label,type])=>{let f=el('div','field'),l=el('label','',label),i=el(type==='textarea'?'textarea':'input');i.placeholder=label;i.setAttribute('aria-label',label);if(type==='text')i.type='text';add(f,l,i);paper.append(f);inputs.push(i)});let error=el('p','error');paper.append(error);paper.append(button('推理を回答する','primary',()=>{let [n,m,p]=inputs.map(x=>x.value.trim());if(!n||!m||!p){error.textContent='3つの項目をすべて入力してください。';return}if(!['サフィール','さふぃーる','焔サフィール'].includes(n)){error.textContent='和問：惜しいようですが、正解ではないようです。';return}state.solved=true;persist();navigate('ending')}));main.append(paper)}
function renderEnding(){if(!state.solved){navigate('deduce');return}header('真相解明成功！','');main.append(el('div','ending-title','✦ エンディング ✦'));let content=el('div');D.ending.forEach((line,i)=>{if(line.speaker==='scene'){content.append(el('div','scene',line.text));return}let row=el('div','story-row'+(line.speaker==='焔'?' homura':'')),bubble=el('div','story-bubble');if(line.speaker==='焔'||line.speaker==='和問'){let img=el('img');img.src='assets/'+(line.speaker==='焔'?'homura':'wakato')+'.webp';img.alt=line.speaker;row.append(img)}else{row.classList.add('flashback')}bubble.append(el('b','',line.speaker),el('p','',line.text));row.append(bubble);content.append(row)});main.append(content);let reward=el('div','reward','🎁 真相解明の報酬に缶バッチがもらえるから、ぜひ貰ってくれ！');main.append(reward,button('情報一覧に戻る','secondary',()=>navigate('list')))}
function render(){main.replaceChildren();document.querySelectorAll('.nav').forEach(b=>{b.classList.toggle('active',b.dataset.tab===state.tab);b.setAttribute('aria-current',b.dataset.tab===state.tab?'page':'false')});document.getElementById('phoneBtn').hidden=!phoneReady();let letterBtn=document.getElementById('letterBtn');letterBtn.classList.toggle('sealed',!letterReady());letterBtn.setAttribute('aria-label',letterReady()?'秘密の手紙を読む':'秘密の手紙（未解放）');document.getElementById('letterLock').hidden=letterReady();switch(state.view){case'list':renderList();break;case'detail':renderDetail();break;case'person':renderPerson();break;case'item':renderItem();break;case'scan':renderScan();break;case'phone':renderPhone();break;case'letter':renderLetter();break;case'deduce':renderDeduce();break;case'ending':renderEnding();break;default:renderList()}}
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));document.getElementById('homeBtn').addEventListener('click',()=>navigate('list'));document.getElementById('phoneBtn').addEventListener('click',()=>navigate('phone'));document.getElementById('letterBtn').addEventListener('click',()=>{if(letterReady())navigate('letter');else toast('この手紙はまだ封印されています。真相解明と全情報の入手が必要です。')});document.getElementById('deduceBtn').addEventListener('click',()=>navigate('deduce'));
// URL に ?unlock=6文字の解放コードを付けた QR を読み込むと自動で解放する。
const params=new URLSearchParams(location.search),id=params.get('unlock');if(id){history.replaceState(null,'',location.pathname+location.hash);setTimeout(()=>unlock(id),80)}render();
})();
