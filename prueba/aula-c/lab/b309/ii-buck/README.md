# II. Convertidor reductor PWM

## 1. Objetivo y alcance

Propuesta AULA-C: convertidor reductor pwm. PWM 20 kHz, D=0.5, puerta flotante respecto a la fuente del NMOS. El generador ideal representa un driver aislado; no conectar así un GPIO real.
No es texto oficial ni montaje clínico. Las fuentes de estas prácticas son simuladas.

## 2. Circuitos y análisis

Abrir `esquema.aulac.json` en el laboratorio con el paquete `b309-analogica-potencia`.
Sondas: entrada `VIN:0`, salida `RL:0` (referencias de terminal; la app resuelve el nodo).
Análisis: `{"dt": 5e-06, "stop": 0.2, "start": 10, "end": 100000}`. Ejecutar desde la raíz:
`D:/Tools/nodejs/node.exe --test lab/b309.test.mjs`.
Los ensayos usan el mismo esquema compilado que abre la app, sin circuitos de prueba sustitutos.

## 3. Cálculo manual y tolerancias

Balance volt-segundo: D(Vin−Vo−Ion Ron)+(1−D)(−Vo−VD)=0. Ideal Vo=D Vin=6 V; con VD≈0.24 V y Ron≈1/[KP(VGS−VTO)]=0.0714 Ω resulta Vo≈5.878 V. ΔIL≈(12−6)D/(Lf)=15 mApp <2Io≈118 mA: CCM. ΔVo≈ΔIL/(8fC)=0.9375 mVpp, sin ESR.

| Magnitud | Valor calculado | Tolerancia absoluta |
|---|---:|---:|
| output_v | 5.878 | ±0.15 |
| ripple_v | 0.00094 | ±0.0005 |

## 4. Montaje y seguridad

`protoboard.aulac.json` contiene colocación manual, sin autocolocador. Las letras a-e y f-j son bloques separados; los puentes están en d/i de la misma columna. Alimentación de laboratorio aislada y limitada en corriente.

| Componente | Agujeros (orden de terminales del esquema) |
|---|---|
| VIN | a:1, a:2 |
| VPWM | a:4, a:5 |
| XM | a:8, a:9, a:10 |
| XD | a:13, a:14 |
| L1 | a:17, a:18 |
| C1 | a:21, a:22 |
| RL | a:25, a:26 |
| G1 | a:29 |

## 5. Conclusiones y decisiones pendientes

Alumno: explicar diferencias entre aproximación manual y simulación; identificar región de operación y límites del modelo. Antes de cualquier hardware: revisar patillaje real, potencias, aislamiento y supervisión docente. No hay validación térmica ni certificación de seguridad.
