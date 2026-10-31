export function analizarFiguras(source) {
  if(!source.includes('__AULAC_FIGURES_END__')) throw Error('FIGURES_INCOMPLETE');
  const figures=new Map();
  for(const line of source.split(/\r?\n/)) {
    if(line.startsWith('__AULAC_FIGURE__')) {
      const [id,name]=line.slice(16).split('|');
      figures.set(id,{id,name,axes:[]});
    } else if(line.startsWith('__AULAC_AXES__')) {
      const [id,kind,path,title,position,reduced]=line.slice(14).split('|');
      if(!figures.has(id) || !['image','surface'].includes(kind) || !/^\.aulac\/view\/[\w.\-]+$/.test(path)) throw Error('FIGURES_ROW');
      const pos=position.split(',').map(Number);
      if(pos.length!==4 || !pos.every(Number.isFinite)) throw Error('FIGURES_POSITION');
      figures.get(id).axes.push({kind,path,title,position:pos,reduced:reduced==='1'});
    }
  }
  return [...figures.values()];
}
// Comparte selección y nombres entre MIME nativo y capturas de imágenes/superficies.
export class PestanasFiguras {
  constructor(tabs,host,document) {this.tabs=tabs;this.host=host;this.document=document;this.entries=new Map();}
  obtener(id,name) {
    let entry=this.entries.get(id);
    if(!entry) {
      const button=this.document.createElement('button'), container=this.document.createElement('div');
      button.setAttribute('role','tab'); container.setAttribute('role','tabpanel');
      button.onclick=()=>this.seleccionar(id); this.tabs.append(button); this.host.append(container);
      entry={button,container}; this.entries.set(id,entry);
    }
    entry.button.textContent=name; this.seleccionar(id); return entry.container;
  }
  seleccionar(id) {
    for(const [key,entry] of this.entries) {entry.container.hidden=key!==id;entry.button.setAttribute('aria-selected',String(key===id));}
    this.active=id;
  }
  limpiar() {this.entries.clear();this.tabs.replaceChildren();this.host.replaceChildren();}
}
