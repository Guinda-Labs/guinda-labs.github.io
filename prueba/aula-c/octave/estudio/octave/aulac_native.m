function varargout = aulac_native (name, varargin)
  persistent readers;
  if strcmp(name, 'init')
    if isempty(readers)
      readers = struct('imread', @imread, 'imfinfo', @imfinfo, 'imwrite', @imwrite);
    endif
    return;
  endif
  [varargout{1:nargout}] = readers.(name)(varargin{:});
endfunction
