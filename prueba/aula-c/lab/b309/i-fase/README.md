# I. Control de fase TRIAC y DIAC

## 1. Objetivo y alcance

Propuesta AULA-C: control de fase triac y diac. Variar RT para modificar la carga RC y el instante de ruptura del DIAC; integrar la potencia de la carga.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `XRED:0`, salida `RL:0` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 5e-06, "stop": 0.15, "start": 1, "end": 10000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

La conexión de carga se documenta en el esquema. Para una senoide recortada simétrica, P=(127²/100)[1−α/π+sin(2α)/(2π)], obtenida integrando Vm² sin²(θ)/R entre α y π en ambos semiciclos. Sea k=ωRT CT. Resolver vC(α)=Vm[sinα−k cosα+k exp(−α/k)]/(1+k²)−VB exp(−π/k)=VB, VB≈32.8 V (ruptura DIAC más compuerta). El término residual procede de vC(0)=−VB exp[−(π−α)/k]. Se desprecia la caída del TRIAC durante conducción. RT=47000 Ω: α=57.0028°, P=133.6621 W; RT=100000 Ω: α=99.4729°, P=63.8224 W. Tolerancias: 3° por umbral y memoria de 5 µs; 5 W por caída y corriente de mantenimiento.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| alpha_47000 | 57.0028 | ±3 |
| power_47000 | 133.6621 | ±5 |
| alpha_100000 | 99.4729 | ±3 |
| power_100000 | 63.8224 | ±5 |

## 4. Montaje y seguridad

**SOLO SIMULACIÓN DE RED 127 V. Sin protoboard. No realizar este montaje en red doméstica.**

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
