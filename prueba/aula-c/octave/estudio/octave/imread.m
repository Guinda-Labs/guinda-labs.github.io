function [image, map, alpha] = imread (filename, varargin)
  if exist('__magick_read__')
    [image,map,alpha] = aulac_native('imread',filename,varargin{:});
    return;
  endif
  if !isempty(varargin), error('AULA-C: imread web admite solo el nombre del archivo'); endif
  if !ischar(filename) || isempty(filename), error('AULA-C: nombre de imagen invalido'); endif
  if filename(1) != '/', filename = fullfile(pwd(), filename); endif
  original = canonicalize_file_name(filename);
  if !isempty(original), filename = original; endif
  if !strncmp(filename, '/drive/', 7), error('AULA-C: imagen fuera de /drive'); endif
  image = aulac_rawread(['/drive/.aulac/img/' filename(8:end) '.raw']);
  map = []; alpha = [];
endfunction
