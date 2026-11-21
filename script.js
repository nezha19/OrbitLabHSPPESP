const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let student = {name:"", school:""};
let completed = new Set();
let currentScreen = "welcome";

function go(screen){
  currentScreen = screen;
  $$(".screen").forEach(el => el.classList.toggle("active", el.id === `screen-${screen}`));
  if(screen==="home") updateProgress();
  if(screen==="simulation") { resizeCanvas(); drawScene(); }
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>go(btn.dataset.go)));
$("#homeBtn").addEventListener("click",()=>go(student.name?"home":"welcome"));
$("#identityForm").addEventListener("submit",e=>{
  e.preventDefault();
  student.name=$("#studentName").value.trim();
  student.school=$("#schoolName").value.trim();
  if(!student.name||!student.school)return;
  $("#welcomeName").textContent=student.name.split(" ")[0];
  $("#studentChip").textContent=student.name;
  go("home");
});
function updateProgress(){
  const n=completed.size;$("#progressFill").style.width=(n/3*100)+"%";$("#progressText").textContent=`${n} dari 3 bagian selesai`;
}

// --- Canvas physics laboratory ---
const canvas=$("#physicsCanvas"), ctx=canvas.getContext("2d");
let W=900,H=480,angle=-Math.PI/2,radius=2,omega=1.5,mass=1,running=true,lastTime=0,raf=0;
let scenario="general",released=false,scenarioSpeed=1.5,scenarioRadius=2;
function resizeCanvas(){const rect=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,rect.width*dpr);canvas.height=Math.max(1,rect.width*(480/900)*dpr);ctx.setTransform(canvas.width/900,0,0,canvas.width/900,0,0);W=900;H=480;}
window.addEventListener("resize",()=>{resizeCanvas();drawScene()});
function line(x1,y1,x2,y2,color,width=3,dash=[]){ctx.beginPath();ctx.setLineDash(dash);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([])}
function arrow(x1,y1,x2,y2,color,label){line(x1,y1,x2,y2,color,4);const a=Math.atan2(y2-y1,x2-x1),h=12;line(x2,y2,x2-h*Math.cos(a-.45),y2-h*Math.sin(a-.45),color,4);line(x2,y2,x2-h*Math.cos(a+.45),y2-h*Math.sin(a+.45),color,4);if(label){ctx.fillStyle=color;ctx.font="bold 17px DM Sans";ctx.fillText(label,x2+8,y2-8)}}
function circle(x,y,r,fill,stroke="#244b3c",lw=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}
function text(t,x,y,color="#526657",size=14,weight="500"){ctx.fillStyle=color;ctx.font=`${weight} ${size}px DM Sans`;ctx.fillText(t,x,y)}
function base(){ctx.clearRect(0,0,900,480);ctx.fillStyle="#f0f4ed";ctx.fillRect(0,0,900,480);ctx.strokeStyle="#e2e9df";ctx.lineWidth=1;for(let x=30;x<900;x+=30){line(x,0,x,480,"#e5ebe2",.5)}for(let y=30;y<480;y+=30){line(0,y,900,y,"#e5ebe2",.5)}}
function drawGeneral(){
  const cx=410,cy=245,R=48+radius*38,x=cx+R*Math.cos(angle),y=cy+R*Math.sin(angle);
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle="#a9bda4";ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.stroke();ctx.setLineDash([]);
  circle(cx,cy,5,"#244b3c");text("O",cx-17,cy+22,"#244b3c",13,"700");
  if($("#showRadius").checked)line(cx,cy,x,y,"#8ba18a",2);
  circle(x,y,13,"#d6a85d","#244b3c",3);
  const v=omega*radius,ac=omega*omega*radius;
  if($("#showVelocity").checked){const k=25/Math.max(1,v/2);arrow(x,y,x+(-Math.sin(angle))*k,y+(Math.cos(angle))*k,"#397ca0","v")}
  if($("#showAccel").checked){const k=22+Math.min(38,ac*3);arrow(x,y,x-Math.cos(angle)*k,y-Math.sin(angle)*k,"#c46a4b","aₛ")}
  text("Lintasan",cx+R+18,cy+R*.65,"#819281",12);
  text("Ubah r dan ω pada panel kontrol",35,420,"#758676",13);
  text("v = ωr",665,160,"#244b3c",22,"700");text(`v = ${(omega*radius).toFixed(2)} m/s`,665,190,"#397ca0",15);
  text("aₛ = ω²r",665,235,"#244b3c",22,"700");text(`aₛ = ${(omega*omega*radius).toFixed(2)} m/s²`,665,265,"#c46a4b",15);
  text("Arah v selalu tangensial",665,330,"#526657",13);text("Arah aₛ selalu ke pusat",665,352,"#526657",13);
}
function drawCarousel(){
  const cx=420,cy=245,R=150;
  circle(cx,cy,5,"#244b3c");ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle="#9eb59b";ctx.setLineDash([5,6]);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<8;i++){let a=i*Math.PI/4;let x=cx+R*Math.cos(a),y=cy+R*Math.sin(a);line(cx,cy,x,y,"#cbd7c7",2);circle(x,y,8,"#d6a85d")}
  const a=angle,x1=cx+65*Math.cos(a),y1=cy+65*Math.sin(a),x2=cx+R*Math.cos(a),y2=cy+R*Math.sin(a);
  circle(x1,y1,10,"#397ca0");circle(x2,y2,11,"#d6a85d");
  arrow(x1,y1,x1-(-Math.sin(a))*42,y1-(Math.cos(a))*42,"#397ca0","A");arrow(x2,y2,x2-(-Math.sin(a))*85,y2-(Math.cos(a))*85,"#c46a4b","B");
  text("Pusat",cx-18,cy+22);text("ω sama untuk semua titik pada piringan",80,440,"#526657",15,"700");
  text("v = ωr",690,150,"#244b3c",22,"700");text("Titik B lebih jauh dari pusat,",690,190,"#526657",13);text("maka v linear B lebih besar.",690,212,"#526657",13);
}
function drawString(){
  const cx=300,cy=240,R=145,x=cx+R*Math.cos(angle),y=cy+R*Math.sin(angle);
  circle(cx,cy,5,"#244b3c");
  if(!released){ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle="#9eb59b";ctx.setLineDash([5,7]);ctx.stroke();ctx.setLineDash([]);line(cx,cy,x,y,"#8a9b8b",4);circle(x,y,15,"#d6a85d");const vx=-Math.sin(angle),vy=Math.cos(angle);arrow(x,y,x+vx*90,y+vy*90,"#397ca0","v");arrow(x,y,x-Math.cos(angle)*65,y-Math.sin(angle)*65,"#c46a4b","T menuju pusat");text("Tali utuh: tegangan tali menyediakan gaya radial",480,155,"#526657",14)}
  else{line(cx,cy,x,y,"#c46a4b",2,[5,6]);circle(x,y,15,"#d6a85d");const vx=-Math.sin(angle),vy=Math.cos(angle);arrow(x,y,x+vx*150,y+vy*150,"#397ca0","arah gerak");text("TALI PUTUS",480,140,"#c46a4b",17,"700");text("Benda melanjutkan gerak",480,175,"#526657",14);text("sesaat pada arah tangensial.",480,197,"#526657",14)}
  text("Pusat putaran",cx-48,cy+25);text(released?"Amati arah tangensial":"Tekan tombol untuk memutus tali",70,435,"#526657",14,"700");
}
function drawMotorcycle(){
  const cx=430,cy=255,R=135;ctx.beginPath();ctx.arc(cx,cy,R,Math.PI*1.05,Math.PI*1.95);ctx.strokeStyle="#9eb59b";ctx.lineWidth=30;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,R,Math.PI*1.05,Math.PI*1.95);ctx.strokeStyle="#d8dfd3";ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.stroke();ctx.setLineDash([]);
  const a=angle*.55-Math.PI/2,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a);circle(x,y,14,"#d6a85d");arrow(x,y,x-55*Math.cos(a),y-55*Math.sin(a),"#c46a4b","fₛ");arrow(x,y,x-(-Math.sin(a))*60,y-(Math.cos(a))*60,"#397ca0","v");
  text("Gesekan statis ban-jalan dapat menjadi",90,90,"#526657",15);text("gaya menuju pusat tikungan.",90,114,"#526657",15,"700");text("Skema konseptual tampak atas",90,420,"#819281",12);
}
function drawFerris(){
  const cx=420,cy=245,R=150;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle="#9eb59b";ctx.lineWidth=5;ctx.stroke();circle(cx,cy,8,"#244b3c");
  for(let i=0;i<12;i++){let a=i*Math.PI/6;line(cx,cy,cx+R*Math.cos(a),cy+R*Math.sin(a),"#c5d2c2",2)}
  const x=cx+R*Math.cos(angle),y=cy+R*Math.sin(angle);circle(x,y,13,"#d6a85d");arrow(x,y,x-65*Math.cos(angle),y-65*Math.sin(angle),"#c46a4b","aₛ");
  text("Kelajuan tetap, arah kecepatan berubah",75,75,"#526657",15,"700");text("Karena arah v berubah, percepatan tetap ada.",75,100,"#526657",13);
}
function drawWasher(){
  const cx=410,cy=240,R=145;circle(cx,cy,R,"#e3eae0","#9eb59b",3);circle(cx,cy,R-18,"#f7f8f2","#b9c9b5",2);circle(cx,cy,20,"#d6dfd2");
  for(let i=0;i<24;i++){let a=i*Math.PI/12;circle(cx+(R-28)*Math.cos(a),cy+(R-28)*Math.sin(a),3,"#9db39a")}
  const x=cx+(R-35)*Math.cos(angle),y=cy+(R-35)*Math.sin(angle);circle(x,y,9,"#397ca0");
  if(released){const vx=-Math.sin(angle),vy=Math.cos(angle);arrow(x,y,x+vx*150,y+vy*150,"#397ca0","lintasan air");text("Setelah keluar, air cenderung bergerak",610,175,"#526657",13);text("searah garis singgung sesaat.",610,198,"#526657",13,"700")}
  else{text("Air masih mengikuti putaran tabung",610,180,"#526657",13);text("selama ada gaya radial yang cukup.",610,202,"#526657",13)}
  text("Skema sederhana tabung berputar",90,435,"#819281",12);
}
function drawBicycle(){
  const cx=420,cy=245,R=155;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle="#9eb59b";ctx.lineWidth=8;ctx.stroke();circle(cx,cy,7,"#244b3c");
  for(let i=0;i<12;i++){let a=i*Math.PI/6;line(cx,cy,cx+R*Math.cos(a),cy+R*Math.sin(a),"#bdcdb9",2)}
  const a=angle,xA=cx+35*Math.cos(a),yA=cy+35*Math.sin(a),xB=cx+R*Math.cos(a),yB=cy+R*Math.sin(a);circle(xA,yA,9,"#397ca0");circle(xB,yB,11,"#d6a85d");arrow(xA,yA,xA-(-Math.sin(a))*28,yA-(Math.cos(a))*28,"#397ca0","A");arrow(xB,yB,xB-(-Math.sin(a))*85,yB-(Math.cos(a))*85,"#c46a4b","B");text("A dekat pusat",90,170,"#397ca0",14,"700");text("B di tepi",90,195,"#c46a4b",14,"700");text("ωA = ωB, tetapi vB > vA",610,220,"#244b3c",18,"700");
}
function drawScene(){
  if(!ctx)return;base();
  switch(scenario){case"general":drawGeneral();break;case"carousel":drawCarousel();break;case"string":drawString();break;case"motorcycle":drawMotorcycle();break;case"ferris":drawFerris();break;case"washer":drawWasher();break;case"bicycle":drawBicycle();break;}
}
const scenarioInfo={
 general:["Eksperimen GMB","Amati hubungan jari-jari, kecepatan sudut, dan kecepatan linear.","Ketika jari-jari diperbesar sementara ω tetap, kecepatan linear bertambah karena v = ωr.","Pada gerak satu benda tegar, semua titik memiliki ω yang sama, tetapi v linear berbeda jika jaraknya dari sumbu berbeda."],
 carousel:["Kecepatan pada komidi putar","Dua siswa berada pada jarak berbeda dari pusat komidi putar yang sama.","Jika ω sama, titik yang lebih jauh dari pusat memiliki kecepatan linear lebih besar: v = ωr.","Jangan menganggap semua titik pada komidi putar memiliki kecepatan linear sama. Periode dan ω sama, tetapi v bergantung pada r."],
 string:["Bola yang diputar menggunakan tali","Amati arah gerak bola sesaat setelah tali diputus.","Saat tali utuh, tegangan tali memberi resultan gaya radial. Ketika tali putus, gaya itu hilang dan bola bergerak sesaat menyinggung lintasan.","Benda tidak otomatis bergerak radial ke luar. Dalam kerangka pengamat diam, arah gerak sesaatnya tangensial."],
 motorcycle:["Motor melewati tikungan","Pada jalan datar, gesekan statis antara ban dan jalan dapat menyediakan gaya menuju pusat tikungan.","Gaya gesek statis berperan sebagai resultan gaya sentripetal ketika motor berbelok pada jalan datar tanpa selip.","Bukan mesin yang langsung menarik motor ke pusat. Gaya sentripetal adalah resultan radial; pada kasus ini dapat disediakan oleh gesekan statis."],
 ferris:["Percepatan pada kincir ria","Gondola bergerak dengan kelajuan tetap pada lintasan melingkar.","Walau kelajuan tetap, arah kecepatan berubah. Percepatan sentripetal selalu menuju pusat lingkaran.","Kelajuan tetap tidak berarti percepatan nol. Perubahan arah v berarti ada percepatan."],
 washer:["Air pada mesin cuci","Amati arah gerak air ketika keluar dari lubang tabung yang berputar.","Saat air tidak lagi dipaksa mengikuti lintasan melingkar oleh dinding tabung, air cenderung melanjutkan gerak tangensial sesaat.","Air tidak harus bergerak radial keluar karena gaya sentrifugal. Dalam kerangka pengamat diam, arah sesaatnya tangensial."],
 bicycle:["Roda sepeda yang berputar","Bandingkan titik A dekat pusat dan titik B di tepi roda yang sama.","Semua titik pada roda tegar memiliki kecepatan sudut sama. Titik B memiliki r lebih besar sehingga vB lebih besar.","Jangan menyimpulkan kecepatan linear sama hanya karena kedua titik berada pada roda yang sama."]
};
function updateReadouts(){let v=omega*radius,a=omega*omega*radius,T=2*Math.PI/omega,F=mass*a;$("#readV").innerHTML=`${v.toFixed(2)} <small>m/s</small>`;$("#readA").innerHTML=`${a.toFixed(2)} <small>m/s²</small>`;$("#readT").innerHTML=`${T.toFixed(2)} <small>s</small>`;$("#readF").innerHTML=`${F.toFixed(2)} <small>N</small>`;$("#radiusOut").textContent=radius.toFixed(1);$("#omegaOut").textContent=omega.toFixed(1);$("#massOut").textContent=mass.toFixed(1)}
function setScenario(s){
  scenario=s;released=false;$$(".scenario").forEach(b=>b.classList.toggle("active",b.dataset.scenario===s));
  const info=scenarioInfo[s];$("#scenarioTitle").textContent=info[0];$("#scenarioDescription").textContent=info[1];$("#explanationTitle").textContent="Penjelasan konsep";$("#explanationText").textContent=info[2];$("#misconceptionText").textContent=info[3];
  $("#generalControls").classList.toggle("hidden",s!=="general");$("#scenarioControls").classList.toggle("hidden",s==="general");
  $("#canvasLabel").textContent=info[0].toUpperCase();
  if(s!=="general"){
    let extra="";
    if(s==="string"||s==="washer")extra=`<div class="scenario-control-row"><button id="releaseBtn">${s==="string"?"Putuskan tali":"Lepaskan air"}</button><span class="muted tiny">Bandingkan arah sebelum dan sesudah dilepaskan.</span></div>`;
    else if(s==="carousel"||s==="bicycle")extra=`<div class="scenario-control-row"><label>Kecepatan sudut <b id="sceneOmegaOut">${scenarioSpeed.toFixed(1)}</b> rad/s</label><input id="sceneOmega" type="range" min=".3" max="3" step=".1" value="${scenarioSpeed}"></div>`;
    else if(s==="motorcycle")extra=`<div class="scenario-control-row"><label>Kelajuan motor <b id="sceneSpeedOut">12</b> m/s</label><input id="sceneSpeed" type="range" min="5" max="25" step="1" value="12"><span class="muted tiny">Pada jalan datar, kebutuhan gaya radial dipenuhi oleh gesekan statis jika tidak melampaui batasnya.</span></div>`;
    else extra=`<div class="scenario-control-row"><label>Kecepatan sudut <b id="sceneOmegaOut">1.5</b> rad/s</label><input id="sceneOmega" type="range" min=".3" max="3" step=".1" value="1.5"></div>`;
    $("#scenarioControlBody").innerHTML=extra;
    const rel=$("#releaseBtn");if(rel)rel.addEventListener("click",()=>{released=!released;rel.textContent=released?"Putar kembali":"Lepaskan lagi";drawScene();});
    const so=$("#sceneOmega");if(so)so.addEventListener("input",()=>{scenarioSpeed=+so.value;$("#sceneOmegaOut").textContent=scenarioSpeed.toFixed(1);omega=scenarioSpeed;updateReadouts()});
    const ss=$("#sceneSpeed");if(ss)ss.addEventListener("input",()=>$("#sceneSpeedOut").textContent=ss.value);
  }
  drawScene();updateReadouts();
}
$$(".scenario").forEach(b=>b.addEventListener("click",()=>setScenario(b.dataset.scenario)));
["radiusSlider","omegaSlider","massSlider"].forEach(id=>$("#"+id).addEventListener("input",e=>{if(id==="radiusSlider")radius=+e.target.value;if(id==="omegaSlider")omega=+e.target.value;if(id==="massSlider")mass=+e.target.value;updateReadouts();drawScene()}));
["showVelocity","showAccel","showRadius"].forEach(id=>$("#"+id).addEventListener("change",drawScene));
$("#playBtn").addEventListener("click",()=>{running=!running;$("#playBtn").textContent=running?"Ⅱ Jeda":"▶ Lanjut";$("#simStatus").textContent=running?"Simulasi berjalan":"Simulasi dijeda";if(running)lastTime=0;});
$("#resetBtn").addEventListener("click",()=>{angle=-Math.PI/2;released=false;radius=2;omega=1.5;mass=1;$("#radiusSlider").value=2;$("#omegaSlider").value=1.5;$("#massSlider").value=1;updateReadouts();if(scenario!=="general")setScenario(scenario);drawScene()});
function animate(ts){if(!lastTime)lastTime=ts;const dt=Math.min((ts-lastTime)/1000,.05);lastTime=ts;if(running&&!released){angle+=omega*dt;if(angle>Math.PI*2)angle-=Math.PI*2;}drawScene();raf=requestAnimationFrame(animate)}
resizeCanvas();updateReadouts();raf=requestAnimationFrame(animate);

// --- Concept quiz based on the uploaded six-item diagnostic worksheet ---
const questions=[
{tag:"KECEPATAN LINEAR • KOMIDI PUTAR",q:"Dua siswa berada pada jarak berbeda dari pusat komidi putar yang berputar dengan kecepatan sudut tetap. Siswa A dekat pusat dan siswa B di tepi. Pernyataan yang benar adalah ...",opts:["Kecepatan linear kedua siswa sama.","Kecepatan sudut siswa B lebih besar.","Kecepatan linear siswa B lebih besar.","Kecepatan linear siswa B lebih kecil.","Keduanya tidak memiliki kecepatan linear."],correct:2,reasons:["Siswa di tepi menempuh waktu lebih lama untuk satu putaran.","Kecepatan linear bergantung pada jarak dari pusat, sedangkan kecepatan sudut keduanya sama.","Siswa di tepi memiliki massa lebih besar.","Siswa dekat pusat bergerak lebih cepat karena lintasannya lebih pendek.","Semua titik memiliki kecepatan linear sama."],reasonCorrect:1,explain:"Pada komidi putar yang berputar sebagai satu benda tegar, semua titik memiliki ω dan periode yang sama. Karena v = ωr, titik B yang memiliki jari-jari lebih besar mempunyai kecepatan linear lebih besar."},
{tag:"ARAH GERAK • BOLA DAN TALI",q:"Bola diputar menggunakan tali hingga bergerak melingkar. Tiba-tiba tali putus. Bagaimana arah gerak bola sesaat setelah tali putus (dalam kerangka pengamat diam, dengan pengaruh gaya lain diabaikan)?",opts:["Menuju pusat lingkaran.","Menjauhi pusat secara radial.","Bergerak lurus menyinggung lintasan lingkaran.","Tetap bergerak melingkar.","Langsung berhenti."],correct:2,reasons:["Bola selalu bergerak menuju pusat lingkaran.","Setelah tali putus, bola tidak lagi mendapat gaya sentripetal dan cenderung bergerak lurus sesuai arah kecepatannya saat itu.","Gaya sentrifugal mendorong bola keluar secara radial.","Gravitasi membuat bola bergerak melingkar.","Bola kehilangan seluruh kecepatannya ketika tali putus."],reasonCorrect:1,explain:"Tegangan tali sebelumnya menyediakan gaya menuju pusat. Ketika tali putus, arah kecepatan sesaat tetap tangensial. Dalam kondisi ideal tanpa gaya lain, benda bergerak lurus dengan arah tersebut."},
{tag:"GAYA SENTRIPETAL • MOTOR",q:"Sepeda motor melewati tikungan datar. Gaya apakah yang dapat memberikan resultan gaya menuju pusat tikungan agar motor mengikuti lintasan melingkar tanpa selip?",opts:["Gaya dorong mesin ke depan.","Gaya gesek statis antara ban dan permukaan jalan.","Gaya sentrifugal yang mendorong motor keluar.","Gaya gravitasi ke bawah.","Gaya normal jalan yang selalu mengarah ke pusat."],correct:1,reasons:["Mesin selalu memberikan gaya ke arah pusat tikungan.","Gravitasi membuat motor bergerak melingkar di jalan.","Gaya sentrifugal merupakan gaya utama yang menjaga motor di tikungan.","Gaya gesek ban dengan jalan dapat memberikan gaya ke arah pusat sehingga arah gerak motor berubah.","Jalan melengkung membuat motor otomatis bergerak melingkar tanpa gaya."],reasonCorrect:3,explain:"Pada tikungan datar, gaya gesek statis antara ban dan jalan dapat menjadi resultan gaya radial menuju pusat. Gaya sentripetal bukan gaya baru, melainkan nama untuk resultan gaya ke arah pusat."},
{tag:"PERCEPATAN • KINCIR RIA",q:"Sebuah gondola kincir ria bergerak dengan kelajuan tetap. Mengapa gondola tetap mengalami percepatan?",opts:["Percepatannya nol karena kelajuan tetap.","Percepatan selalu searah dengan kecepatan.","Percepatan selalu menjauhi pusat.","Percepatan selalu menuju pusat kincir.","Percepatan hanya terjadi di bagian atas."],correct:3,reasons:["Kelajuan tetap berarti benda tidak mengalami perubahan gerak sama sekali.","Gravitasi selalu membuat percepatan menjauhi pusat.","Arah kecepatan terus berubah meskipun kelajuan tetap, sehingga muncul percepatan menuju pusat.","Gondola semakin cepat saat mendekati pusat.","Percepatan hanya bergantung pada massa."],reasonCorrect:2,explain:"Kecepatan merupakan vektor. Walaupun besar kecepatan (kelajuan) tetap, arahnya berubah terus. Perubahan arah ini menimbulkan percepatan sentripetal yang menuju pusat lingkaran."},
{tag:"ARAH GERAK • MESIN CUCI",q:"Air keluar melalui lubang tabung mesin cuci yang sedang berputar. Jika diamati dari kerangka pengamat diam di luar mesin, arah gerak air sesaat setelah keluar adalah ...",opts:["Menuju pusat tabung.","Menjauhi pusat secara radial.","Tetap melingkar mengikuti tabung.","Lurus menuju bagian atas mesin.","Lurus menyinggung lintasan pada titik keluarnya."],correct:4,reasons:["Air tidak lagi mendapat gaya sentripetal yang cukup dari tabung sehingga cenderung bergerak lurus sesuai arah kecepatannya saat itu.","Gaya sentrifugal selalu mendorong air secara radial keluar.","Air selalu bergerak menuju pusat ketika tabung berputar.","Gravitasi membuat air bergerak ke arah lubang.","Air memiliki kecepatan sudut lebih besar daripada tabung."],reasonCorrect:0,explain:"Saat air keluar dan tidak lagi dipaksa mengikuti lintasan melingkar oleh dinding tabung, arah kecepatannya sesaat adalah tangensial. Setelah itu, lintasan dapat dipengaruhi gravitasi dan gaya lain."},
{tag:"KECEPATAN LINEAR • RODA SEPEDA",q:"Pada roda sepeda yang berputar sebagai benda tegar, titik A dekat pusat dan titik B di tepi. Jika roda berputar dengan kecepatan sudut tetap, bagaimana perbandingan kecepatan linear keduanya?",opts:["Kecepatan linear A lebih besar.","Kecepatan linear A sama dengan B.","Kecepatan linear B lebih besar.","Kedua titik memiliki kecepatan linear nol.","Kecepatan linear berubah secara acak."],correct:2,reasons:["Titik dekat pusat menempuh lintasan lebih panjang dalam satu putaran.","Semua titik memiliki kecepatan sudut sama sehingga kecepatan linearnya juga sama.","Kecepatan linear bergantung pada jarak dari pusat; semakin besar jari-jari lintasan, semakin besar kecepatan linear.","Titik di tepi memiliki massa lebih besar.","Titik dekat pusat mengalami gaya sentripetal lebih besar."],reasonCorrect:2,explain:"Untuk roda tegar, semua titik memiliki kecepatan sudut sama. Namun v = ωr, sehingga titik B yang lebih jauh dari sumbu memiliki kecepatan linear lebih besar daripada titik A."}
];
let qi=0,selected=-1,reason=-1,confidence=-1,answers=[],score=0;
function renderQuestion(){
 const q=questions[qi];selected=-1;reason=-1;confidence=-1;
 $("#questionCounter").textContent=`PERTANYAAN ${qi+1} DARI ${questions.length}`;$("#questionNumber").textContent=String(qi+1).padStart(2,"0");$("#quizProgressFill").style.width=((qi)/questions.length*100)+"%";
 $("#questionTag").textContent=q.tag;$("#questionText").textContent=q.q;$("#answerList").innerHTML="";
 q.opts.forEach((op,i)=>{const b=document.createElement("button");b.className="answer-option";b.innerHTML=`<span class="letter">${"ABCDE"[i]}</span><span>${op}</span>`;b.addEventListener("click",()=>{selected=i;$$(".answer-option").forEach((el,j)=>el.classList.toggle("selected",j===i))});$("#answerList").appendChild(b)});
 $("#reasonSelect").innerHTML='<option value="">Pilih alasan yang paling sesuai</option>'+q.reasons.map((r,i)=>`<option value="${i}">${i+1}. ${r}</option>`).join("");
 $("#confidenceOptions").innerHTML="";for(let i=0;i<=5;i++){const b=document.createElement("button");b.textContent=i;b.addEventListener("click",()=>{confidence=i;$$(".confidence-options button").forEach((el,j)=>el.classList.toggle("selected",i===j))});$("#confidenceOptions").appendChild(b)}
 $("#feedbackBox").className="feedback hidden";$("#checkAnswer").classList.remove("hidden");$("#nextQuestion").classList.add("hidden");$("#prevQuestion").disabled=qi===0;$("#prevQuestion").style.opacity=qi===0?".4":"1";
}
$("#checkAnswer").addEventListener("click",()=>{
 if(selected<0||!$("#reasonSelect").value||confidence<0){alert("Pilih jawaban, alasan, dan tingkat keyakinan terlebih dahulu.");return}
 reason=+$("#reasonSelect").value;const q=questions[qi],correct=selected===q.correct&&reason===q.reasonCorrect;
 answers[qi]={selected,reason,confidence,correct};const box=$("#feedbackBox");box.className="feedback "+(correct?"correct":"incorrect");
 box.innerHTML=`<strong>${correct?"Tepat! Jawaban dan alasanmu sesuai.":"Mari kita luruskan konsepnya."}</strong><br>Jawaban yang tepat: <b>${"ABCDE"[q.correct]}. ${q.opts[q.correct]}</b><br>${q.explain}<br><small>Keyakinan yang kamu pilih: ${confidence}/5</small>`;
 $("#checkAnswer").classList.add("hidden");$("#nextQuestion").classList.remove("hidden");$("#nextQuestion").textContent=qi===questions.length-1?"Lihat hasil →":"Selanjutnya →";
});
$("#prevQuestion").addEventListener("click",()=>{if(qi>0){qi--;renderQuestion()}});
$("#nextQuestion").addEventListener("click",()=>{if(qi<questions.length-1){qi++;renderQuestion()}else showResult()});
function showResult(){score=answers.filter(a=>a&&a.correct).length;$("#questionCard").classList.add("hidden");$(".quiz-progress").classList.add("hidden");$("#resultCard").classList.remove("hidden");$("#resultName").textContent=student.name.split(" ")[0]||"teman belajar";$("#resultScore").textContent=`${score}/${questions.length}`;$("#resultMessage").textContent=score===6?"Luar biasa! Jawaban dan alasanmu menunjukkan pemahaman konsep yang kuat.":score>=4?"Pemahamanmu sudah berkembang. Tinjau kembali pembahasan pada konsep yang belum tepat.":"Jangan khawatir. Kembali ke materi dan simulasi untuk memperkuat konsep yang masih membingungkan.";$("#quizProgressFill").style.width="100%";completed.add("quiz");}
$("#retryQuiz").addEventListener("click",()=>{qi=0;answers=[];$("#questionCard").classList.remove("hidden");$(".quiz-progress").classList.remove("hidden");$("#resultCard").classList.add("hidden");renderQuestion()});
renderQuestion();

// Mark material visited and update progress when opening it.
$$('[data-go="material"]').forEach(b=>b.addEventListener("click",()=>completed.add("material")));
$$('[data-go="simulation"]').forEach(b=>b.addEventListener("click",()=>completed.add("simulation")));
