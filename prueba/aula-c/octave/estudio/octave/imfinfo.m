function info = imfinfo (filename, varargin)
  if exist('__magick_read__')
    info = aulac_native('imfinfo',filename,varargin{:}); return;
  endif
  image = imread(filename, varargin{:});
  [~,~,extension] = fileparts(filename);
  kind = 'grayscale'; if size(image,3) == 3, kind = 'truecolor'; endif
  info = struct('Filename',filename,'Width',size(image,2),'Height',size(image,1), ...
                'BitDepth',8*size(image,3),'ColorType',kind,'Format',lower(extension(2:end)));
endfunction
