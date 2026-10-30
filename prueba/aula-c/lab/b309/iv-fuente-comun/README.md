# IV. Fuente común con MOSFET

## 1. Objetivo y alcance

Propuesta AULA-C: fuente común con mosfet. BS170 de baja potencia para amplificación; IRF540 se reserva al buck. Fuente a tierra y polarización VG=3 V.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `VG:0`, salida `RD:1` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 2e-06, "stop": 0.01, "start": 1, "end": 100000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

Nivel 1: ID=KP(VGS−VTO)²(1+λVD)/2, KP=.02, VTO=2, λ=.02. Usando VD=12−470ID: ID=.0124/1.094=.0113346 A, VD=6.67276 V; VD>VGS−VTO=1 V implica saturación. gm=.02(1+.02VD)=.0226691 S; ro=1/(.01×.02)=5000 Ω. Av=−gm(RD||ro)=−9.73898; puerta ideal, Zin=1 MΩ.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| drain_v | 6.67276 | ±0.05 |
| gain | 9.73898 | ±0.15 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| VDD | a:1, a:2 |
| VG | a:4, a:5 |
| XM | a:8, a:9, a:10 |
| RD | a:13, a:14 |
| RG | a:17, a:18 |
| G1 | a:21 |

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
