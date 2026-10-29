# Origen y licencias de arte y modelos

## 1. Arte y declaración de origen

Arte SVG paramétrico original de AULA-C, sin gráficos, texturas ni recursos de Tinkercad. Las adiciones de LAB9/LAB9B y los modelos educativos propios de esta tabla se ofrecen bajo CC0-1.0 (dedicación al dominio público, https://creativecommons.org/publicdomain/zero/1.0/). Los nombres comerciales identifican las piezas; no atribuyen aprobación de fabricantes ni certificación de patillaje. Esta declaración abarca estos recursos, no las licencias del resto de la aplicación.

No se copiaron netlists de hojas de datos ni bibliotecas de terceros. No se consultó red: los parámetros son valores típicos conocidos y selecciones educativas, no una extracción de una ficha concreta. Por tanto no se atribuye a un fabricante la precisión de estos modelos. Referencia conceptual del formato: manual de ngspice, https://ngspice.sourceforge.io/docs/ngspice-manual.pdf (no descargado en este encargo). La licencia de ngspice es independiente de la de estos modelos.

## 2. Inventario de cada modelo

El texto ejecutable se encuentra en `../paquetes/upiita-v0.json` (38 componentes) y en `../componentes.json` (biblioteca previa). Cada componente del paquete declara `source`, `license` y límites en `notes`. Los modelos compartidos LM358, NE555 y 1N4007 tienen el mismo origen propio en ambos archivos.

| Identificador / pieza | Encapsulado | Fuente del modelo | Licencia | Alcance |
|---|---|---|---|---|
| `R100` (Resistencia 100 Ω) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `R220` (Resistencia 220 Ω) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `R470` (Resistencia 470 Ω) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `R1K` (Resistencia 1 kΩ) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `R4K7` (Resistencia 4.7 kΩ) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `R10K` (Resistencia 10 kΩ) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `R100K` (Resistencia 100 kΩ) | axial | AULA-C, macromodelo propio | CC0-1.0 | Resistencia ideal propia CC0-1.0. |
| `POT10K` (Potenciómetro 10 kΩ) | pot-3 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado educativo propio CC0-1.0. |
| `C10N` (Capacitor 10 nF) | radial | AULA-C, macromodelo propio | CC0-1.0 | Capacitor ideal propio CC0-1.0; sin ESR ni ruptura. |
| `C100N` (Capacitor 100 nF) | radial | AULA-C, macromodelo propio | CC0-1.0 | Capacitor ideal propio CC0-1.0; sin ESR ni ruptura. |
| `C1U` (Capacitor 1 µF) | radial | AULA-C, macromodelo propio | CC0-1.0 | Capacitor ideal propio CC0-1.0; sin ESR ni ruptura. |
| `C10U` (Capacitor 10 µF electrolítico) | radial | AULA-C, macromodelo propio | CC0-1.0 | Capacitor ideal propio CC0-1.0; sin ESR ni ruptura. |
| `L10M` (Inductor 10 mH) | axial | AULA-C, macromodelo propio | CC0-1.0 | Inductor ideal propio CC0-1.0. |
| `L100M` (Inductor 100 mH) | axial | AULA-C, macromodelo propio | CC0-1.0 | Inductor ideal propio CC0-1.0. |
| `D1N4148` (1N4148) | axial | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Parámetros públicos típicos, selección educativa propia CC0-1.0; sin ajuste a fabricante. |
| `D1N4007` (1N4007) | axial | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Parámetros públicos típicos, selección educativa propia CC0-1.0; sin ajuste a fabricante. |
| `Z5V1` (Zener 5.1 V) | axial | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Parámetros públicos típicos, selección educativa propia CC0-1.0; sin ajuste a fabricante. |
| `LED_ROJO` (LED rojo) | LED-5mm | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Parámetros públicos típicos, selección educativa propia CC0-1.0; sin ajuste a fabricante. |
| `LED_VERDE` (LED verde) | LED-5mm | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Parámetros públicos típicos, selección educativa propia CC0-1.0; sin ajuste a fabricante. |
| `N2N3904` (2N3904) | TO-92 | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Gummel-Poon genérico, selección propia CC0-1.0. E-B-C físico, C-B-E SPICE; verificar fabricante. |
| `P2N3906` (2N3906) | TO-92 | AULA-C, selección propia de parámetros típicos para ecuaciones SPICE estándar | CC0-1.0 | Gummel-Poon genérico, selección propia CC0-1.0. E-B-C físico, C-B-E SPICE; verificar fabricante. |
| `BS170` (BS170 · modelo simplificado) | TO-92 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado MOS nivel 1 propio CC0-1.0; cuerpo unido a S, sin avalancha. |
| `LM358` (LM358 · modelo simplificado) | DIP-8-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio: dos amplificadores sin dinámica ni corriente de alimentación realista. |
| `NE555` (NE555 · modelo simplificado) | DIP-8-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado: comparador sin latch, no apto para verificar temporizadores ni astables. |
| `TL072` (TL072 · modelo simplificado) | DIP-8-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0, dos opamps de ganancia 100k sin ancho de banda, slew rate ni corriente de alimentación. |
| `TL082` (TL082 · modelo simplificado) | DIP-8-300 | AULA-C, macromodelo propio con valores típicos de hoja de datos | CC0-1.0 | Dos amplificadores. Entrada JFET de 1 TΩ, ganancia 200 V/mV, un polo con GBW 3 MHz y slew rate 13 V/µs (parámetros `GBW`, `SR`, `AOL` editables), salida hasta 1.5 V de cada riel con 75 Ω, consumo aproximado de 1.4 mA por amplificador a ±15 V. Sin offset, ruido, límite de corriente de salida, rango de modo común ni inversión de fase; la corriente de salida no se toma de los rieles. |
| `TL084` (TL084 · modelo simplificado) | DIP-14-300 | AULA-C, macromodelo propio con valores típicos de hoja de datos | CC0-1.0 | Cuatro amplificadores; VCC en 4 y VEE en 11. Entrada JFET de 1 TΩ, ganancia 200 V/mV, un polo con GBW 3 MHz y slew rate 13 V/µs (parámetros `GBW`, `SR`, `AOL` editables), salida hasta 1.5 V de cada riel con 75 Ω, consumo aproximado de 1.4 mA por amplificador a ±15 V. Sin offset, ruido, límite de corriente de salida, rango de modo común ni inversión de fase; la corriente de salida no se toma de los rieles. |
| `REG7805` (7805 · modelo simplificado) | TO-220 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; 5 V, caída 2 V, Rout 0.1 Ω. Sin límite de corriente ni térmico. |
| `LM317` (LM317 · modelo simplificado) | TO-220 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; referencia 1.25 V sobre ADJ, caída 2 V, Rout 0.1 Ω. Requiere divisor externo; sin protección. |
| `HC74_00` (74HC00 · modelo simplificado) | DIP-14-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0: B-sources analógicas, umbral VCC/2, salida 50 Ω, sin retardos, histéresis ni niveles de familia. No requiere XSPICE. |
| `HC74_04` (74HC04 · modelo simplificado) | DIP-14-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0: B-sources analógicas, umbral VCC/2, salida 50 Ω, sin retardos, histéresis ni niveles de familia. No requiere XSPICE. |
| `HC74_08` (74HC08 · modelo simplificado) | DIP-14-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0: B-sources analógicas, umbral VCC/2, salida 50 Ω, sin retardos, histéresis ni niveles de familia. No requiere XSPICE. |
| `CD4011` (CD4011 · modelo simplificado) | DIP-14-300 | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0: B-sources analógicas, umbral VCC/2, salida 50 Ω, sin retardos, histéresis ni niveles de familia. No requiere XSPICE. |
| `NTC10K` (NTC 10 kΩ) | radial | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; ecuación beta, temperatura fija editable, sin autocalentamiento. |
| `LDR` (LDR) | radial | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; ley de potencia R10(10/lux)^gamma, sin dinámica ni espectro. |
| `PILA9V` (Pila 9 V) | battery | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; fuente DC con resistencia interna, sin descarga. |
| `FUENTE_BANCO` (Fuente de banco) | bench | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; fuente DC, sin regulación CC ni protección. |
| `GENERADOR` (Generador) | generator | AULA-C, macromodelo propio | CC0-1.0 | Modelo simplificado propio CC0-1.0; seno con impedancia 50 Ω, amplitud pico en vacío. |
| `N2N2222` (2N2222) | TO-92 | AULA-C, modelo educativo propio previo LAB9 | CC0-1.0 | Aproximación educativa propia. Pinout E-B-C elegido; verificar fabricante antes de montar hardware. |
| `POT` (Potenciómetro) | pot-3 | AULA-C, modelo educativo propio previo LAB9 | CC0-1.0 | Modelo resistivo educativo propio CC0-1.0. |
| `BUTTON` (Botón táctil) | button-4 | AULA-C, modelo educativo propio previo LAB9 | CC0-1.0 | Modelo resistivo educativo propio CC0-1.0. |
| `SWITCH` (Interruptor) | switch-3 | AULA-C, modelo educativo propio previo LAB9 | CC0-1.0 | Modelo resistivo educativo propio CC0-1.0. |

## 3. Ecuaciones y parámetros públicos

Diodos: ecuación SPICE de unión, I = Is·(exp(Vj/(n·VT)) − 1), resistencia serie RS y ruptura BV/IBV. 1N4148 usa Is=2.52 nA, n=1.752, RS=0.568 Ω, BV=100 V, CJO=4 pF y TT=20 ns; 1N4007 usa Is=5 nA, n=1.8, RS=0.05 Ω, BV=1000 V. Son aproximaciones y no garantizan curvas ni recuperación de una pieza comercial. El Zener usa BV=5.1 V, IBV=1 mA y RS=2 Ω. LED rojo/verde usan Is=1e-17/1e-20 A, n=2 y RS=10 Ω para umbrales educativos distintos; no modelan emisión espectral ni destrucción.

BJT: Gummel-Poon estándar, Is=1e-14 A, BF=200/150 para NPN/PNP, VAF=100 V, CJE=8 pF, CJC=4 pF y TF=0.4 ns. Son parámetros genéricos seleccionados, no modelos garantizados de 2N3904/2N3906. El 2N2222 previo usa Is=1e-14 A, BF=100, VAF=100 V. La selección física E-B-C y la instancia SPICE C-B-E se mantienen explícitas. BS170 usa MOS nivel 1: VTO=2 V, KP=0.02 A/V² y LAMBDA=0.02 V⁻¹, cuerpo unido a S; sin ajuste del dispositivo real.

NTC: integrar d(ln R)/d(1/T)=beta entre 298.15 K y T da ln(R/R25)=beta·(1/T−1/298.15), por lo que R=R25·exp(beta·(1/T−1/298.15)). CELSIUS se convierte con T=CELSIUS+273.15, R25=10 kΩ y beta=3950 K. LDR: se asume R proporcional a lux^(-gamma); normalizar a 10 lux da R=R10·(10/lux)^gamma, con R10=10 kΩ y gamma=0.7. Se limita lux a 0.01 para evitar división por cero. No hay ajuste a sensor comercial.

## 4. Lógica y circuitos integrados simplificados

74HC00 y CD4011 contienen cuatro NAND; 74HC08 cuatro AND; 74HC04 seis inversores. Se conservan los distintos patillajes DIP-14 de CD4011 y 74HC. Cada salida usa una B-source, umbral VCC/2, niveles GND/VCC y resistencia de salida de 50 Ω. Se usa esta alternativa analógica de ngspice 47 para no requerir módulos XSPICE ni puentes analógico/digital; no se afirma que XSPICE esté ausente. Se comprueban todas las combinaciones de cada compuerta con alimentación de 5 V. No reproduce retardos, estados X/Z, consumo dinámico, fan-out real, histéresis ni comportamiento de entradas flotantes. AC linealiza un estado lógico y no predice temporización digital.

LM358/TL072 son opamps dobles limitados por alimentación, sin dinámica. NE555 es un comparador sin memoria, **no sirve para verificar temporizadores ni osciladores astables**. 7805/LM317 son referencias limitadas por entrada, con caída de 2 V y salida resistiva de 0.1 Ω; no incluyen protecciones ni estabilidad del lazo. Están identificados como «modelo simplificado». El paquete es una **propuesta v0, pendiente de revisión de academias**.

## 5. Validación y decisiones pendientes

Las pruebas de LAB9B verifican cada recurso SVG, contactos, compilación, OP/AC/transitorio con carga y validación mínima por HTTP cuando ngspice está disponible. Pasar una prueba mínima confirma sintaxis y solución numérica de ese circuito, no fidelidad comercial. La validación mínima usa resistencias de 1 MΩ hacia referencia en cada pin; cortocircuitar todas las salidas con fuentes de 0 V produciría lazos ideales singulares. Las academias deben revisar parámetros, modelos, referencias, patillajes, prácticas y sustituciones antes de aprobar el paquete. No hubo inspección visual en navegador.

## 6. Propuesta B309, modelos originales CC0-1.0

`../paquetes/b309-analogica-potencia.json` reutiliza los componentes analógicos de UPIITA v0 y añade los siguientes modelos originales AULA-C. No se copiaron bibliotecas de fabricantes ni se consultó la red. Los nombres comerciales describen referencias de estudio; ningún parámetro se presenta como curva garantizada. Los encapsulados reutilizan el arte original de este inventario. Los modelos, textos de propuesta y generador de prácticas B309 se ofrecen bajo CC0-1.0; el temario oficial citado conserva su atribución al programa proporcionado por el dueño.

| ID | Encapsulado / terminales | Modelo y límites |
|---|---|---|
| SCR | TO-92, K G A | Par PNP/NPN regenerativo, BF=12/15, resistencias de polarización. Sin térmica, dv/dt ni mantenimiento garantizado de 2N5060. |
| TRIAC | TO-220, MT1 MT2 G | Referencia BT136; conductancia bilateral RON=0.2 Ω, memoria RC de 5 µs, mantenimiento 10 mA y umbrales suavizados con tanh. Sin cuadrantes ni recuperación. |
| DIAC | axial, A K | Referencia DB3; ruptura bilateral 32 V, pendiente 10 Ω. Sin snapback ni histéresis. |
| MOC3021 | DIP-6, A K NC3 MT1 NC5 MT2 | LED Shockley y salida bilateral controlada a 5 mA, RON=20 Ω. Sin retención, dinámica ni aislamiento certificado. |
| OPTO4N25 | DIP-6, A K NC E C B | LED y fuente de fotocorriente, CTR=0.5; sin saturación ni dinámica, requiere VCE positivo. |
| IRF540 | TO-220, G D S | MOS nivel 1, KP=2 A/V², VTO=3 V, λ=.001, resistencias y diodo de cuerpo. Sin capacitancias, avalancha ni pérdidas térmicas. |
| D1N5819 | axial, A K | Shockley, IS=10 µA, N=1.05, RS=.02 Ω, BV=40 V; sin capacitancias ni recuperación. |
| PUENTE | módulo didáctico DIP-4, AC1 AC2 POS NEG | Cuatro diodos genéricos, resistencias de devanado .1 Ω y referencia de fuga 1 GΩ para convergencia. No representa el patillaje de un puente comercial. |
| TRANSFORMADOR | módulo didáctico DIP-4, P1 P2 S1 S2 | Inductores acoplados k=.999; N=Nprim/Nsec, Lsec=Lprim/N². Sin saturación ni aislamiento certificado. |
| CARGA_RL | axial, A K | R y L serie editables; representación de carga, sin encapsulado comercial específico. |
| RED127 | generador, L N | Seno 179.605122 V pico, 60 Hz. Exclusivamente simulación; nunca en protoboard. |
| INA3 | módulo didáctico DIP-8, INP INM VP VN OUT REF NC7 NC8 | Tres fuentes controladas Aol=100k; dos etapas no inversoras y restador resistivo con error .1%. Sin saturación ni dinámica. VP/VN son terminales de documentación, no limitan la salida; operar dentro de ±10 V. |
| AD620 | DIP-8, RG −IN +IN −VS REF OUTPUT +VS RG | Modelo conductual original AULA-C CC0-1.0; no es modelo del fabricante. Dos resistores internos de 24.7 kΩ y R_G externa 1-8; tres op-amps; dinámica, CMRR, consumo y saturación aproximados. Hoja AD620 Rev. H, tabla DYNAMIC RESPONSE, cifras típicas sin verificar contra el PDF. |
| INA128 | DIP-8, RG V−IN V+IN V− Ref VO V+ RG | Modelo conductual original AULA-C CC0-1.0; no es modelo del fabricante. Dos resistores internos de 25 kΩ y R_G externa 1-8. Hoja INA128/INA129 SBOS051G, §6.5 p.8 FREQUENCY RESPONSE, verificada en PDF local; 20 kHz a G=1000 para CSO SHE. Mismos límites educativos que AD620. |

LM358 y TL072 conservan los modelos y límites de UPIITA v0; TL082 y TL084 comparten el mismo macromodelo dinámico en ambos paquetes. Todos los subcircuitos B309 se comprueban en ngspice 47 mediante `lab/b309.test.mjs`; las prácticas contrastan predicciones manuales con sus esquemas compilados. Para los circuitos con modelos se usa Gear de orden 2 y parásitos numéricos de 1 TΩ/1 pF hacia referencia; son ayudas de convergencia explícitas, no parámetros de fabricante. Se rechazan los análisis abortados aunque ngspice devuelva código 0.
