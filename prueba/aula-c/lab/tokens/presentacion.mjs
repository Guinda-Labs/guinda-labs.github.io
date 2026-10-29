// Consulta de presentación: nunca ejecuta código en Octave.
let preference='sistema';
try{preference=localStorage.getItem('aulac-theme')||'sistema';}catch{}
const button=document.querySelector('#aulac-theme');
function theme(){
 if(!['dark','light'].includes(preference))preference='sistema';
 if(preference==='sistema')delete document.documentElement.dataset.theme;
 else document.documentElement.dataset.theme=preference;
 button.textContent='Tema: '+({dark:'oscuro',light:'claro',sistema:'sistema'}[preference]);
}
theme();
button.onclick=()=>{preference=({sistema:'dark',dark:'light',light:'sistema'}[preference]);theme();try{localStorage.setItem('aulac-theme',preference);}catch{}};
window.addEventListener('storage',e=>{if(e.key==='aulac-theme'){preference=e.newValue;theme();}});
for(const a of document.querySelectorAll('[data-ventana]'))a.addEventListener('click',e=>{
 e.preventDefault();window.open(a.href,'aulac-'+a.dataset.ventana,'width=1440,height=960,resizable=yes,scrollbars=yes')?.focus();
});
const state=document.querySelector('#aulac-state');
async function refresh(){
 if(window.AULAC_WEB){state.dataset.state='no-disponible';state.textContent='Simulación en tu navegador (motor MNA)';return;}
 try{
  const response=await fetch('/tokens/estado',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();if(!['listo','ocupado','reiniciando','no-disponible'].includes(data.state))throw Error('Estado inválido');
  state.dataset.state=data.state;state.textContent='● Octave '+(data.state==='no-disponible'?'no disponible':data.state);
 }catch{state.dataset.state='no-disponible';state.textContent='● Octave no disponible';}
}
if(!window.AULAC_WEB){
 await refresh();
 const timer=setInterval(()=>{if(!document.hidden)refresh();},1000);
 window.addEventListener('focus',refresh);
 window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
}else refresh();
