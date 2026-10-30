# V. Instrumentación para bioseñal simulada

## 1. Objetivo y alcance

Propuesta AULA-C: instrumentación para bioseñal simulada. Señal diferencial 1 mV a 10 Hz, ruido determinista 10 µV a 137 Hz y modo común 100 mV a 60 Hz. Relación con adquisición de biopotenciales en Biónica. Nunca conectar a una persona.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `VD:0`, salida `XI:4` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 1e-05, "stop": 0.3, "start": 1, "end": 1000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

Primera etapa: G1=1+2R/RG=101. Restador: k=10010/(10000+10010)=.500249875; Vout=2k A−B, donde A=Vcm+G1 Vd/2 y B=Vcm−G1 Vd/2. Ad=G1(2k+1)/2=101.025237; Acm=2k−1=.00049975. CMRR=20log10(Ad/|Acm|)=106.1137 dB. Aol=100k reduce Ad a ≈100.92. Repetir AC con VD=0 y VCM=1 para medir Acm; no inferir CMRR de la prueba diferencial sola. La fuente diferencial asimétrica introduce Vd/2 de modo común, error relativo menor de 3 ppm.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| gain | 101.025237 | ±0.3 |
| cmrr_db | 106.1137 | ±0.3 |
| bio_peak_v | 0.1021 | ±0.003 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| VCM | a:1, a:2 |
| VD | a:4, a:5 |
| VRUIDO | a:7, a:8 |
| VP | a:10, a:11 |
| VN | a:13, a:14 |
| XI | e:18, e:19, e:20, e:21, f:21, f:20, f:19, f:18 |
| RL | a:24, a:25 |
| G1 | a:28 |

## 5. Conclusiones y decisiones pendientes

## 5.1. Selección de amplificador (R19-INA)

En la tarjeta de la práctica, elegir **Amplificador de instrumentación**: INA3, AD620 o INA128. Elegir **Montaje → Protoboard manual** para observar el resistor externo. Cambiar de chip o montaje vuelve a cargar el ejemplo, por lo que se deben guardar antes las modificaciones del alumno. INA3 conserva su modelo y sus resultados anteriores; su patillaje didáctico es diferente al de los dos chips comerciales.

| Elección | Ecuación ideal | R_G del ejemplo | Ganancia ideal | Salida |
|---|---|---:|---:|---|
| INA3 | 1 + 100000/R_G, antes del error del restador | parámetro 1000 Ω | 101 | XI:4, pata 5 |
| AD620 | 1 + 49400/R_G | resistor 499 Ω | 99.997996 | XI:5, pata 6 |
| INA128 | 1 + 50000/R_G | resistor 505 Ω | 100.009901 | XI:5, pata 6 |

En los chips, KCL en las entradas inversoras impone I_G=(V_IN+−V_IN−)/R_G. Cada resistor interno R produce I_G R; al restar las dos salidas se obtiene V_O−V_REF=V_d+2R I_G=(1+2R/R_G)V_d. R=24.7 kΩ en AD620 y 25 kΩ en INA128. Sin resistor externo, I_G=0 y G=1. En INA3 se aplica además el error de su restador, descrito en §3.

AD620 e INA128: patas 1 y 8 a R_G, 2 a entrada negativa, 3 a positiva, 4 a −12 V, 5 a referencia de 0 V, 6 a RL y 7 a +12 V. XI sigue en e:18; sus patas 1 y 8 están en e:18 y f:18. R_G ocupa **a:31 y a:35**, con puentes **d:31 a d:18** e **d:35 a i:18**. La resistencia cruza dos nodos distintos, nunca el mismo bloque de contactos. Abrir también los archivos `ad620-esquema.aulac.json`, `ad620-protoboard.aulac.json`, `ina128-esquema.aulac.json` e `ina128-protoboard.aulac.json` desde el importador JSON del laboratorio.

El cuaderno de la unidad V incluye ejemplos separados AD620 e INA128. Simular la celda del chip y usar **Llevar a Octave** antes de ejecutar su comparación; cada celda fija `chip` y `RG` y selecciona su fórmula. Si se modifica el montaje, actualizar ambas variables; usar `RG=Inf` cuando se retire el resistor. Para medir CMRR, anular VD y VRUIDO y aplicar VCM AC=1; calcular 20 log10(|Ad/Acm|) con dos barridos independientes. Alimentar las patas 4 y 7: sin fuente, el macromodelo entrega cero.

Las cifras son típicas aproximadas de hoja de datos, no garantías de hardware. El modelo propio CC0 usa tres op-amps, polo dominante y un error de modo común finito. El margen fijo de salida es 1.2 V por riel. Las mediciones y los límites están en `../VALIDACION.md`, §5; prueba: `D:/Tools/nodejs/node.exe --test lab/ina.test.mjs`.

## 5.2. Decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
