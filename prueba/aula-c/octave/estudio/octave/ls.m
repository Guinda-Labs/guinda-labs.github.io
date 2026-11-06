function result = ls (varargin)
  entries = dir (varargin{:});
  names = {entries.name};
  names = names(!strcmp(names, '.') & !strcmp(names, '..'));
  result = strjoin(names, '  ');
  if nargout == 0, disp(result); endif
endfunction
