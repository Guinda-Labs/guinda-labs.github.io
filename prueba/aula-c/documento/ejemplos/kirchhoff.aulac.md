---
aulac: 1
plantilla: reporte-practica
portada:
  numero: 1
  subtitulo: Leyes de Kirchhoff en un circuito con dos fuentes de CD
  grupo: Grupo 2XX0
  curso: Teoría de los Circuitos
  alumno: Nombre del alumno
  profesora: Nombre de la profesora
  carrera: Nombre de la carrera
  unidad: Unidad Profesional Interdisciplinaria en Ingeniería y Tecnologías Avanzadas
  fecha: 29 de octubre de 2026
pie: "Práctica: Leyes de Kirchhoff"
---

# Práctica: Análisis y comprobación por las Leyes de Kirchhoff
Teoría de los Circuitos · Circuito resistivo con dos fuentes de CD

| | |
|---|---|
| Nombre(s): | ::: campo ::: |
| Grupo / equipo: | ::: campo ::: |
| Fecha: | ::: campo ::: |

## Objetivos
1. Aplicar la Ley de Corrientes de Kirchhoff (LCK) y la Ley de Voltajes de Kirchhoff (LVK) para resolver el circuito de la figura 1 por corrientes de rama.
2. Cotejar las corrientes y voltajes medidos con el multímetro en las puntas de prueba de la figura 1 contra los valores calculados y simulados.

## Material
- 6 resistencias de ¼ W: R1 = 470 Ω, R2 = 330 Ω, R3 = 1 kΩ, R4 = 330 Ω, R5 = 560 Ω, R6 = 470 Ω.
- 2 fuentes de CD: V1 = 12 V y V3 = 9 V (puede usarse una batería de 9 V para V3).
- 1 placa de prueba (protoboard) y cables para interconexión.

## Equipo a usar
Configure las fuentes y mida con el multímetro su valor real: V1 deberá proporcionar 12 V y V3 a 9 V.

::: requisito
**Requisito de ingreso.** El análisis por Kirchhoff (Anexo 1) y la simulación (Anexo 2) deberán realizarse con los valores reales medidos con el óhmetro. En caso contrario NO SE ACEPTARÁ SU INGRESO.
:::

## Circuito
```circuito id=circ1 analisis=dc
escenarios: nominal, medido(R=tabla1.R, V1=tabla1.V1, V3=tabla1.V3)
V1 n1 nm 12         ; fuente, + en n1 y − en nm
R1 n1 n2 470
R3 n2 gnd 1k
R6 n2 gnd 470
R4 n2 t 330
V3 t u 9            ; + hacia R4
R5 u gnd 560
R2 nm gnd 330       ; del borne − de V1 a GND
.sonda PR1 i(R1)   dir="N1→N2"
.sonda PR2 i(R4)   dir="N2→T"
.sonda PR3 i(R6)   dir="N2→GND"
.sonda PR4 i(R3)   dir="N2→GND"
.sonda PR5 v(n2)   ref=gnd
.sonda PR6 v(t)    ref=gnd
.sonda nodo1 v(n1) ref=gnd
.sonda VR2 v(R2)
```
<!-- alternativa: ```circuito archivo=aula-c/practicas/tc-kirchhoff/esquema.aulac.json -->

![Figura 1](captura:circuito#dc@nominal "Captura del laboratorio AULA-C · Simulación DC (ngspice). Las flechas de PR1 a PR4 indican el sentido de la corriente que debe reportarse; PR5 y PR6 miden voltaje respecto a GND; XMM1 mide el voltaje en R2.")

## Actividades a reportar
### 1. Valores de resistencia
Medir el valor real de las resistencias fuera del circuito. Anotar los valores obtenidos y los valores comerciales registrados en su código de colores.

| Resistencia | R1 | R2 | R3 | R4 | R5 | R6 | V1 | V3 |
|---|---|---|---|---|---|---|---|---|
| Valor propuesto | 470 Ω | 330 Ω | 1 kΩ | 330 Ω | 560 Ω | 470 Ω | 12 V | 9 V |
| Código de colores / tolerancia | {{color:470}} | {{color:330}} | {{color:1k}} | {{color:330}} | {{color:560}} | {{color:470}} | — | — |
| Valor medido | 473 | 332 | 986 | 326 | 554 | 479 | nominal | nominal |
| Desviación % respecto al propuesto | {{=desv(R1)}} | {{=desv(R2)}} | {{=desv(R3)}} | {{=desv(R4)}} | {{=desv(R5)}} | {{=desv(R6)}} | — | — |
: Tabla 1. Registro de resistencias y fuentes. {#tabla1}

### 2. Análisis por Kirchhoff
Aplicando las Leyes de Kirchhoff, resolver el circuito de la figura 1. Anexar (Anexo 1) el planteamiento de las ecuaciones de LCK y LVK y su solución detallada, con los valores medidos de la Tabla 1.

```octave nombre=Solucion produce="I1 I3 I4 I6" pliega ejecuta
R = [470 330 1000 330 560 470];  V1 = 12;  V3 = 9;
A = [1 -1 -1 -1;  R(1)+R(2) R(3) 0 0;  0 R(3) 0 -R(6);  0 0 R(4)+R(5) -R(6)];
b = [0; V1; 0; -V3];
I = (A \ b) * 1e3;                 % mA: [I1 I3 I4 I6]
printf("I1 = %.3f mA\nI3 = %.3f mA\nI4 = %.3f mA\nI6 = %.3f mA\n", I);
```

### 3. Corrientes en las puntas de prueba
Registrar las corrientes de PR1 a PR4 con el signo que corresponde a la dirección de la flecha de cada punta.

| Punta de prueba · mA | PR1 | PR2 | PR3 | PR4 |
|---|---|---|---|---|
| Calculado | {{PR1:calc:mA:3}} | {{PR2:calc:mA:3}} | {{PR3:calc:mA:3}} | {{PR4:calc:mA:3}} |
| Simulado (nominal) | {{PR1@nominal:mA:3}} | {{PR2@nominal:mA:3}} | {{PR3@nominal:mA:3}} | {{PR4@nominal:mA:3}} |
| Simulado (valores medidos) | {{PR1@medido:mA:3}} | {{PR2@medido:mA:3}} | {{PR3@medido:mA:3}} | {{PR4@medido:mA:3}} |
| Medido | 8.5 | −4.77 | 9.66 | 4.59 |
| Error % respecto al calculado | {{=err(PR1)}} | {{=err(PR2)}} | {{=err(PR3)}} | {{=err(PR4)}} |
| Error % respecto al simulado (valores medidos) | {{=err(PR1@medido)}} | {{=err(PR2@medido)}} | {{=err(PR3@medido)}} | {{=err(PR4@medido)}} |
: Tabla 2. Registro de corrientes.

### 4. Voltajes en las puntas de prueba
| Punto de medición · V | Nodo 1 | PR5 (nodo 2) | PR6 | XMM1 (VR2) |
|---|---|---|---|---|
| Calculado | {{nodo1:calc:V:3}} | {{PR5:calc:V:3}} | {{PR6:calc:V:3}} | {{VR2:calc:V:3}} |
| Simulado (nominal) | {{nodo1@nominal:V:3}} | {{PR5@nominal:V:3}} | {{PR6@nominal:V:3}} | {{VR2@nominal:V:3}} |
| Simulado (valores medidos) | {{nodo1@medido:V:3}} | {{PR5@medido:V:3}} | {{PR6@medido:V:3}} | {{VR2@medido:V:3}} |
| Medido | 8.71 | 4.37 | 5.89 | −2.93 |
| Error % respecto al calculado | {{=err(nodo1)}} | {{=err(PR5)}} | {{=err(PR6)}} | {{=err(VR2)}} |
| Error % respecto al simulado (valores medidos) | {{=err(nodo1@medido)}} | {{=err(PR5@medido)}} | {{=err(PR6@medido)}} | {{=err(VR2@medido)}} |
: Tabla 3. Registro de voltajes.

### 5. Comprobación de las Leyes de Kirchhoff
| Ley | Ecuación (suma = 0) | Con valores calculados | Con valores medidos |
|---|---|---|---|
| LCK, nodo 2 | $I_1 - I_3 - I_4 - I_6 = 0$ | {{=suma(lck2):mA:2}} | −0.98 mA |
| LVK, malla 1 | $V_1 - (R_1+R_2) I_1 - R_3 I_3 = 0$ | {{=suma(lvk1):V:3}} | 0.705 V |
| LVK, malla 2 | $R_3 I_3 - R_6 I_6 = 0$ | {{=suma(lvk2):V:3}} | 0.050 V |
| LVK, malla 3 | $V_3 + (R_4+R_5) I_4 - R_6 I_6 = 0$ | {{=suma(lvk3):V:3}} | −0.385 V |
: Tabla 4. Comprobación de LCK y LVK.

### 6. Potencias
| Componente | Cálculo de potencia | Potencia (W) | Dona o consume |
|---|---|---|---|
| V1 | $12\,\mathrm{V}\cdot 9.294\,\mathrm{mA}$ | {{P(V1):W:4}} | Dona |
| V3 | $9\,\mathrm{V}\cdot 4.983\,\mathrm{mA}$ | {{P(V3):W:4}} | Dona |
| R1 | $I^2 R$ | {{P(R1):W:4}} | Consume |
| Total | | {{=sum(P):W:4}} | Balance |
: Tabla 5. Registro de potencias (se abrevian R2 a R6; en el documento completo van las seis).

## Anexo 1 · Desarrollo
::: desarrollo n=1 circuito=circ1
- ramas: I1=PR1 (R1, N1→N2); I3=PR4 (R3, N2→GND); I4=PR2 (R4 y R5, N2→T); I6=PR3 (R6, N2→GND)
- lkv L1 "V1 · R1 · R3 · R2":
  $$ V_1 - R_1 I_1 - R_2 I_1 - R_3 I_3 = 0 \;\Rightarrow\; 800\,I_1 + 1000\,I_3 = 12 $$
- lkv L2 "R3 · R6":
  $$ R_3 I_3 - R_6 I_6 = 0 $$
- lkv L3 "R6 · R4 · V3 · R5":
  $$ (R_4+R_5) I_4 - R_6 I_6 = -V_3 $$
- lck B: $$ I_1 - I_3 - I_4 - I_6 = 0 $$
- sistema (Ω·A = V; fila 1 × 1 Ω): matriz=[[1,-1,-1,-1],[800,1000,0,0],[0,1000,0,-470],[0,0,890,-470]] incognitas=[I1,I3,I4,I6] rhs=[0,12,0,-9] resuelve=Solucion
- ohm: R1..R6
- lck nodos: A, B, C
- caracteristicas: todas
:::

## Anexo 2 · Simulación
La simulación de punto de operación (CD) se ejecutó en AULA-C con ngspice; sus resultados aparecen como «Simulado» en las Tablas 2 y 3.

## 7. Preguntas de repaso y reflexión
Responda en su reporte con base en su análisis y sus mediciones.

1. Enuncie la Ley de Corrientes y la Ley de Voltajes de Kirchhoff. ¿Qué principio físico de conservación sustenta a cada una?

::: respuesta :::

2. En su análisis, la corriente de PR2 resultó negativa respecto a la flecha. ¿Significa esto un error en el planteamiento? Explique qué indica el signo y cómo se interpreta en la medición.

::: respuesta :::

## Conclusiones
Registrar sus conclusiones individuales acerca de lo aprendido con las Leyes de Kirchhoff y de la concordancia entre los valores calculados, simulados y medidos.

::: respuesta alto=3in :::
