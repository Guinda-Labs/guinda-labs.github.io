# B309 · Electrónica Analógica y de Potencia

## 1. Temario oficial proporcionado por el dueño

Ingeniería Biónica, UPIITA-IPN, nivel 3, plan 09. 3 teoría + 1.5 práctica por semana.

Objetivo: «Diseña circuitos electrónicos de filtros activos, amplificación, acondicionamiento y control de señales útiles en la industria, con base en los principios del diseño electrónico.»

I. «Opto-tiristores y sus aplicaciones.»
II. «Circuitos de potencia.»
III. «Amplificadores con transistores BJT.»
IV. «Amplificadores con transistores MOSFET.»
V. «Aplicaciones de los OP AMPS a filtros activos y amplificadores de instrumentación.»

Bibliografía: Boylestad-Nashelsky, Sedra-Smith, Floyd, Rashid, Hart.
Esta cita reproduce exclusivamente el temario aportado en el encargo, sin consulta externa.

## 2. Índice de propuestas AULA-C

| Unidad | Práctica | Montaje |
|---|---|---|
| I | [Control de fase TRIAC y DIAC](i-fase/README.md) | Solo simulación de red |
| I | [Aislamiento óptico con MOC3021 y 4N25](i-aislamiento/README.md) | Esquema y protoboard manual |
| II | [Rectificación y rizo capacitivo](ii-rectificador/README.md) | Esquema y protoboard manual |
| II | [Convertidor reductor PWM](ii-buck/README.md) | Esquema y protoboard manual |
| III | [Emisor común con divisor y RE desviada](iii-emisor-comun/README.md) | Esquema y protoboard manual |
| IV | [Fuente común con MOSFET](iv-fuente-comun/README.md) | Esquema y protoboard manual |
| V | [Sallen-Key pasabajas de segundo orden](v-sallen-key/README.md) | Esquema y protoboard manual |
| V | [Instrumentación para bioseñal simulada](v-instrumentacion/README.md) | Esquema y protoboard manual |

## 3. Uso y verificación

Iniciar AULA-C con `D:/Tools/nodejs/node.exe aulac.mjs`; en laboratorio elegir «Prácticas · B309».
El paquete B309 se activa junto con la práctica. «Esquemático» y «Protoboard» abren documentos equivalentes.
Media onda: segundo archivo de la práctica II. Para RT, cambiar el valor y repetir transitorio.
Los cuadernos `cuaderno/ejemplos/b309-*.aulac.json` se abren desde el selector del cuaderno o como archivo.
En cada celda de circuito pulsar «Abrir en el laboratorio», simular y «Llevar a Octave»; seleccionar las sondas indicadas.
Después ejecutar la comparación: usa `sim`, no datos inventados. Exportar `.tex` con el botón existente.

`D:/Tools/nodejs/node.exe --test lab/*.test.mjs pruebas/*.test.mjs cuaderno/*.test.mjs`

## 4. Supuestos, límites y decisiones pendientes

Todo salvo la sección 1 es propuesta de AULA-C, pendiente de revisión docente. Modelos originales CC0, simplificados;
no se descargaron modelos de fabricante. Los valores teóricos se derivan en cada README y se contrastan en ngspice.
La validación numérica no certifica patillajes comerciales, pérdidas, aislamiento ni seguridad.
La práctica de red solo se simula; los montajes de baja tensión requieren fuente aislada y limitada.
No conectar protoboard ni equipos de adquisición a personas. Falta revisión física docente y revisión visual en navegador.
