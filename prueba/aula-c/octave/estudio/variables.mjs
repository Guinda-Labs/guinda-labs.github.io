// Protocolo de texto: una fila por variable, sin serializadores JSON en Octave.
export const snapshotCode = `
function __aulac_snapshot__()
  had_ans = evalin('base', "exist('ans','var')");
  if had_ans, saved_ans = evalin('base', 'ans'); endif
  info = evalin('base', 'whos');
  for k = 1:numel(info)
    v = info(k);
    short = '';
    try
      if numel(v.size) <= 2 && (prod(v.size) <= 12 || all(v.size <= 4)) && any(strcmp(v.class, {'double','single','logical','int8','uint8','int16','uint16','int32','uint32','int64','uint64','char'}))
        value = evalin('base', v.name);
        short = mat2str(value);
      endif
    catch
      short = '';
    end_try_catch
    dims = sprintf('%dx', v.size);
    if !isempty(dims), dims(end) = []; endif
    short = regexprep(short, '[|\\r\\n]', ' ');
    fprintf('__AULAC_WHOS_ROW__%s|%s|%s|%s\\n', v.name, dims, v.class, short);
  endfor
  if had_ans, assignin('base', 'ans', saved_ans); else evalin('base', 'clear ans'); endif
endfunction
__aulac_snapshot__();
`;
export function analizarWhos(source) {
  const lines = source.split(/\r?\n/).filter(line => line.startsWith('__AULAC_WHOS_ROW__'));
  return lines.map(line => {
    const fields = line.slice('__AULAC_WHOS_ROW__'.length).split('|');
    if (fields.length !== 4) throw Error('WHOS_ROW');
    const [name, dimensions, type, value] = fields;
    const size = dimensions.split('x').map(Number);
    if (!/^[A-Za-z_]\w*$/.test(name) || !size.length ||
        !size.every(n => Number.isSafeInteger(n) && n >= 0) || !/^[A-Za-z]\w*$/.test(type)) throw Error('WHOS_ROW');
    return {name, size, class:type, value};
  }).filter(row => !row.name.startsWith('__aulac_'));
}

// Los límites son líneas %% completas; el cursor en el marcador pertenece a la sección siguiente.
export function seccionActual(source, line) {
  const lines=source.split(/\r?\n/), marker=text=>/^\s*%%(?:\s|$)/.test(text);
  line=Math.max(0,Math.min(lines.length-1,line));
  let start=line, end=line+1;
  while(start>0 && !marker(lines[start])) start--;
  if(marker(lines[start])) start++;
  while(end<lines.length && !marker(lines[end])) end++;
  return lines.slice(start,end).join('\n');
}
