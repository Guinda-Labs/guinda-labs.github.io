# I. Aislamiento óptico con MOC3021 y 4N25

## 1. Objetivo y alcance

Propuesta AULA-C: aislamiento óptico con moc3021 y 4n25. Observar transferencia óptica. Las referencias se unen solo para medir en simulación; no hay trayectoria conductora interna entre LED y salida. No demuestra aislamiento de seguridad.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `VLED:0`, salida `XO:4` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 1e-05, "stop": 0.005, "start": 1, "end": 10000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

A 26.85 °C, resolver 5=680I+10I+2VT ln(I/1e−20): I≈4.205 mA; CTR=0.5 da IC≈2.102 mA y VC=5−1000IC≈2.898 V. MOC: ILED≈11 mA >5 mA; RON=20 Ω da VL=12×1000/(1000+20)=11.7647 V. Repetir con LED apagados.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| collector_v | 2.898 | ±0.05 |
| load_v | 11.7647 | ±0.05 |
| dark_v | 5 | ±0.01 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| VLED | a:1, a:2 |
| RLED | a:4, a:5 |
| XO | e:8, e:9, e:10, f:10, f:9, f:8 |
| VCC | a:12, a:13 |
| RC | a:15, a:16 |
| VLED2 | a:18, a:19 |
| RLED2 | a:21, a:22 |
| XM | e:25, e:26, e:27, f:27, f:26, f:25 |
| VISO | a:29, a:30 |
| RL | a:32, a:33 |
| G1 | a:35 |

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
