# V. Sallen-Key pasabajas de segundo orden

## 1. Objetivo y alcance

Propuesta AULA-C: sallen-key pasabajas de segundo orden. Bode Butterworth aproximado con ganancia K=1.586; dos resistencias y dos capacitores iguales, alimentación ±12 V.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `VIN:0`, salida `XA:0` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 2e-06, "stop": 0.02, "start": 10, "end": 100000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

Por KCL en los dos nodos RC: H(s)=K/[(sRC)²+(3−K)sRC+1]. K=1+5860/10000=1.586; Q=1/(3−K)=.707214; ω0=1/(RC); f0=1591.549 Hz. Como Q≈1/√2, |H(f0)|≈K/√2 y fc≈1592 Hz. El modelo TL072 no predice GBW ni slew rate.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| cutoff_hz | 1591.549 | ±40 |
| gain | 1.586 | ±0.01 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| VIN | a:1, a:2 |
| VP | a:4, a:5 |
| VN | a:7, a:8 |
| R1 | a:10, a:11 |
| R2 | a:13, a:14 |
| C1 | a:16, a:17 |
| C2 | a:19, a:20 |
| XA | e:24, e:25, e:26, e:27, f:27, f:26, f:25, f:24 |
| RF | a:30, a:31 |
| RG | a:34, a:35 |
| G1 | a:38 |

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
