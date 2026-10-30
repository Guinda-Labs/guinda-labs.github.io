# II. Rectificación y rizo capacitivo

Piloto de estudio: en el cuaderno, abrir **Estudiar · B309 · Rectificador**. Incluye 15 tarjetas y tres preguntas originales por revisar por un profesor. Formato, modelos, tolerancias y reproducción: [docs/ESTUDIO.md](../../../docs/ESTUDIO.md). Banco en `estudio/` de la raíz del repositorio.

## 1. Objetivo y alcance

Propuesta AULA-C: rectificación y rizo capacitivo. Comparar media onda y puente de onda completa a 12 V pico, 60 Hz, con carga 1 kΩ y 1000 µF.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `VAC:0`, salida `RL:0` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 2e-05, "stop": 1, "start": 1, "end": 10000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

Con caída aproximada VD=0.65 V, Vp completo=10.70 V y Vp media=11.35 V. De C ΔV=I Δt, ΔV≈Vdc/(RL f_r C), Vdc≈Vp−ΔV/2; despejar Vdc=Vp/[1+1/(2RL f_r C)]. Completo fr=120: Vdc=10.6556 V, ΔV=0.0888 Vpp. Media fr=60: Vdc=11.2562 V, ΔV=0.1876 Vpp. Se permite error de caída y del tiempo de conducción. Para media onda usar el segundo esquema.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| full_v | 10.6556 | ±0.5 |
| full_ripple | 0.0888 | ±0.025 |
| half_v | 11.2562 | ±0.5 |
| half_ripple | 0.1876 | ±0.04 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| VAC | a:1, a:2 |
| XB | e:5, e:6, f:6, f:5 |
| C1 | a:9, a:10 |
| RL | a:12, a:13 |
| G1 | a:15 |

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
