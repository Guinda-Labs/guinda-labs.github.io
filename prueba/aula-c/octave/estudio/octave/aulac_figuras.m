function aulac_figuras ()
  % Captura sin alterar CData/ZData ni el espacio base del usuario.
  fprintf('__AULAC_FIGURES_BEGIN__\n');
  figures = findall(0, 'type', 'figure');
  for f = reshape(sort(figures),1,[])
    name = regexprep(get(f,'name'), '[|\r\n]', ' ');
    if isempty(name), name = sprintf('Figure %g',f); endif
    fprintf('__AULAC_FIGURE__%g|%s\n', f, name);
    axes_list = findall(f, 'type', 'axes');
    for a = 1:numel(axes_list)
      ax = axes_list(a);
      heading = get(get(ax,'title'),'string');
      if iscell(heading), heading = strjoin(heading,' '); endif
      heading = regexprep(heading, '[|\r\n]', ' ');
      pos = get(ax,'position');
      colors = get(ax,'xcolor');
      grid_color = get(ax,'gridcolor');
      if strcmp(get(0,'defaultfigurecolor'), [0 0 0]) || sum(get(f,'color')) < 1.5
        set(ax,'color',[0.12 0.12 0.12],'xcolor',[0.88 0.88 0.88],'ycolor',[0.88 0.88 0.88],'zcolor',[0.88 0.88 0.88],'gridcolor',[0.55 0.55 0.55]);
        set(get(ax,'title'),'color',[0.92 0.92 0.92]);
      endif
      children = get(ax,'children');
      for c = reshape(children,1,[])
        kind = get(c,'type');
        path = sprintf('/drive/.aulac/view/f%g-a%d-c%g', f,a,abs(c));
        reduced = 0;
        if strcmp(kind,'image')
          image = get(c,'cdata');
          if size(image,3) == 1
            map = colormap(ax); values = double(image);
            if isa(image,'uint8')
              values = values + 1;
              map = gray(256);
            elseif islogical(image)
              values = values + 1;
              map = gray(2);
            elseif strcmp(get(c,'cdatamapping'),'scaled')
              limits = get(ax,'clim');
              values = 1 + floor((values-limits(1))*rows(map)/max(eps,limits(2)-limits(1)));
            elseif isinteger(image)
              values = 1 + floor((values-double(intmin(class(image)))) * rows(map) / (double(intmax(class(image)))-double(intmin(class(image)))));
            endif
            values = max(1,min(rows(map),values));
            image = reshape(map(values(:),:),[size(image,1),size(image,2),3]);
          endif
          aulac_rawwrite(image,[path '.raw']);
          path = [path '.raw'];
        elseif strcmp(kind,'surface')
          z = get(c,'zdata'); x = get(c,'xdata'); y = get(c,'ydata');
          step = max(1,ceil(max(size(z))/128)); reduced = step > 1;
          rr = unique([1:step:rows(z),rows(z)]); cc = unique([1:step:columns(z),columns(z)]);
          if isvector(x), x = repmat(x(:).',rows(z),1); endif
          if isvector(y), y = repmat(y(:),1,columns(z)); endif
          sample = [x(rr,cc); y(rr,cc); z(rr,cc)];
          path = [path '.txt'];
          folder = fileparts(path); if !exist(folder,'dir'), mkdir(folder); endif
          dlmwrite(path,sample,'precision',9);
          dlmwrite([path '.map'],colormap(ax),'precision',9);
          dlmwrite([path '.axes'],[pos get(ax,'xlim') get(ax,'ylim') get(ax,'zlim')],'precision',9);
        else
          continue;
        endif
        fprintf('__AULAC_AXES__%g|%s|%s|%s|%g,%g,%g,%g|%d\n',f,kind,path(8:end),heading,pos,reduced);
      endfor
    endfor
  endfor
  fprintf('__AULAC_FIGURES_END__\n');
endfunction
