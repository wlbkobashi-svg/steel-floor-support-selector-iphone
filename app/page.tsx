'use client';

import { useEffect, useMemo, useState } from 'react';

type FloorKey = 'general' | 'kendo' | 'judo' | 'direct';
type Range = [number, number];

const STANDS = [50, 100, 150, 200, 300];
const BOLTS = [150, 180, 200, 250, 300, 350, 400, 500];
const RAW: Record<FloorKey, (Range | null)[][]> = {
  general: [
    [[211,236],[255,286],[305,336],[350,381],[450,480]],
    [[241,266],[255,316],[305,366],[350,411],[450,505]],
    [[261,286],[261,336],[305,386],[350,431],[450,530]],
    [null,[311,386],[311,436],[350,481],[450,580]],
    [null,[361,436],[361,486],[361,531],[450,630]],
    [null,null,[411,536],[411,581],[450,680]],
    [null,null,[461,586],[461,631],[461,730]],
    [null,null,null,[561,731],[561,830]],
  ],
  kendo: [
    [[215,236],[265,286],[315,336],[360,381],[460,480]],
    [[241,266],[265,316],[315,366],[360,411],[460,505]],
    [[261,286],[265,336],[315,386],[360,431],[460,530]],
    [null,[311,386],[315,436],[360,481],[460,580]],
    [null,[361,436],[361,486],[361,531],[460,630]],
    [null,null,[411,536],[411,581],[460,680]],
    [null,null,[461,586],[461,631],[461,730]],
    [null,null,null,[561,731],[561,830]],
  ],
  judo: [
    [[230,236],[280,286],[330,336],[375,381],[475,480]],
    [[241,266],[280,316],[330,366],[375,411],[475,505]],
    [[261,286],[280,336],[330,386],[375,431],[475,530]],
    [null,[311,386],[330,436],[375,481],[475,580]],
    [null,[361,436],[361,486],[375,531],[475,630]],
    [null,null,[411,536],[411,581],[475,680]],
    [null,null,[461,586],[461,631],[475,730]],
    [null,null,null,[561,731],[561,830]],
  ],
  direct: [
    [[211,236],[242,286],[292,336],[337,381],[437,480]],
    [[241,266],[242,316],[292,366],[337,411],[437,510]],
    [[261,286],[261,336],[292,386],[337,431],[437,530]],
    [null,[311,386],[311,436],[337,481],[437,580]],
    [null,[361,436],[361,486],[361,531],[437,630]],
    [null,null,[411,536],[411,581],[437,680]],
    [null,null,[461,586],[461,631],[461,730]],
    [null,null,null,[561,731],[561,830]],
  ],
};

const FLOOR_NAMES: Record<FloorKey, string> = {
  general: 'GTフロアー（一般体育館）', kendo: 'GTフロアー（剣道場）',
  judo: 'GTフロアー（柔・剣道場）', direct: 'GTダイレクト',
};
const allCandidates = (floor: FloorKey) => RAW[floor].flatMap((row, ri) => row.flatMap((range, ci) => range ? [{ h: STANDS[ci], l: BOLTS[ri], range }] : []));
function roundRect(ctx: CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}

export default function Home() {
  const [site,setSite]=useState(''); const [floor,setFloor]=useState<FloorKey>('general'); const [basis,setBasis]=useState<'finish'|'joist'>('finish');
  const [min,setMin]=useState('595'); const [max,setMax]=useState('602'); const [finish,setFinish]=useState('18'); const [under1,setUnder1]=useState('15'); const [under2,setUnder2]=useState('0');
  const [calculated,setCalculated]=useState(false); const [notice,setNotice]=useState('');
  useEffect(()=>{const timer=window.setTimeout(()=>{const raw=localStorage.getItem('steel-floor-inputs-v1');if(raw){try{const v=JSON.parse(raw);setSite(v.site??'');setFloor(v.floor??'general');setBasis(v.basis??'finish');setMin(v.min??'595');setMax(v.max??'602');setFinish(v.finish??'18');setUnder1(v.under1??'15');setUnder2(v.under2??'0')}catch{}}},0);if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');return()=>window.clearTimeout(timer)},[]);
  useEffect(()=>{localStorage.setItem('steel-floor-inputs-v1',JSON.stringify({site,floor,basis,min,max,finish,under1,under2}))},[site,floor,basis,min,max,finish,under1,under2]);
  const values=useMemo(()=>{const inputMin=Number(min),inputMax=max===''?inputMin:Number(max),low=Math.min(inputMin,inputMax),high=Math.max(inputMin,inputMax),deduction=basis==='finish'?Number(finish)+Number(under1)+Number(under2||0):0;return{deduction,targetMin:low-deduction,targetMax:high-deduction}},[min,max,finish,under1,under2,basis]);
  const results=useMemo(()=>{if(![values.targetMin,values.targetMax].every(Number.isFinite))return[];const mid=(values.targetMin+values.targetMax)/2;return allCandidates(floor).filter(c=>c.range[0]<=values.targetMin&&c.range[1]>=values.targetMax).sort((a,b)=>Math.abs((a.range[0]+a.range[1])/2-mid)-Math.abs((b.range[0]+b.range[1])/2-mid)||(a.range[1]-a.range[0])-(b.range[1]-b.range[0])||a.h-b.h||a.l-b.l).slice(0,3)},[floor,values]);
  const valid=Number.isFinite(values.targetMin)&&Number.isFinite(values.targetMax)&&values.targetMin<=values.targetMax;
  async function exportImage(){if(!calculated||!valid)return;const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=results.length?760:620;const ctx=canvas.getContext('2d')!,navy='#102a43',blue='#155eef',pale='#eef4ff',ink='#17212b',muted='#5f6b76';ctx.fillStyle='#f6f8fb';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=navy;ctx.fillRect(0,0,canvas.width,150);ctx.fillStyle='#fff';ctx.font='700 46px sans-serif';ctx.fillText('鋼製床 支持台・ボルト組 選定結果',70,82);ctx.font='500 25px sans-serif';ctx.fillText(site||'現場名未入力',72,123);ctx.fillStyle=ink;ctx.font='700 28px sans-serif';ctx.fillText(FLOOR_NAMES[floor],70,215);ctx.fillStyle=muted;ctx.font='500 22px sans-serif';ctx.fillText(`${basis==='finish'?'仕上高':'根太天端'} ${min}${max&&max!==min?`〜${max}`:''} mm`,70,255);if(basis==='finish')ctx.fillText(`控除 ${values.deduction} mm → 根太天端 ${values.targetMin}〜${values.targetMax} mm`,70,290);if(results.length){results.forEach((r,i)=>{const y=340+i*130;ctx.fillStyle=i===0?pale:'#fff';roundRect(ctx,60,y,1080,104,20);ctx.fillStyle=blue;ctx.font='800 25px sans-serif';ctx.fillText(i===0?'推奨':`候補 ${i+1}`,90,y+42);ctx.fillStyle=ink;ctx.font='800 36px sans-serif';ctx.fillText(`スタンド H${r.h} ＋ ボルト組 L${r.l}`,250,y+48);ctx.fillStyle=muted;ctx.font='500 22px sans-serif';ctx.fillText(`調整範囲 ${r.range[0]}〜${r.range[1]} mm`,250,y+80)})}else{ctx.fillStyle='#fff';roundRect(ctx,60,330,1080,150,20);ctx.fillStyle='#b42318';ctx.font='700 30px sans-serif';ctx.fillText('該当する標準組合せがありません',100,400)}ctx.fillStyle=muted;ctx.font='500 18px sans-serif';ctx.fillText(`STEEL FLOOR Ver.202602 ・ ${new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Tokyo'}).format(new Date())}`,70,canvas.height-55);const blob=await new Promise<Blob>(resolve=>canvas.toBlob(b=>resolve(b!),'image/png')),file=new File([blob],'steel-floor-selection.png',{type:'image/png'});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'鋼製床 選定結果'});setNotice('共有画面を開きました')}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setNotice('結果画像を保存しました')}}catch(e){if((e as Error).name!=='AbortError')setNotice('画像を保存できませんでした')}}
  function calculate(){setCalculated(true);setNotice('');setTimeout(()=>document.getElementById('results')?.scrollIntoView({behavior:'smooth',block:'start'}),0)}
  return <main><header className="hero"><div className="eyebrow">KIRII STEEL FLOOR</div><h1>支持台・ボルト組<br/>かんたん選定</h1><p>高さを入力して、標準組合せをすぐ確認。</p><span className="version">Ver.202602</span></header>
    <section className="card form-card" aria-label="選定条件"><label>現場名（任意）<input value={site} onChange={e=>setSite(e.target.value)} placeholder="例：○○市体育館"/></label><label>床タイプ<select value={floor} onChange={e=>{setFloor(e.target.value as FloorKey);setCalculated(false)}}>{Object.entries(FLOOR_NAMES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <fieldset><legend>入力基準</legend><div className="segmented"><button type="button" className={basis==='finish'?'active':''} onClick={()=>{setBasis('finish');setCalculated(false)}}>仕上高</button><button type="button" className={basis==='joist'?'active':''} onClick={()=>{setBasis('joist');setCalculated(false)}}>根太天端</button></div></fieldset>
      <div className="row"><label>最小高さ<input inputMode="decimal" type="number" value={min} onChange={e=>{setMin(e.target.value);setCalculated(false)}}/><span>mm</span></label><label>最大高さ<input inputMode="decimal" type="number" value={max} onChange={e=>{setMax(e.target.value);setCalculated(false)}} placeholder="同値可"/><span>mm</span></label></div>
      {basis==='finish'&&<div className="thickness"><p>仕上・下地厚（控除）</p><div className="row three"><label>仕上<input inputMode="decimal" type="number" value={finish} onChange={e=>{setFinish(e.target.value);setCalculated(false)}}/><span>mm</span></label><label>下地1<input inputMode="decimal" type="number" value={under1} onChange={e=>{setUnder1(e.target.value);setCalculated(false)}}/><span>mm</span></label><label>下地2<input inputMode="decimal" type="number" value={under2} onChange={e=>{setUnder2(e.target.value);setCalculated(false)}}/><span>mm</span></label></div><div className="formula">根太天端：<strong>{Number.isFinite(values.targetMin)?`${values.targetMin}〜${values.targetMax} mm`:'—'}</strong></div></div>}
      <button className="primary" type="button" onClick={calculate}>この条件で選定</button></section>
    <section id="results" className="card results" aria-live="polite"><div className="section-head"><div><span>SELECTION</span><h2>選定結果</h2></div>{calculated&&<button className="share" onClick={exportImage}>画像で保存・共有</button>}</div>{!calculated?<div className="empty">条件を入力して「この条件で選定」を押してください。</div>:!valid?<div className="alert">入力値を確認してください。</div>:results.length===0?<div className="alert"><strong>該当する標準組合せがありません</strong><br/>入力範囲全体を満たす組合せのみ表示します。</div>:<><p className="summary">根太天端 <strong>{values.targetMin}〜{values.targetMax} mm</strong> を満たす候補</p><div className="candidate-list">{results.map((r,i)=><article className={`candidate ${i===0?'best':''}`} key={`${r.h}-${r.l}`}><span className="rank">{i===0?'推奨':`候補 ${i+1}`}</span><div><h3>H{r.h} <b>＋</b> L{r.l}</h3><p>スタンドH ＋ ボルト組L</p></div><div className="range">{r.range[0]}〜{r.range[1]}<small>mm</small></div></article>)}</div></>}{notice&&<p className="notice">{notice}</p>}</section>
    <footer><p>標準表：STEEL FLOOR Ver.202602</p><p>最終決定前に最新カタログ・現場条件をご確認ください。</p></footer></main>;
}
