function imwrite (image, filename, varargin)
  if exist('__magick_write__')
    aulac_native('imwrite',image,filename,varargin{:}); return;
  endif
  if !ischar(filename) || isempty(filename) || !isempty(varargin), error('AULA-C: imwrite web admite imagen y nombre; exporta PNG'); endif
  if filename(1) != '/', filename = fullfile(pwd(),filename); endif
  if !strncmp(filename,'/drive/',7) || any(strcmp(strsplit(filename,'/'),'..'))
    error('AULA-C: salida fuera de /drive');
  endif
  path = ['/drive/.aulac/out/' filename(8:end) '.raw'];
  aulac_rawwrite(image,path);
  fprintf('__AULAC_DOWNLOAD__%s\n', path(8:end));
endfunction
