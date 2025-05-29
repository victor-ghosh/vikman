/* ----------  CONSTANTS  ---------- */

// Table-1 filters (id, label, db, reference URL, query handled server-side)
const TABLE1_FILTERS = [
  {id:"scopus_observational",label:"Scopus Observational Stud.",db:"Scopus",
   ref:"https://searchfilters.cda-amc.ca/link/107"},
  {id:"scopus_srmahta",label:"Scopus SR/MA/HTA/ITC",db:"Scopus",
   ref:"https://searchfilters.cda-amc.ca/link/105"},
  {id:"pubmed_srmahta",label:"PubMed SR/MA/HTA/ITC",db:"Pubmed",
   ref:"https://searchfilters.cda-amc.ca/link/99"},
  {id:"pubmed_rctcct",label:"PubMed RCT/CCT",db:"Pubmed",
   ref:"https://searchfilters.cda-amc.ca/link/108"},
  {id:"pubmed_cochrane_sens",label:"Cochrane sens-max (PubMed)",db:"Pubmed",
   ref:"https://handbook-5-1.cochrane.org/chapter_6/box_6_4_a_cochrane_hsss_2008_sensmax_pubmed.htm"},
  {id:"pubmed_cochrane_prec",label:"Cochrane sens+prec (PubMed)",db:"Pubmed",
   ref:"https://handbook-5-1.cochrane.org/chapter_6/box_6_4_b_cochrane_hsss_2008_sensprec_pubmed.htm"},
  {id:"embase_cochrane_rct",label:"Embase Cochrane RCT",db:"Embase",
   ref:"https://handbook-5-1.cochrane.org/chapter_6/box_6_4_a_cochrane_hsss_2008_sensmax_pubmed.htm"},
  {id:"embase_cochrane_rct2",label:"Embase Cochrane RCT (alt.)",db:"Embase",
   ref:"https://training.cochrane.org/handbook/current/chapter-04"},
  {id:"cochrane_observ",label:"Cochrane Observational",db:"Cochrane",
   ref:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8103566/"},
  {id:"pubmed_rct_filter",label:"PubMed RCT filter",db:"Pubmed",ref:"#"},
  {id:"pubmed_ma_filter",label:"PubMed MA filter",db:"Pubmed",ref:"#"},
  {id:"pubmed_sr_filter",label:"PubMed SR filter",db:"Pubmed",ref:"#"},
  {id:"pubmed_review_filter",label:"PubMed Review",db:"Pubmed",ref:"#"},
  {id:"pubmed_case_filter",label:"PubMed Case Rep.",db:"Pubmed",ref:"#"},
  {id:"pubmed_comp_filter",label:"PubMed Comparative",db:"Pubmed",ref:"#"},
  {id:"pubmed_obs_filter",label:"PubMed Observ.",db:"Pubmed",ref:"#"},
  {id:"embase_cochrane",label:"Embase Cochrane filter",db:"Embase",ref:"#"},
  {id:"embase_rct",label:"Embase RCT",db:"Embase",ref:"#"},
  {id:"embase_ma",label:"Embase MA",db:"Embase",ref:"#"},
  {id:"embase_cct",label:"Embase CCT",db:"Embase",ref:"#"},
  {id:"embase_sr",label:"Embase SR",db:"Embase",ref:"#"},
  {id:"embase_cochrane_rev",label:"Embase Cochrane Rev",db:"Embase",ref:"#"},
  {id:"embase_ct",label:"Embase Clinical Trial",db:"Embase",ref:"#"}
];

/* ----------  DOM UTILS  ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ----------  INIT FILTER STRIP  ---------- */
const strip = $("#filters-strip");
TABLE1_FILTERS.forEach(f=>{
  const lbl=document.createElement("label");
  const cb=document.createElement("input");
  cb.type="checkbox";cb.id=f.id;cb.dataset.db=f.db;cb.value=f.id;
  lbl.append(cb);lbl.append(f.label);
  if(f.ref){const a=document.createElement("a");a.href=f.ref;a.target="_blank";a.textContent="ⓘ";lbl.append(a);}
  strip.append(lbl);
});

/* ----------  MODE TOGGLE  ---------- */
const advancedRadio=$("#mode-advanced");
const normalRadio=$("#mode-normal");
advancedRadio.addEventListener("change",()=>toggleMode(true));
normalRadio.addEventListener("change",()=>toggleMode(false));

function toggleMode(isAdv){
  // Add/Remove operator-select & add-btn inside each field dynamically
  $$(".field-block").forEach(block=>{
    const field=block.dataset.field;
    let opSel=block.querySelector(".bool-operator");
    let addBtn=block.querySelector(".add-term-btn");
    if(isAdv){
      if(!opSel){
        // build operator select
        opSel=document.createElement("select");
        opSel.className="bool-operator";
        ["AND","OR","NOT"].forEach(v=>{
          const o=document.createElement("option");
          o.value=v;o.textContent=v;
          if(v==="OR")o.selected=true;
          opSel.append(o);
        });
        block.insertBefore(opSel,block.querySelector(".pico-input").nextSibling);
      }
      if(!addBtn){
        addBtn=document.createElement("button");
        addBtn.type="button";
        addBtn.className="add-term-btn";
        addBtn.textContent="Add";
        block.querySelector(".pico-input").after(addBtn);
        addBtn.addEventListener("click",()=>addTerm(field));
      }
      opSel.style.display="inline-block";
      addBtn.style.display="inline-block";
    }else{
      if(opSel)opSel.style.display="none";
      if(addBtn)addBtn.style.display="none";
      ADV[field]=[];
      updateChips(field);
    }
  });
  $("#search-btn").textContent=isAdv?"Advanced Search":"Search";
  validateReady();
}

/* ----------  ADVANCED TERM STATE  ---------- */
const ADV={population:[],intervention:[],control:[],outcome:[]};
function addTerm(field){
  const input=$(`#${field}-input`);
  const term=input.value.trim();
  if(!term)return;
  const opSel=input.parentElement.querySelector(".bool-operator");
  const op=(ADV[field].length===0)?null:opSel.value;
  ADV[field].push({term,op});
  input.value="";
  updateChips(field);
}
function updateChips(field){
  const wrap=$(`#${field}-terms`);
  wrap.innerHTML="";
  ADV[field].forEach((t,i)=>{
    const chip=document.createElement("span");
    chip.className="term-chip";
    chip.textContent=(i===0? t.term : `${t.op} ${t.term}`);
    const x=document.createElement("span");
    x.className="remove-term";x.textContent="×";
    x.onclick=()=>{ADV[field].splice(i,1);updateChips(field)};
    chip.append(x);wrap.append(chip);
  });
  validateReady();
}

/* ----------  TYPE-AHEAD  (call backend /suggest) ---------- */
const fields=["population","intervention","control","outcome"];
fields.forEach(f=>{
  const inp=$(`#${f}-input`);
  const list=$(`#${f}-suggestions`);
  let timer;
  inp.addEventListener("input",e=>{
    const q=e.target.value.trim();
    clearTimeout(timer);
    if(!q){list.style.display="none";validateReady();return;}
    timer=setTimeout(async()=>{
      try{
        const r=await fetch(`/suggest?f=${f}&q=${encodeURIComponent(q)}`);
        const arr=await r.json();
        list.innerHTML="";
        arr.forEach(s=>{
          const li=document.createElement("li");li.textContent=s;
          li.onmousedown=()=>{inp.value=s;list.style.display="none";validateReady();}
          list.append(li);
        });
        list.style.display=arr.length?"block":"none";
      }catch{list.style.display="none";}
    },200);
  });
  inp.addEventListener("blur",()=>setTimeout(()=>list.style.display="none",150));
});

/* ----------  SEARCH BUTTON ENABLE ---------- */
function validateReady(){
  let ok=false;
  if(advancedRadio.checked){
    ok=Object.values(ADV).some(arr=>arr.length);
  }else{
    ok=fields.some(f=>$("#"+f+"-input").value.trim().length);
  }
  $("#search-btn").disabled=!ok;
}
fields.forEach(f=>$("#"+f+"-input").addEventListener("input",validateReady));

/* ----------  GENERATE QUERIES ---------- */
$("#search-btn").onclick=async()=>{
  if($("#search-btn").disabled)return;
  const payload={mode:advancedRadio.checked?"advanced":"normal",pico:{},filters:{}};
  if(payload.mode==="advanced"){
    fields.forEach(f=>payload.pico[f]=ADV[f]);
  }else{
    fields.forEach(f=>payload.pico[f]=$(`#${f}-input`).value.trim());
  }
  // gather filters
  $$("#filters-strip input:checked").forEach(cb=>{
    const db=cb.dataset.db.toLowerCase();
    if(!payload.filters[db])payload.filters[db]=[];
    payload.filters[db].push(cb.value);
  });
  try{
    const res=await fetch("/generateQueries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const q=await res.json();
    $("#q-pubmed").value=q.pubmed||"";
    $("#q-embase").value=q.embase||"";
    $("#q-scopus").value=q.scopus||"";
    $("#q-cochrane").value=q.cochrane||"";
    $("#results-section").hidden=false;
    $("#results-section").scrollIntoView({behavior:"smooth"});
  }catch(e){alert("Server error – please retry.");}
};

/* ----------  COPY & OPEN  ---------- */
$$(".copy-btn").forEach(b=>b.onclick=()=>{
  const t=$("#"+b.dataset.t).value;
  navigator.clipboard.writeText(t).then(()=>{b.textContent="✓";setTimeout(()=>b.textContent="Copy",1500);});
});
$$(".open-btn").forEach(b=>b.onclick=()=>{
  const db=b.dataset.db,txt=$("#q-"+db).value;
  if(!txt)return;
  const EN=encodeURIComponent(txt);
  let url="";
  if(db==="pubmed")url=`https://pubmed.ncbi.nlm.nih.gov/?term=${EN}`;
  else if(db==="scopus")url="https://www.scopus.com/search/form.uri";
  else if(db==="embase")url="https://www.embase.com";
  else if(db==="cochrane")url="https://www.cochranelibrary.com/search";
  window.open(url,"_blank");
});

/* initialise */
toggleMode(false);
