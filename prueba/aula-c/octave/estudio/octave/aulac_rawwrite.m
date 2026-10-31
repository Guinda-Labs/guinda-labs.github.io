function aulac_rawwrite (image, path)
  if !(isnumeric(image) || islogical(image)) || ndims(image) > 3 || !any(size(image,3) == [1 3]) || isempty(image)
    error('AULA-C: se requiere una imagen HxWx1 o HxWx3');
  endif
  if isfloat(image), image = uint8(255 * max(0, min(1, image)));
  elseif islogical(image), image = uint8(image) * 255;
  elseif isa(image,'uint16'), image = uint8(double(image)/257);
  elseif !isa(image,'uint8'), error('AULA-C: clase de imagen no admitida'); endif
  [folder,~,~] = fileparts(path);
  if !exist(folder,'dir'), mkdir(folder); endif
  fid = fopen(path, 'wb', 'ieee-le');
  if fid < 0, error('AULA-C: no se pudo escribir %s', path); endif
  unwind_protect
    fwrite(fid, [size(image,1),size(image,2),size(image,3)], 'uint32');
    fwrite(fid, permute(image,[3 2 1]), 'uint8');
  unwind_protect_cleanup
    fclose(fid);
  end_unwind_protect
endfunction
