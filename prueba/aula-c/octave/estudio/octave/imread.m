function [image, map, alpha] = imread (filename, varargin)
  if !isempty(varargin), error('AULA-C: imread web admite solo el nombre del archivo'); endif
  if !ischar(filename) || isempty(filename), error('AULA-C: nombre de imagen invalido'); endif
  [~,~,extension] = fileparts(filename);
  if !any(strcmpi(extension, {'.jpg','.jpeg','.png','.bmp','.gif','.webp'}))
    error('AULA-C: formato de imagen no compatible: %s. Use JPG, JPEG, PNG o BMP.', extension);
  endif
  % El simbolo __magick_read__ puede existir aunque Image IO este deshabilitado.
  % El RAW preparado por el navegador es la fuente de lectura del estudio web.
  if filename(1) != '/', filename = fullfile(pwd(), filename); endif
  original = canonicalize_file_name(filename);
  if !isempty(original), filename = original; endif
  if !strncmp(filename, '/drive/', 7), error('AULA-C: imagen fuera de /drive'); endif
  image = aulac_rawread(['/drive/.aulac/img/' filename(8:end) '.raw']);
  map = []; alpha = [];
endfunction
