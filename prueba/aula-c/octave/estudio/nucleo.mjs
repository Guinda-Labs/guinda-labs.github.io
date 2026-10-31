// Servicios JupyterLite 0.8.7 / xeus 5.1; sin HTTP de ejecución ni núcleo remoto.
export class NucleoWeb {
  constructor({frame, t, log = event => console.info(JSON.stringify(event))}) {
    this.frame = frame; this.t = t; this.log = log; this.pending = new Map(); this.epoch = 0;
  }
  async iniciar() {
    let timer;
    try {
      return await Promise.race([this.arrancar(),new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(Error(this.t('error.start'))),180000);
      })]);
    } finally { clearTimeout(timer); clearTimeout(this.poll); }
  }
  async arrancar() {
    const began = Date.now();
    const app = await new Promise((resolve, reject) => {
      const poll = () => {
        const app = this.frame.contentWindow?.jupyterapp;
        if (app) return resolve(app);
        if (Date.now() - began > 180000) return reject(Error(this.t('error.start')));
        this.poll = setTimeout(poll, 100);
      };
      poll();
    });
    this.app = app;
    await app.started;
    await app.restored;
    await app.serviceManager.ready;
    // La consola REPL ya creó su sesión: compartirla evita arrancar otro WASM.
    this.panel = await new Promise((resolve,reject) => {
      const poll = () => {
        const panel = app.shell.currentWidget || [...app.shell.widgets('main')].find(widget => widget.sessionContext);
        if (panel?.sessionContext) return resolve(panel);
        if (Date.now()-began>180000) return reject(Error(this.t('error.start')));
        this.poll=setTimeout(poll,100);
      };
      poll();
    });
    if (!this.panel?.sessionContext) throw Error(this.t('error.start'));
    const context = this.panel.sessionContext;
    await context.ready;
    this.kernel = context.session?.kernel;
    if (!this.kernel) throw Error(this.t('error.start'));
    await this.kernel.info;
    // /drive es el montaje escribible que ya prepara JupyterLite.
    await this.ejecutar("cd('/drive'); more off; format short g;", () => {}, true);
    this.log({event:'kernel-ready', kernel:this.kernel.id, duration:Date.now()-began});
    return this.panel.console;
  }
  ejecutar(code, onMessage = () => {}, internal = false, options = {}) {
    const future = this.kernel.requestExecute({code, silent:options.silent ?? internal, store_history:options.store_history ?? !internal, allow_stdin:false, stop_on_error:true});
    const id = future.msg.header.msg_id, began = Date.now(), epoch = this.epoch;
    this.log({event:'execute-start', id, kernel:this.kernel.id, internal, length:code.length});
    return new Promise((resolve,reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id); future.dispose();
        this.log({event:'execute-timeout',id,duration:Date.now()-began});
        reject(Error(this.t('error.timeout')));
      },180000);
      this.pending.set(id,{reject,future,timer});
      let diagnostic;
      future.onIOPub = msg => {
        if (epoch !== this.epoch) return;
        if (msg.header.msg_type === 'error') {
          diagnostic = msg.content;
          this.log({event:'execute-iopub-error',id,kernel:this.kernel.id,internal,...diagnostic});
        }
        onMessage(msg);
      };
      future.done.then(reply => {
        this.log({event:'execute-end',id,status:reply.content.status,duration:Date.now()-began});
        if (reply.content.status === 'error') {
          reject(errorEjecucion(diagnostic || reply.content));
        } else resolve(reply);
      },error=>{
        this.log({event:'execute-error',id,kernel:this.kernel.id,duration:Date.now()-began,message:error.message,stack:error.stack});
        reject(diagnostic ? errorEjecucion(diagnostic) : error);
      }).finally(() => { clearTimeout(timer); this.pending.delete(id); });
    });
  }
  cancelar() {
    this.epoch++;
    for (const [id,{reject,future,timer}] of this.pending) {
      this.log({event:'execute-cancel',id,kernel:this.kernel?.id});
      clearTimeout(timer); reject(Error(this.t('error.cancel'))); future.dispose();
    }
    this.pending.clear();
  }
  async reiniciar() {
    this.cancelar();
    this.log({event:'kernel-restart',kernel:this.kernel?.id});
    await this.kernel.restart();
    await this.ejecutar("cd('/drive'); more off; format short g;",()=>{},true);
  }
}

export function errorEjecucion(content) {
  const {ename = '', evalue = '', traceback = []} = content;
  const error = Error([[ename,evalue].filter(Boolean).join(': '),...traceback].filter(Boolean).join('\n'));
  Object.assign(error,{ename,evalue,traceback});
  return error;
}
