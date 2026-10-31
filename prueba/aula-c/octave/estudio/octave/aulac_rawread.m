function image = aulac_rawread (path)
  fid = fopen(path, 'rb', 'ieee-le');
  if fid < 0
    error('AULA-C: imagen no disponible. Use Subir archivos o Abrir carpeta para subir la imagen junto al script: %s', path);
  endif
  unwind_protect
    dims = fread(fid, 3, 'uint32=>double');
    if numel(dims) != 3 || any(dims < 1) || !any(dims(3) == [1 3])
      error('AULA-C: encabezado RAW invalido: %s', path);
    endif
    bytes = fread(fid, Inf, '*uint8');
    if numel(bytes) != prod(dims), error('AULA-C: RAW truncado: %s', path); endif
    % El navegador intercala canales por filas; Octave almacena por columnas.
    image = permute(reshape(bytes, [dims(3), dims(2), dims(1)]), [3 2 1]);
  unwind_protect_cleanup
    fclose(fid);
  end_unwind_protect
endfunction
