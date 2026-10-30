/* SuhuDelhi: logika tampilan. Data diambil dari API Flask (/api/*). */
const CFG={ts:30,max:30};
const $=id=>document.getElementById(id),MON=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const STOPS=[[5,[59,130,246]],[15,[34,211,238]],[22,[253,224,71]],[30,[251,146,60]],[38,[239,68,68]]];
const S={unit:'C',days:7,hist:180,mode:'line',rng:0,tol:1,sel:-1},ch={},DATA={};
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
function heat(t){if(t<=5)return STOPS[0][1];for(let i=1;i<STOPS.length;i++)if(t<=STOPS[i][0]){const[a,c0]=STOPS[i-1],[b,c1]=STOPS[i],f=(t-a)/(b-a);return c0.map((v,k)=>v+(c1[k]-v)*f)}return STOPS[4][1]}
const rgb=(c,a)=>a==null?`rgb(${c.map(Math.round).join(',')})`:`rgba(${c.map(Math.round).join(',')},${a})`;
const textOn=c=>(.299*c[0]+.587*c[1]+.114*c[2])>150?'#2b2100':'#fff';
const feel=t=>t<15?'dingin':t<22?'sejuk':t<30?'hangat':'panas';
const emo=t=>t<12?'\u{1F976}':t<20?'\u{1F324}️':t<28?'☀️':t<34?'\u{1F975}':'\u{1F525}';
const cv=v=>S.unit==='C'?v:v*1.8+32,cd=v=>S.unit==='C'?v:v*1.8,UN=()=>'°'+S.unit;
const f1=v=>v.toFixed(1),F=v=>f1(cv(v)),FD=v=>f1(cd(v)),sg=v=>(v>0?'+':v<0?'−':'')+Math.abs(cd(v)).toFixed(1),mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const P=s=>new Date(s+'T00:00:00'),L=s=>P(s).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),Sh=s=>P(s).toLocaleDateString('id-ID',{day:'numeric',month:'short'}),Dy=s=>P(s).toLocaleDateString('id-ID',{weekday:'short'});
async function J(u){const r=await fetch(u),j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||r.statusText);return j}
const exp=(id,title,items)=>{$(id).innerHTML=`<b class="h">${title}</b><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`};
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function pal(){const d=document.documentElement.dataset.theme==='dark';return{ink:d?'#f1edff':'#241f4a',tc:d?'#a9a3d6':'#6b6894',gc:d?'rgba(180,170,255,.13)':'rgba(80,60,160,.10)',card:css('--card'),dark:d}}
function opt(y){const p=pal();return{responsive:true,maintainAspectRatio:false,animation:{duration:still?0:700},interaction:{mode:'index',intersect:false},
 plugins:{legend:{labels:{color:p.ink,usePointStyle:true,boxWidth:8}},tooltip:{backgroundColor:p.dark?'#0e0a24':'#241f4aee',padding:10,cornerRadius:10,titleFont:{weight:'700'}}},
 scales:{x:{ticks:{color:p.tc,maxTicksLimit:8,maxRotation:0},grid:{color:p.gc}},y:{title:{display:true,text:y,color:p.tc},ticks:{color:p.tc},grid:{color:p.gc}}}}}
const area=(c0,c1)=>ctx=>{const a=ctx.chart.chartArea;if(!a)return c1;const g=ctx.chart.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,c0);g.addColorStop(1,c1);return g};
function draw(id,cfg){if(ch[id])ch[id].destroy();ch[id]=new Chart($(id),cfg)}
const tipT=c=>`${c.dataset.label||''}: ${f1(c.parsed.y)}${UN()}`;
function countUp(el,to,fmt,suffix){fmt=fmt||f1;suffix=suffix||'';if(still){el.textContent=fmt(to)+suffix;return}const from=parseFloat(el.textContent)||0,t0=performance.now();(function s(n){const p=Math.min(1,(n-t0)/800),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e)+suffix;if(p<1)requestAnimationFrame(s)})(t0)}
function pressed(id,v){$(id).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v==String(v)))}


/* ---------- hero ---------- */
function renderHero(){const h=DATA.h,f=DATA.f;if(!h||!f)return;
 const last=h.values.at(-1),nx=f.values[0],c=heat(nx);
 document.documentElement.style.setProperty('--heat',rgb(c));
 $('now-lbl').textContent='Hari berikutnya, '+L(f.dates[0]);countUp($('now-val'),cv(nx));$('now-u').textContent=UN();
 $('now-emo').textContent=emo(nx);$('now-feel').textContent='Terasa '+feel(nx);
 $('now-delta').textContent=`${sg(nx-last)}${UN()} dari data terakhir (${F(last)}${UN()})`;
 $('dot').style.left=Math.max(0,Math.min(1,(nx-5)/33))*100+'%';
 $('sc1').textContent=Math.round(cv(5))+UN();$('sc2').textContent=Math.round(cv(20))+UN();$('sc3').textContent=Math.round(cv(38))+UN();
 $('mini').innerHTML=f.values.slice(0,5).map((v,i)=>`<div>${Dy(f.dates[i])}<b>${Math.round(cv(v))}°</b><span>${emo(v)}</span></div>`).join('')}

/* ---------- forecast ---------- */
function renderForecast(){const h=DATA.h,f=DATA.f;if(!h||!f)return;const p=pal();
 const last=h.values.at(-1),n=f.values.length,nx=f.values[0],fin=f.values[n-1],avg=mean(f.values);let prev=last;
 $('tiles').innerHTML=f.dates.map((d,i)=>{const v=f.values[i],c=heat(v),df=v-prev;prev=v;return`<button class="tile" data-i="${i}" style="background:${rgb(c)};color:${textOn(c)};animation-delay:${Math.min(i,20)*35}ms" aria-label="Sorot ${L(d)}"><div class="a">${Dy(d)}</div><div class="b">${Sh(d)}</div><div class="e">${emo(v)}</div><div class="t">${Math.round(cv(v)*10)/10}°</div><div class="c">${df>=0?'▲':'▼'} ${FD(Math.abs(df))}</div></button>`}).join('');
 const mx=Math.max(...f.values),mn=Math.min(...f.values),dmx=f.dates[f.values.indexOf(mx)],dmn=f.dates[f.values.indexOf(mn)],d=fin-last;
 const tr=d>.5?'naik':d<-.5?'turun':'relatif stabil';
 const items=[`Garis ungu adalah suhu historis, ${S.mode==='bar'?'batang':'garis putus-putus koral'} adalah prakiraan ${n} hari. Warnanya sesuai suhu.`,
  `Suhu diperkirakan <b>${tr}</b> dari ${F(last)}${UN()} (${Sh(h.last_date)}) menjadi ${F(fin)}${UN()} (${Sh(f.dates[n-1])}), selisih ${sg(d)}${UN()}.`];
 if(n>1)items.push(`Rata-rata prakiraan ${F(avg)}${UN()} (terasa ${feel(avg)}), tertinggi ${F(mx)}${UN()} pada ${Sh(dmx)}, terendah ${F(mn)}${UN()} pada ${Sh(dmn)}.`);
 if(DATA.mo){const mo=P(f.dates[0]).getMonth(),ref=DATA.mo[mo],dd=avg-ref;
  items.push(Math.abs(dd)<.5?`Angka ini sejalan dengan rata-rata historis bulan ${MON[mo]} (${F(ref)}${UN()}).`:`Rata-rata prakiraan ${FD(Math.abs(dd))}${UN()} ${dd>0?'lebih hangat':'lebih sejuk'} dari rata-rata historis bulan ${MON[mo]} (${F(ref)}${UN()}).`)}
 if(n>14)items.push('Untuk horizon sepanjang ini, anggap angka di ujung sebagai gambaran tren, bukan angka pasti: galat menumpuk karena tiap prediksi dipakai lagi sebagai input.');
 else items.push('Tanggal prakiraan mengikuti akhir dataset, bukan tanggal hari ini.');
 exp('exp-fc','Cara membaca grafik ini',items);
 const nh=h.values.length,cols=f.values.map(v=>rgb(heat(v))),bar=S.mode==='bar';
 const fd=bar?{type:'bar',label:'Prakiraan',data:[...Array(nh).fill(null),...f.values.map(cv)],backgroundColor:cols,borderRadius:10,borderSkipped:false,order:1}
  :{type:'line',label:'Prakiraan',data:[...Array(nh-1).fill(null),cv(last),...f.values.map(cv)],borderColor:'#ff5a5f',borderWidth:3,borderDash:[7,5],tension:.25,pointRadius:n>14?3:6,pointHoverRadius:9,pointBackgroundColor:[...'x'.repeat(nh).split('').map(()=>'transparent'),...cols],pointBorderColor:'#fff',pointBorderWidth:2};
 const o=opt('Suhu rata-rata ('+UN()+')');o.plugins.tooltip.callbacks={label:tipT};
 {const all=[...h.values,...f.values].map(cv);o.scales.y.min=Math.floor(Math.min(...all)-1);o.scales.y.max=Math.ceil(Math.max(...all)+1)}
 draw('cMain',{type:'line',data:{labels:[...h.dates,...f.dates],datasets:[
  {type:'line',label:'Historis',data:[...h.values.map(cv),...Array(n).fill(null)],borderColor:'#8b5cf6',borderWidth:2.5,pointRadius:0,tension:.25,fill:true,backgroundColor:area('rgba(139,92,246,.4)','rgba(139,92,246,.02)')},fd]},options:o});
 S.sel=-1}
$('tiles').addEventListener('click',e=>{const b=e.target.closest('.tile');if(!b||!ch.cMain)return;const i=+b.dataset.i,nh=DATA.h.values.length,c=ch.cMain;
 document.querySelectorAll('.tile').forEach(x=>x.classList.toggle('sel',x===b&&S.sel!==i));
 if(S.sel===i){S.sel=-1;c.setActiveElements([]);c.tooltip.setActiveElements([],{x:0,y:0})}
 else{S.sel=i;const a=[{datasetIndex:1,index:nh+i}],bb=c.getDatasetMeta(1).data[nh+i];c.setActiveElements(a);if(bb)c.tooltip.setActiveElements(a,{x:bb.x,y:bb.y})}
 c.update()});

/* ---------- monthly ---------- */
function renderMonthly(){const m=DATA.mi;if(!m)return;
 const hi=m.values.indexOf(Math.max(...m.values)),lo=m.values.indexOf(Math.min(...m.values)),r=m.values[hi]-m.values[lo];
 const o=opt('Suhu rata-rata ('+UN()+')');o.plugins.legend.display=false;o.plugins.tooltip.callbacks={label:c=>`${f1(c.parsed.y)}${UN()}`};o.scales.x.ticks={color:pal().tc,autoSkip:false,maxRotation:55,minRotation:0,font:{size:innerWidth<700?10:12}};
 draw('cMonth',{type:'bar',data:{labels:m.months.map(i=>MON[i-1]),datasets:[{label:'Rata-rata suhu',data:m.values.map(cv),backgroundColor:m.values.map(v=>rgb(heat(v))),borderRadius:12,borderSkipped:false}]},options:o});
 exp('exp-mo','Apa artinya?',[`Bulan terpanas adalah <b>${MON[m.months[hi]-1]}</b> (${F(m.values[hi])}${UN()}) dan terdingin <b>${MON[m.months[lo]-1]}</b> (${F(m.values[lo])}${UN()}), selisih musiman ${FD(r)}${UN()}.`,
  'Pola ini berulang tiap tahun, sehingga model bisa memakainya sebagai petunjuk arah naik atau turunnya suhu.'])}

/* ---------- simulator ---------- */
const sim={s:0,timer:null};
function simData(){const h=DATA.h,f=DATA.f;if(!h||!f)return null;const ts=Math.min(CFG.ts,h.values.length);return{all:[...h.values.slice(-ts),...f.values],ts,dates:[...h.dates.slice(-ts),...f.dates]}}
function simRender(){const d=simData();if(!d)return;const{all,ts,dates}=d,n=all.length-ts;sim.s=Math.max(0,Math.min(n,sim.s));const s=sim.s;
 $('sim-win').innerHTML=all.slice(s,s+ts).map((v,i)=>{const c=heat(v),pr=s+i>=ts,nw=pr&&s+i===ts+s-1&&s>0;return`<div class="cell${pr?' p':''}" style="background:${rgb(c)};color:${textOn(c)}" title="${Sh(dates[s+i])}: ${F(v)}${UN()}">${ts<=20?Math.round(cv(v)):''}</div>`}).join('');
 const out=$('sim-out');if(s<n){const v=all[ts+s],c=heat(v);out.textContent=F(v)+UN();out.style.cssText=`background:${rgb(c)};color:${textOn(c)};border-style:solid;border-color:transparent`;
  $('sim-cap').innerHTML=`Langkah <b>${s+1}</b> dari ${n}: model membaca ${ts} hari (${Sh(dates[s])} – ${Sh(dates[s+ts-1])}) dan menebak <b>${Sh(dates[ts+s])}</b> = ${F(v)}${UN()}.`;
  const k=$('sim-core');k.classList.remove('run');void k.offsetWidth;if(!still)k.classList.add('run')}
 else{out.textContent='Selesai';out.style.cssText='';$('sim-cap').textContent=`Selesai: seluruh ${n} tebakan sudah dihitung. Jendela kini berisi ${Math.min(ts,n)} hari hasil tebakan sendiri.`;simStop()}}
function simNext(){const d=simData();if(!d)return;if(sim.s>=d.all.length-d.ts)sim.s=0;else sim.s++;simRender();if(sim.s>=d.all.length-d.ts)simStop()}
function simStop(){clearInterval(sim.timer);sim.timer=null;$('sim-play').innerHTML='▶ Putar';$('sim-play').setAttribute('aria-pressed','false')}
function simPlay(){if(sim.timer){simStop();return}const d=simData();if(!d)return;if(sim.s>=d.all.length-d.ts)sim.s=0;$('sim-play').innerHTML='⏸ Jeda';$('sim-play').setAttribute('aria-pressed','true');simRender();sim.timer=setInterval(simNext,still?1200:900)}
$('sim-play').onclick=simPlay;$('sim-step').onclick=()=>{simStop();const d=simData();if(!d)return;if(sim.s===0&&$('sim-out').textContent==='?'){simRender()}else simNext()};
$('sim-reset').onclick=()=>{simStop();sim.s=0;simRender()};

/* ---------- performance ---------- */
function renderPerf(){const m=DATA.m;if(!m)return;const n=m.test_actual.length;
 countUp($('m-rmse'),cd(m.rmse),f1,UN());countUp($('m-mae'),cd(m.mae),f1,UN());countUp($('m-naive'),cd(m.naive_rmse),f1,UN());
 const pct=(m.naive_rmse-m.rmse)/m.naive_rmse*100;
 $('m-win').textContent=pct>=1?pct.toFixed(0)+'% lebih akurat':pct>-1?'Setara':Math.abs(pct).toFixed(0)+'% di bawah';
 $('m-win-s').textContent=pct>=1?'LSTM mengalahkan tebakan sederhana':pct>-1?'Sama baiknya dengan tebakan sederhana':'Tebakan sederhana masih lebih baik';
 $('perf-sub').textContent=`Dievaluasi pada ${n} hari data uji (${L(m.test_dates[0])} sampai ${L(m.test_dates[n-1])}) yang tidak dipakai saat pelatihan.`;
 const err=m.test_pred.map((p,i)=>p-m.test_actual[i]),w=k=>err.filter(e=>Math.abs(e)<=k).length/n*100,bias=mean(err);
 const ma=mean(m.test_actual),r2=1-err.reduce((s,e)=>s+e*e,0)/m.test_actual.reduce((s,a)=>s+(a-ma)**2,0);DATA.err=err;DATA.r2=r2;
 renderTest();
 exp('exp-test','Apa artinya?',[`Rata-rata prediksi meleset <b>${FD(m.mae)}${UN()}</b> (MAE). RMSE ${FD(m.rmse)}${UN()} lebih besar sedikit karena kesalahan besar dihukum lebih berat.`,
  `Model menjelaskan sekitar <b>${(r2*100).toFixed(0)}%</b> variasi suhu pada data uji (R² = ${r2.toFixed(2)}).`,
  pct>=1?`Dibanding tebakan "sama dengan kemarin" (RMSE ${FD(m.naive_rmse)}${UN()}), LSTM ${pct.toFixed(0)}% lebih akurat.`:pct>-1?`Hasilnya setara dengan tebakan "sama dengan kemarin" (RMSE ${FD(m.naive_rmse)}${UN()}): suhu harian memang sangat mirip dengan hari sebelumnya, jadi pembanding ini sulit dikalahkan.`:`Tebakan "sama dengan kemarin" (RMSE ${FD(m.naive_rmse)}${UN()}) masih lebih baik; model perlu disetel, misalnya timesteps atau jumlah unit.`]);
 const bins=[...Array(8)].map((_,i)=>i-4),cnt=bins.map(()=>0);err.forEach(e=>{cnt[Math.max(0,Math.min(7,Math.floor(e)+4))]++});
 const eo=opt('Jumlah hari');eo.plugins.legend.display=false;eo.scales.x.title={display:true,text:'Selisih prediksi − aktual (°C)',color:pal().tc};
 eo.plugins.tooltip.callbacks={label:c=>`${c.parsed.y} hari`};
 draw('cErr',{type:'bar',data:{labels:bins.map(b=>`${b} s/d ${b+1}`),datasets:[{data:cnt,backgroundColor:bins.map(b=>{const a=Math.min(Math.abs(b),Math.abs(b+1));return a<1?'#14b8a6':a<2?'#f59e0b':'#ff5a5f'}),borderRadius:10,hoverBackgroundColor:'#8b5cf6'}]},options:eo});
 exp('exp-err','Apa artinya?',[`<b>${w(1).toFixed(0)}%</b> prediksi meleset tidak lebih dari 1°C, dan <b>${w(2).toFixed(0)}%</b> tidak lebih dari 2°C.`,
  Math.abs(bias)<.3?'Selisihnya seimbang di kedua sisi, jadi model tidak condong terlalu panas atau terlalu dingin.':`Rata-rata model cenderung menebak <b>${bias>0?'lebih panas':'lebih dingin'}</b> sekitar ${FD(Math.abs(bias))}${UN()}.`,
  'Batang hijau berarti hampir tepat, kuning cukup meleset, merah meleset jauh (ujung kiri dan kanan mencakup selisih yang lebih besar).']);
 const ov=err.filter(e=>e>0).length;
 $('over-n').textContent=`\u{1F525} Terlalu panas: ${ov} hari (${(ov/n*100).toFixed(0)}%)`;$('under-n').textContent=`❄️ Terlalu dingin: ${n-ov} hari (${((n-ov)/n*100).toFixed(0)}%)`;
 renderTol()}
function renderTest(){const m=DATA.m;if(!m)return;const k=S.rng||m.test_dates.length,sl=a=>a.slice(-k);
 const o=opt('Suhu ('+UN()+')');o.plugins.tooltip.callbacks={label:tipT};
 draw('cTest',{type:'line',data:{labels:sl(m.test_dates),datasets:[
  {label:'Aktual',data:sl(m.test_actual).map(cv),borderColor:'#06b6d4',borderWidth:2.5,pointRadius:0,pointHoverRadius:6,tension:.2,fill:true,backgroundColor:area('rgba(6,182,212,.3)','rgba(6,182,212,.01)')},
  {label:'Prediksi LSTM',data:sl(m.test_pred).map(cv),borderColor:'#f97316',borderWidth:2.5,pointRadius:0,pointHoverRadius:6,tension:.2}]},options:o})}
function renderTol(){const err=DATA.err;if(!err)return;const n=err.length,k=S.tol,ok=err.filter(e=>Math.abs(e)<=k).length,pc=ok/n*100;
 const tolTxt=`±${S.unit==='C'?k:f1(k*1.8)}°`;$('tol-val').textContent=tolTxt;$('tol-pct').textContent=pc.toFixed(0)+'%';
 $('tol-pct').style.color=pc>=80?'#14b8a6':pc>=50?'#f59e0b':'#ff5a5f';
 $('tol-sub').textContent=`${ok} dari ${n} prediksi meleset tidak lebih dari ${tolTxt.slice(1)}${S.unit}.`;
 $('chips').innerHTML=`<span class="chip">R² ${DATA.r2.toFixed(2)}</span><span class="chip">${n} hari uji</span><span class="chip">Bias ${sg(mean(err))}${UN()}</span>`;
 const o=opt('');o.plugins.legend.display=false;o.cutout='72%';o.scales={};o.interaction={};o.plugins.tooltip.callbacks={label:c=>`${c.label}: ${c.parsed} hari`};
 const col=pc>=80?'#14b8a6':pc>=50?'#f59e0b':'#ff5a5f';
 if(ch.cTol){const c=ch.cTol;c.data.datasets[0].data=[ok,n-ok];c.data.datasets[0].backgroundColor=[col,pal().dark?'#2b2263':'#ece6ff'];c.update()}
 else draw('cTol',{type:'doughnut',data:{labels:['Dalam toleransi','Di luar toleransi'],datasets:[{data:[ok,n-ok],backgroundColor:[col,pal().dark?'#2b2263':'#ece6ff'],borderWidth:0,hoverOffset:8}]},options:o})}

/* ---------- info ---------- */
function renderInfo(){const i=DATA.i;if(!i)return;const tot=i.n_train+i.n_val+i.n_test;
 $('ds-sub').textContent=`${i.rows} hari data (${L(i.first_date)} sampai ${L(i.last_date)}). Suhu berkisar ${f1(cv(i.t_min))}${UN()} sampai ${f1(cv(i.t_max))}${UN()}, rata-rata ${f1(cv(i.t_mean))}${UN()}.`;
 const seg=[['Latih',i.n_train,'#7c3aed'],['Validasi',i.n_val,'#14b8a6'],['Uji',i.n_test,'#ff5a5f']];
 $('split').innerHTML=seg.map(s=>`<div style="flex:${s[1]};background:${s[2]}" title="${s[0]}: ${s[1]} sekuens"></div>`).join('');
 $('split-lbl').innerHTML=seg.map(s=>`<span style="color:${s[2]};font-weight:700">●</span> ${s[0]} ${s[1]} sekuens (${(s[1]/tot*100).toFixed(0)}%)`).join(' &nbsp; ')+` &middot; input ${i.timesteps} hari, ${i.epochs} epoch`}

function renderAll(){renderHero();renderForecast();renderMonthly();renderSim();renderPerf();renderInfo()}
function renderSim(){simStop();simRender()}

/* ---------- loaders ---------- */
async function loadMain(){
 $('err').textContent='';
 const[h,f]=await Promise.allSettled([J('/api/history?last='+Math.max(S.hist,CFG.ts)),J('/api/forecast?days='+S.days)]);
 if(h.status==='rejected'){$('err').textContent='Gagal memuat data historis: '+h.reason.message;return}
 if(f.status==='rejected'){
  $('err').textContent='Gagal membuat prakiraan: '+f.reason.message;
  $('tiles').innerHTML='';$('now-lbl').textContent='Prakiraan belum tersedia';
  exp('exp-fc','Apa yang terjadi?',['Data historis tampil, tapi model belum bisa dijalankan. Pesan di atas menunjukkan penyebabnya (lihat juga terminal tempat <code>python app.py</code> berjalan).']);
  draw('cMain',{type:'line',data:{labels:h.value.dates,datasets:[{label:'Historis',data:h.value.values.map(cv),borderColor:'#8b5cf6',borderWidth:2.5,pointRadius:0,tension:.25}]},options:opt('Suhu rata-rata ('+UN()+')')});return}
 DATA.h=h.value;DATA.f=f.value;renderHero();renderForecast();renderMonthly();renderSim()}
async function loadMonthly(){const m=await J('/api/monthly');DATA.mi=m;DATA.mo={};m.months.forEach((mo,i)=>DATA.mo[mo-1]=m.values[i]);await loadMain()}
async function loadInfo(){DATA.i=await J('/api/info');renderInfo()}
async function loadMetrics(){DATA.m=await J('/api/evaluation');renderPerf()}

/* ---------- controls ---------- */
function setDays(v){S.days=v;$('days-val').textContent=v+' hari';$('days-range').value=v;pressed('seg-days',v)}
let dbt;$('days-range').addEventListener('input',e=>{const v=+e.target.value;S.days=v;$('days-val').textContent=v+' hari';pressed('seg-days',v);clearTimeout(dbt);dbt=setTimeout(loadMain,280)});
$('seg-days').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;setDays(+b.dataset.v);loadMain()});
$('seg-hist').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.hist=+b.dataset.v;pressed('seg-hist',S.hist);loadMain()});
$('seg-mode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.mode=b.dataset.v;pressed('seg-mode',S.mode);renderForecast()});
$('seg-rng').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.rng=+b.dataset.v;pressed('seg-rng',S.rng);renderTest()});
$('tol').addEventListener('input',e=>{S.tol=+e.target.value;renderTol()});
document.querySelector('.unit').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.unit=b.dataset.u;document.querySelectorAll('.unit button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderAll()});
$('dl').onclick=()=>{const f=DATA.f;if(!f)return;const rows=['tanggal,suhu_'+S.unit.toLowerCase(),...f.dates.map((d,i)=>d+','+F(f.values[i]))];
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));a.download='prakiraan_suhu_delhi.csv';a.click();URL.revokeObjectURL(a.href)};
$('theme').onclick=()=>{const r=document.documentElement,d=r.dataset.theme==='dark'?'light':'dark';r.dataset.theme=d;$('theme').textContent=d==='dark'?'☀️':'\u{1F319}';try{localStorage.setItem('theme',d)}catch(e){}
 ['cTol'].forEach(k=>{if(ch[k]){ch[k].destroy();delete ch[k]}});renderAll()};
$('theme').textContent=document.documentElement.dataset.theme==='dark'?'☀️':'\u{1F319}';

/* ---------- scroll effects ---------- */
const pg=$('prog'),tp=$('top');
addEventListener('scroll',()=>{const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);pg.style.width=p*100+'%';tp.classList.toggle('show',h.scrollTop>600)},{passive:true});
tp.onclick=()=>scrollTo({top:0,behavior:still?'auto':'smooth'});
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
 const links=[...document.querySelectorAll('#navlinks a')],so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
 document.querySelectorAll('header[id],section[id]').forEach(s=>so.observe(s));
}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));

CFG.ts=+document.body.dataset.timesteps||CFG.ts;CFG.max=+document.body.dataset.maxDays||CFG.max;
loadMonthly().catch(()=>loadMain());
loadMetrics().catch(e=>{$('perf-sub').textContent='Gagal memuat metrik: '+e.message});
loadInfo().catch(()=>{});
