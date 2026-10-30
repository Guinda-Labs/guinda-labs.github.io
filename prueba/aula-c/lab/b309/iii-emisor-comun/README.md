# III. Emisor común con divisor y RE desviada

## 1. Objetivo y alcance

Propuesta AULA-C: emisor común con divisor y re desviada. Reutiliza la topología y valores de lab/circuito.mjs amplificador(); entrada pequeña para no recortar. β=100, IS=10 fA, sin efecto Early en el modelo nativo.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `V2:0`, salida `RL:0` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 2e-06, "stop": 0.01, "start": 1, "end": 100000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

Vth=12×10/57=2.1053 V; Rth=47k||10k=8.2456 kΩ. Con VBE≈0.67 V: IB=(Vth−VBE)/(Rth+101RE)=13.138 µA, IC=1.3138 mA, VE=1.3269 V; VCE≈7.7828 V. gm=IC/VT≈0.05082 S (VT=25.852 mV), rπ=β/gm≈1968 Ω. Av≈−gm(RC||RL)=−91.64; Zin=Rth||rπ≈1588 Ω; Zout≈RC=2200 Ω. El polo de CE usa RE||(rπ/101)≈19.1 Ω: fL≈83 Hz, ganancia a 10 Hz menor que a 1 kHz. Sin capacitancias de unión, el modelo no permite predecir fH comercial.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| gain | 91.64 | ±8 |
| vce | 7.7828 | ±0.3 |
| zin | 1588 | ±160 |
| zout | 2200 | ±5 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| V1 | a:1, a:2 |
| V2 | a:4, a:5 |
| R1 | a:7, a:8 |
| R2 | a:10, a:11 |
| RC | a:13, a:14 |
| RE | a:16, a:17 |
| CE | a:19, a:20 |
| C1 | a:22, a:23 |
| C2 | a:25, a:26 |
| RL | a:28, a:29 |
| Q1 | a:32, a:33, a:34 |
| G1 | a:37 |

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
