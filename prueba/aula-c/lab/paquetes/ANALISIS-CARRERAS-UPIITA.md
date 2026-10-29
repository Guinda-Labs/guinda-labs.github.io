# Análisis de carreras para AULA-C

## Resumen ejecutivo

AULA-C puede atender una necesidad compartida en las tres carreras: aprender circuitos, electrónica y señales mediante cálculo, simulación, anotaciones y reportes en un mismo proyecto. La mejor primera entrega común es el circuito básico con análisis DC, AC y transitorio, acompañado por Octave y un reporte Folio. Esa base aparece en los primeros niveles de los tres planes: Biónica tiene Teoría de los circuitos (nivel 2), Mecatrónica Circuitos Eléctricos y Fundamentos de Electrónica (nivel 1), y Telemática Diseño Digital (nivel 1) y Teoría de los Circuitos (nivel 2).

La utilidad se amplía en niveles posteriores. Mecatrónica combina control, sensores, microcontroladores, máquinas y electrónica de potencia; Biónica necesita medición biomédica, sensores y procesamiento de bioseñales e imágenes; Telemática avanza a comunicaciones, RF, antenas y procesamiento digital. Octave y el cuaderno sirven transversalmente para datos, modelos y señales. El laboratorio de circuitos cubre directamente circuitos y electrónica de baja frecuencia, pero no sustituye bancos de medición de RF, motores, sensores biomédicos ni herramientas de diseño lógico programable.

Recomendación de orden: (1) esquemático y protoboard con resistores, capacitores, fuentes y diodos; (2) análisis DC/AC/transitorio y multímetro/osciloscopio; (3) Octave con carga de datos, gráficas y FFT; (4) cuaderno enlazado a variables/figuras y exportación de reporte; (5) analógica, lógica digital y modelos de transistores; (6) módulos especializados de control, adquisición y comunicaciones.

Los temarios fuente expresan un campo `nivel` de 1 a 5; se reporta como nivel del plan y no como semestre confirmado. No se identificó una equivalencia oficial de “nivel” a semestre en los insumos usados. Los temarios nombran prácticas y, ocasionalmente, software o equipo, pero la lista propuesta de componentes no se presenta como requisito oficial.

## 1. Alcance y método

Se analizaron los tres archivos de temarios oficiales, el mapa curricular SAES y la seriación local, además de los dos documentos de contexto de AULA-C. No se consultó la red. El mapa ubica carrera, plan, nivel, clave y nombre; el nivel se conserva literalmente como nivel. El registro completo de materias relevantes está en `tabla_materias.csv`.

Para preservar literalidad, cada unidad citada aparece entre comillas y asociada a materia y carrera. La sección de prácticas resume texto de orientación/evaluación cuando el temario lo menciona; cuando no se encontró mención concreta de equipo o práctica se indica expresamente. La seriación ofrece relaciones de requisitos, no cambia el nivel del mapa.

## 2. Hallazgos por carrera

### Ingeniería Biónica

- **Nivel 1 · B107 · Fundamentos de Teoría Electromagnética**. Unidades pertinentes: «Electrostática» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 1 · B110 · Programación Orientada a Objetos**. Unidades pertinentes: «Sentencias de control, arreglos, cadenas, estructuras y apuntadores.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · B201 · Ecuaciones Diferenciales**. Unidades pertinentes: «Resolución de ecuaciones diferenciales mediante series de potencias.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · B205 · Fisicoquímica**. Unidades pertinentes: «Electroquímica» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · B203 · Ondas Electromagnéticas y Sistemas Radiantes**. Unidades pertinentes: «Ondas electromagnéticas» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · B207 · Teoría de los circuitos**. Unidades pertinentes: «Circuitos RC, RL, y RLC serie y paralelo.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · B313 · Bioinstrumentación**. Unidades pertinentes: «Introducción a la bioinstrumentación y técnicas de medición.»; «Instrumentos para la medición de variables bioeléctricas.»; «Instrumentos para la medición de variables biomecánicas.»; «Instrumentos para la medición de variables de capacidad mecánica y vibraciones.»; «Instrumentos para la generación de tensiones, corrientes y/o vibraciones.» Prácticas/equipo: «simulaciones computacionales»
- **Nivel 3 · B311 · Biomagnetismo**. Unidades pertinentes: «Efecto de los campos electromagnéticos en organismos vivos.»; «Aplicaciones de los campos electromagnéticos en la imagenología.»; «Aplicación terapéutica de los campos electromagnéticos.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · B306 · Control Neurodifuso**. Unidades pertinentes: «Control Neurodifuso.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · B302 · Dispositivos Electrónicos**. Unidades pertinentes: «Fundamentos de Amplificadores Operacionales.»; «Fundamentos de Optoelectrónica.»; «Aplicaciones de Circuitos Integrados de uso específico.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · B309 · Electrónica Analógica y de Potencia**. Unidades pertinentes: «Circuitos de potencia.»; «Amplificadores con transistores BJT.»; «Amplificadores con transistores MOSFET.»; «Aplicaciones de los OP AMPS a filtros activos y amplificadores de instrumentación.» Prácticas/equipo: «simulaciones computacionales»
- **Nivel 3 · B303 · Electrónica Digital**. Unidades pertinentes: «Introducción a los sistemas digitales.»; «Circuitos Combinatorios.»; «Circuitos Secuenciales.»; «Máquinas de Estado Finito.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · B312 · Mecanismos Biomiméticos**. Unidades pertinentes: «Transmisión de potencia» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · b307 · Comunicación Oral y Escrita**. Unidades pertinentes: «Comunicación, ciencia y sociedad.»; «Estrategias de comunicación escrita.»; «Comunicación escrita.»; «Estrategias de comunicación oral.»; «Comunicación oral profesional.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · B316 · Control de Sistemas Biológicos**. Unidades pertinentes: «Sistemas de control no lineal»; «Implementación de controladores embebidos» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · B319 · Instrumentación Biomédica**. Unidades pertinentes: «Introducción al proceso de desarrollo de instrumentos biomédicos.»; «Características dinámicas de un instrumento biomédico.» Prácticas/equipo: «simulaciones computacionales»
- **Nivel 3 · B324 · Instrumentación clínica y laboratorio**. Unidades pertinentes: «Instrumentos para la medición de señales bioquímicas.»; «Instrumentos para la manutención de vida.»; «Instrumentos para la educación motora.»; «Instrumentos para la rehabilitación.» Prácticas/equipo: «simulaciones computacionales»
- **Nivel 3 · B317 · Prótesis Biomiméticas**. Unidades pertinentes: «Aplicaciones de la electromiografía en sistemas protésicos.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · B321 · Robótica Evolutiva y Autónoma**. Unidades pertinentes: «Control de Robots Móviles»; «Sistemas Electrónicos Embebidos de Control»; «Sistemas de Control de Aprendizaje Evolutivo» Prácticas/equipo: «kits de robotica»
- **Nivel 3 · B310 · Procesamiento de Imágenes**. Unidades pertinentes: «Fundamentos de Procesamiento Digital de Imágenes.»; «Mejoramiento de Imagen (Preprocesamiento y Filtrado).» Prácticas/equipo: «simulaciones computacionales»
- **Nivel 3 · B314 · Procesamiento de Señales Biológicas**. Unidades pertinentes: «Fundamentos de Procesamiento de las señales Biológicas.»; «Filtros digitales.»; «Análisis de las señales en el dominio del tiempo y frecuencia.» Prácticas/equipo: «prácticas del laboratorio»
- **Nivel 3 · B315 · Sensores y Actuadores**. Unidades pertinentes: «Circuitos de interfaz y acondicionamiento de la señal.»; «Clasificación de los sensores.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · B304 · Teoría del Control**. Unidades pertinentes: «Fundamentos de sistemas de control.»; «Diseño de controladores y compensadores analógicos.»; «Fundamentos del control digital.»; «Diseño de controladores y compensadores digitales.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · B402 · Dispositivos Programables**. Unidades pertinentes: «Estructura y operación de un microcontrolador.»; «Convertidor Analógico-Digital.»; «Protocolos de comunicación.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · B404 · Manufactura de Elementos Biomiméticos**. Unidades pertinentes: «Procesos avanzados de maquinado y Prototipado rápido.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · B401 · Modelado y Control de Sistemas Biónicos**. Unidades pertinentes: «Control robusto en sistemas biónicos»; «Diseño de controloladores robustos»; «Control Robusto en sistmas Biónicos» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · B408 · Biosensores y Biochips**. Unidades pertinentes: «Biosensor»; «Clasificación según elemento sensor»; «Biosensores enzimáticos» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · B409 · Ingeniería del control humano**. Unidades pertinentes: «Introducción a la ingeniería de control humano.»; «Análisis de sistemas de control humano.»; «Diseño de sistemas de control humano.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · B407 · Instrumentación Biotecnológica**. Unidades pertinentes: no aparece en el temario como unidad temática desglosada. Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · B412 · Sistemas Sensoriales**. Unidades pertinentes: «Conceptos de fusión sensorial en la medición de variables en procesos biotecnológicos y biomédicos.» Prácticas/equipo: «simulaciones computacionales»
- **Nivel 4 · B414 · Telemetría Médica**. Unidades pertinentes: «Protocolos de transmisión inalámbrica.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 5 · B502 · Bioelectrónica**. Unidades pertinentes: «Bioelectrónica, origen y tipos de bioseñales.»; «Potenciales evocados.»; «Interfaces electrónicas.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.

### Ingeniería Mecatrónica

- **Nivel 1 · M106 · Circuitos Eléctricos Avanzados**. Unidades pertinentes: «Circuitos de Primer Orden.»; «Potencia en Circuitos Eléctricos de AC.»; «Circuitos acoplados magnéticamente.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 1 · M105 · Circuitos Eléctricos**. Unidades pertinentes: no aparece en el temario como unidad temática desglosada. Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 1 · M111 · Comunicación Oral y Escrita**. Unidades pertinentes: «Comunicación y sociedad.»; «Comunicación escrita.»; «Comunicación oral.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · M108 · Ecuaciones Diferenciales**. Unidades pertinentes: «Resolución de ecuaciones diferenciales mediante series de potencias.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · M109 · Electricidad y Magnetismo**. Unidades pertinentes: «Potencial Eléctrico y Capacitancia.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · M112 · Fundamentos de Electrónica**. Unidades pertinentes: «Amplificadores Operacionales.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · M113 · Herramientas Computacionales**. Unidades pertinentes: «Creación de funciones y archivos a través del editor, sentencias de control, arreglos, cadenas y estructuras.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · M117 · Introducción a la Programación**. Unidades pertinentes: «Estructuras de control y Aplicaciones con Arreglos.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 1 · M120 · Procesos de Manufactura**. Unidades pertinentes: «Operaciones básicas en máquinas herramienta y análisis de maquinado.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M202 · Análisis de Señales y Sistemas**. Unidades pertinentes: «Señales y sistemas lineales invariantes en el tiempo.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M204 · Circuitos Lógicos**. Unidades pertinentes: «Introducción a los sistemas digitales.»; «Diseño y ensamble de circuitos lógicos combinacionales.»; «Diseño y ensamble de circuitos lógicos secuenciales.»; «Diseño y ensamble de máquinas de estado finito.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M205 · Diseño Básico de Elementos de Máquinas**. Unidades pertinentes: «Transmisiones de potencia (Elementos Flexibles).» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · M206 · Dispositivos Lógicos Programables**. Unidades pertinentes: «Circuitos combinacionales y secuenciales.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M207 · Electrónica Analógica**. Unidades pertinentes: «Filtros activos.»; «Amplificadores con transistores.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · M213 · Microprocesadores, Microcontroladores e Interfaz**. Unidades pertinentes: «Representación digital de datos.»; «Memorias e Interfaces entre tecnologías digitales.»; «Análisis y manufactura de un sistema embebido con arquitecturas basadas en microcontrolador.» Prácticas/equipo: «simulaciones por computadora»
- **Nivel 2 · M211 · Máquinas Eléctricas**. Unidades pertinentes: «Criterios de selección y circuitos magnéticos»; «Máquinas de corriente continua.»; «Transformadores y máquinas de inducción.»; «Máquinas sincrónicas.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · M214 · Neumática e Hidráulica**. Unidades pertinentes: «Circuitos neumáticos.»; «Dispositivos y circuitos hidráulicos.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M216 · Probabilidad y Estadística para Ingeniería**. Unidades pertinentes: «Introducción al control de calidad.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M217 · Programación Avanzada**. Unidades pertinentes: «Puertos y comunicaciones.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · M218 · Sensores y Acondicionadores de Señal**. Unidades pertinentes: «Introducción a los sensores.»; «Sensores resistivos.»; «Sensores magnéticos y de reactancia variable.»; «Sensores generadores.»; «Otros sensores.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M219 · Simulación electrónica y diseño de circuitos impresos**. Unidades pertinentes: «Simulación de circuitos en CD y CA.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · M220 · Sistemas Neurodifusos**. Unidades pertinentes: «Controladores Lógicos Difusos.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · M221 · Teoría Electromagnética**. Unidades pertinentes: «Ecuación de onda para el campo electromagnético.»; «Propagación de ondas electromagnéticas.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · M305 · Automatización Industrial**. Unidades pertinentes: «Automatización básica con controladores lógicos programables»; «Automatización avanzada con controladores lógicos programables»; «Servo posicionamiento con controladores lógicos programables» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · M301 · Control Clásico**. Unidades pertinentes: «Conceptos de un sistema de control, Estabilidad y linealización de sistemas dinámicos.»; «Análisis de la respuesta temporal y Control PID.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · M306 · Diseño Avanzado de Elementos de Máquinas**. Unidades pertinentes: «Engranes y tornillos de potencia.»; «Diseño de ejes y sistemas de transmisión.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · M303 · Instrumentación Virtual**. Unidades pertinentes: «Conceptos generales de un instrumento virtual»; «Conceptos básicos para la programación de instrumentos virtuales»; «Instrumentos virtuales para el envío y recepción de datos»; «Comunicación entre instrumentos tradicionales e instrumentos virtuales»; «Instrumentación virtual en sistemas mecatrónicos (Monitoreo y análisis)» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · M311 · Control Distribuido**. Unidades pertinentes: «Conceptos de automatización en sistemas de control industrial.»; «Sistemas de control distribuido.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · M328 · Protocolos Avanzados de Comunicaciones**. Unidades pertinentes: «Protocolos de comunicación estándar: RS–232 y USB.»; «Protocolos de comunicación de uso específico: ISP e I²C.»; «Comandos estándar para instrumentos programables.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · M317 · Tópicos Avanzados de Sensores**. Unidades pertinentes: «Sensores Avanzados de Posición»; «Sensores MEMS»; «Sensores Inteligentes» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · M312 · Tópicos avanzados de electrónica**. Unidades pertinentes: «Aplicaciones de la Microelectrónica»; «Circuitos convertidores CAD y CDA»; «Temas selectos de electrónica.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · M308 · Procesador Digital de Señales**. Unidades pertinentes: «Arquitectura de un procesador digital de señales»; «Programación de un procesador digital de señales»; «Periféricos de un procesador digital de señales»; «Programación de un procesador digital de señales empleando diferentes ambientes.»; «Aplicaciones de un procesador digital de señales» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M401 · Control de sistemas mecatrónicos**. Unidades pertinentes: «Diseño de sistemas de control en espacio de estados»; «Introducción a sistemas de control digital» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · M402 · Electrónica de Potencia**. Unidades pertinentes: «Semiconductores de Potencia» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M419 · Control de Procesos Industriales**. Unidades pertinentes: «Introducción a los controladores industriales.»; «Controladores industriales.»; «Arquitecturas de control de lazos múltiples.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M413 · Control de Sistemas Robóticos**. Unidades pertinentes: «Control de robots.» Prácticas/equipo: «prácticas de laboratorio»; «simulaciones por computadora»
- **Nivel 4 · M420 · Control Inteligente**. Unidades pertinentes: «Introducción al control adaptable.»; «Esquemas difusos de control y estimación.»; «Control difuso adaptable.»; «Controladores supervisados y otros esquemas inteligentes.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M422 · Diseño Ergonómico**. Unidades pertinentes: «Diseño ergonómico de productos, herramiental y maquinaria.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M414 · Implementación de sistemas digitales**. Unidades pertinentes: «Periféricos de entrada/salida digital e interrupciones.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · M415 · Instrumentación Virtual Aplicada**. Unidades pertinentes: «La instrumentación virtual en la industria y la investigación.»; «Tópicos avanzados de monitoreo y análisis con instrumentos virtuales.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M407 · Microcontroladores avanzados**. Unidades pertinentes: «Periféricos de un microcontrolador de 8 bits»; «Interfaces y sistemas mecatrónicos con microcontroladores de 8 bits»; «Introducción a los microcontroladores de 16 y 32 bits.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M412 · Procesos Avanzados de Manufactura**. Unidades pertinentes: «Maquinado abrasivo.»; «Electroerosión y corte por plasma.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M423 · Protocolos de Comunicación Industrial**. Unidades pertinentes: «Introducción a las comunicaciones en entornos industriales.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M426 · Sistemas de Procesamiento Digital de Señales**. Unidades pertinentes: «Aplicaciones en control.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 4 · M417 · Tópicos Avanzados de Automatización**. Unidades pertinentes: «Implementación de la automatización en los dispositivos industriales de control automático.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · M410 · Visión Artificial Aplicada**. Unidades pertinentes: «Control de calidad geométrico» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 4 · M406 · Sistemas de Visión Artificial**. Unidades pertinentes: «Filtrado de imágenes digitales.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 5 · M501 · Control de Máquinas Eléctricas**. Unidades pertinentes: «Control electrónico de motores de corriente continua»; «Control electrónico de motores de corriente alterna»; «Control discreto de motores eléctricos» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.

### Ingeniería Telemática

- **Nivel 1 · T117 · Comunicación Oral y Escrita**. Unidades pertinentes: «Comunicación y sociedad.»; «Comunicación escrita.»; «Comunicación oral.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · T105 · Diseño Digital**. Unidades pertinentes: «Elementos de Diseño Digital»; «Diseño de circuitos combinacionales.»; «Diseño de circuitos secuenciales»; «Diseño de máquinas de estado finito» Prácticas/equipo: «prácticas de laboratorio»; «prácticas de laboratorio con los circuitos funcionando»
- **Nivel 1 · T108 · Ecuaciones Diferenciales**. Unidades pertinentes: «Resolución de ecuaciones diferenciales mediante series de potencias» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 1 · T113 · Electromagnetismo**. Unidades pertinentes: «El campo electrostático y la fuente que lo origina.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 1 · T120 · Programación Estructurada**. Unidades pertinentes: «Estructuras de control y Aplicaciones con Arreglos.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · T207 · Comunicaciones Digitales**. Unidades pertinentes: «Digitalización.»; «Transmisión en banda base.»; «Transmisión pasa-banda (modulación digital).» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · T203 · Electrónica**. Unidades pertinentes: «Optoelectrónica»; «Amplificadores operacionales» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T221 · Electrónica para Comunicaciones**. Unidades pertinentes: «Sistemas electrónicos de modulación y demodulación analógica.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T225 · Inglés IV**. Unidades pertinentes: «Consolidación gramatical relacionada con vocabulario de sistemas de comunicación y redes» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T231 · Normatividad en Telecomunicaciones e Informática**. Unidades pertinentes: «Casos de legislación en telecomunicaciones e informática.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T226 · Redes Inalámbricas**. Unidades pertinentes: «Redes Inalámbricas de Sensores» Prácticas/equipo: «prácticas de laboratorio»; «simulaciones por computadora»
- **Nivel 2 · T208 · Procesamiento Digital de Señales**. Unidades pertinentes: «Señales y Sistemas Discretos.»; «Diseño de Filtro Digitales.»; «Procesamiento de señales de tasa múltiple.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · T214 · Programación Avanzada**. Unidades pertinentes: «Sincronización y comunicación entre procesos» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T202 · Propagación de Ondas Electromagnéticas**. Unidades pertinentes: «Propagación de ondas electromagnéticas en medios libres.»; «Potencia electromagnética y teorema de Poynting.»; «Propagación de ondas electromagnéticas en medios con fronteras.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · T201 · Señales y Sistemas**. Unidades pertinentes: «Señales y sistemas de tiempo continuo.» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T210 · Sistemas Celulares**. Unidades pertinentes: «Transmisión de datos en sistemas celulares.» Prácticas/equipo: «simulaciones por computadora»; «equipo de medición especializado»
- **Nivel 2 · T212 · Sistemas Distribuidos**. Unidades pertinentes: «Interconexión de redes y comunicación entre procesos» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 2 · T209 · Telefonía**. Unidades pertinentes: «Transmisión telefónica y arquitectura de la red telefónica.»; «Conmutación, señalización y sincronización.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · T204 · Teoría de los Circuitos**. Unidades pertinentes: «Circuitos RC, RL, y RLC serie y paralelo.»; «Análisis y diseño de filtros.» Prácticas/equipo: «software de simulación numérica»
- **Nivel 2 · T206 · Teoría de las Comunicaciones**. Unidades pertinentes: «Ruido en Sistemas de Comunicaciones.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 2 · T216 · Transmisión de Datos**. Unidades pertinentes: «Fundamentos de Transmisión de Datos y Acceso al Medio» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · T305 · Bases de Datos Distribuidas**. Unidades pertinentes: «Procesamiento y optimización de consultas distribuidas» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · T302 · Líneas de Transmisión y Antenas**. Unidades pertinentes: «Líneas de transmisión y guías de onda.»; «Fundamentos de radiación y antenas elementales.»; «Parámetros de antenas.»; «Arreglos de antenas.»; «Diseño de enlaces de comunicaciones.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · T310 · Criptografía**. Unidades pertinentes: «Fundamentos matemáticos de firmas digitales» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · T316 · Filtrado Avanzado**. Unidades pertinentes: «Introducción al diseño de los filtros digitales.»; «Técnicas de estimación de la densidad espectral de potencia.»; «Aspectos básicos de los bancos de filtros de reconstrucción perfecta.»; «Procesamiento en arreglos» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · T311 · Microondas**. Unidades pertinentes: «Introducción a los Sistemas de Microondas»; «Electrónica y dispositivos para Microondas»; «Sistemas de Microondas Terrestres»; «Sistemas de Microondas Satelitales.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · T312 · Procesamiento de Imágenes**. Unidades pertinentes: «Fundamentos de procesamiento de imágenes»; «Procesamiento de imágenes en el dominio espacial»; «Procesamiento de señales bidimensionales» Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.
- **Nivel 3 · T315 · Procesamiento de Voz**. Unidades pertinentes: «Introducción al procesamiento de voz.»; «Procesamiento básico de la señal de voz y codificadores de forma de onda.»; «Procesamiento de la señal de voz para aplicaciones en vocoders.» Prácticas/equipo: «prácticas de laboratorio»; «simulaciones por computadora»
- **Nivel 3 · T313 · Televisión Digital**. Unidades pertinentes: «Televisión (TV) analógica.»; «Imágenes en TV Digital.»; «Codificación y compresión en TV Digital.»; «Transmisión de TV Digital.» Prácticas/equipo: «prácticas de laboratorio»
- **Nivel 3 · T301 · Redes Inteligentes**. Unidades pertinentes: «Sistemas de señalización en las redes de telecomunicaciones»; «Señalización de Voz sobre Protocolo de Internet (VoIP)» Prácticas/equipo: «prácticas de laboratorio»; «simulaciones por computadora»
- **Nivel 4 · T405 · Dispositivos Programables**. Unidades pertinentes: «Conceptos generales en los procesadores digitales de señales»; «Aspectos del procesamiento digital de señales» Prácticas/equipo: «prácticas de laboratorio»; «simulaciones por computadora»
- **Nivel 4 · T403 · Redes de Telecomunicaciones**. Unidades pertinentes: no aparece en el temario como unidad temática desglosada. Prácticas/equipo: no aparece mención concreta de práctica/equipo en orientación o evaluación consultadas.

## 3. Matriz materia × herramientas

Escala: 0 = sin apoyo directo; 1 = complementario; 2 = útil; 3 = central. Las puntuaciones son una evaluación de producto basada en contenidos del temario, no una valoración oficial. En cada fila se agrega la cita que fundamenta la puntuación.

| Carrera / materia (nivel) | Laboratorio circuitos | Estudio Octave | Cuaderno multilenguaje | LaTeX/Folio | Justificación textual |
|---|---:|---:|---:|---:|---|
| Ingeniería Biónica / Metrología (N1) | 2 | 2 | 3 | 2 | materia y objetivo del temario |
| Ingeniería Biónica / Programación Orientada a Objetos (N1) | 1 | 2 | 3 | 2 | «Sentencias de control, arreglos, cadenas, estructuras y apuntadores.» |
| Ingeniería Biónica / Ondas Electromagnéticas y Sistemas Radiantes (N2) | 0 | 2 | 2 | 2 | «Ondas electromagnéticas» |
| Ingeniería Biónica / Teoría de los circuitos (N2) | 3 | 1 | 2 | 2 | «Circuitos RC, RL, y RLC serie y paralelo.» |
| Ingeniería Biónica / Bioinstrumentación (N3) | 2 | 2 | 3 | 2 | «Introducción a la bioinstrumentación y técnicas de medición.»; «Instrumentos para la medición de variables bioeléctricas.» |
| Ingeniería Biónica / Control Neurodifuso (N3) | 1 | 2 | 3 | 2 | «Control Neurodifuso.» |
| Ingeniería Biónica / Dispositivos Electrónicos (N3) | 3 | 1 | 2 | 2 | «Fundamentos de Optoelectrónica.»; «Aplicaciones de Circuitos Integrados de uso específico.» |
| Ingeniería Biónica / Electrónica Analógica y de Potencia (N3) | 3 | 2 | 3 | 2 | «Circuitos de potencia.»; «Aplicaciones de los OP AMPS a filtros activos y amplificadores de instrumentación.» |
| Ingeniería Biónica / Electrónica Digital (N3) | 3 | 1 | 2 | 2 | «Introducción a los sistemas digitales.»; «Circuitos Combinatorios.» |
| Ingeniería Biónica / Control de Sistemas Biológicos (N3) | 1 | 2 | 3 | 2 | «Sistemas de control no lineal»; «Implementación de controladores embebidos» |
| Ingeniería Biónica / Instrumentación Biomédica (N3) | 2 | 2 | 3 | 2 | «Introducción al proceso de desarrollo de instrumentos biomédicos.»; «Características dinámicas de un instrumento biomédico.» |
| Ingeniería Biónica / Instrumentación clínica y laboratorio (N3) | 2 | 2 | 3 | 2 | «Instrumentos para la medición de señales bioquímicas.»; «Instrumentos para la manutención de vida.» |
| Ingeniería Biónica / Robótica Evolutiva y Autónoma (N3) | 1 | 2 | 3 | 2 | «Control de Robots Móviles»; «Sistemas Electrónicos Embebidos de Control» |
| Ingeniería Biónica / Procesamiento de Imágenes (N3) | 0 | 3 | 3 | 2 | «Fundamentos de Procesamiento Digital de Imágenes.»; «Mejoramiento de Imagen (Preprocesamiento y Filtrado).» |
| Ingeniería Biónica / Procesamiento de Señales Biológicas (N3) | 0 | 3 | 3 | 2 | «Fundamentos de Procesamiento de las señales Biológicas.»; «Filtros digitales.» |
| Ingeniería Biónica / Sensores y Actuadores (N3) | 3 | 2 | 3 | 2 | «Circuitos de interfaz y acondicionamiento de la señal.»; «Clasificación de los sensores.» |
| Ingeniería Biónica / Teoría del Control (N3) | 1 | 2 | 3 | 2 | «Fundamentos de sistemas de control.»; «Diseño de controladores y compensadores analógicos.» |
| Ingeniería Biónica / Dispositivos Programables (N4) | 1 | 2 | 3 | 2 | «Estructura y operación de un microcontrolador.»; «Convertidor Analógico-Digital.» |
| Ingeniería Biónica / Modelado y Control de Sistemas Biónicos (N4) | 1 | 2 | 3 | 2 | «Control robusto en sistemas biónicos»; «Diseño de controloladores robustos» |
| Ingeniería Biónica / Ingeniería del control humano (N4) | 1 | 2 | 3 | 2 | «Introducción a la ingeniería de control humano.»; «Análisis de sistemas de control humano.» |
| Ingeniería Biónica / Instrumentación Biotecnológica (N4) | 2 | 2 | 3 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Circuitos Eléctricos Avanzados (N1) | 3 | 1 | 2 | 2 | «Circuitos de Primer Orden.»; «Potencia en Circuitos Eléctricos de AC.» |
| Ingeniería Mecatrónica / Circuitos Eléctricos (N1) | 3 | 1 | 2 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Electricidad y Magnetismo (N1) | 3 | 1 | 2 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Fundamentos de Electrónica (N1) | 3 | 1 | 2 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Herramientas Computacionales (N1) | 1 | 2 | 3 | 2 | «Creación de funciones y archivos a través del editor, sentencias de control, arreglos, cadenas y estructuras.» |
| Ingeniería Mecatrónica / Introducción a la Programación (N1) | 1 | 2 | 3 | 2 | «Estructuras de control y Aplicaciones con Arreglos.» |
| Ingeniería Mecatrónica / Análisis de Señales y Sistemas (N2) | 0 | 3 | 3 | 2 | «Señales y sistemas lineales invariantes en el tiempo.» |
| Ingeniería Mecatrónica / Circuitos Lógicos (N2) | 3 | 1 | 2 | 2 | «Introducción a los sistemas digitales.»; «Diseño y ensamble de circuitos lógicos combinacionales.» |
| Ingeniería Mecatrónica / Dispositivos Lógicos Programables (N2) | 3 | 1 | 2 | 2 | «Circuitos combinacionales y secuenciales.» |
| Ingeniería Mecatrónica / Electrónica Analógica (N2) | 3 | 1 | 2 | 2 | «Filtros activos.» |
| Ingeniería Mecatrónica / Mantenimiento y Sistemas de Manufactura (N2) | 1 | 2 | 3 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Microprocesadores, Microcontroladores e Interfaz (N2) | 1 | 2 | 3 | 2 | «Representación digital de datos.»; «Memorias e Interfaces entre tecnologías digitales.» |
| Ingeniería Mecatrónica / Máquinas Eléctricas (N2) | 3 | 1 | 2 | 2 | «Criterios de selección y circuitos magnéticos» |
| Ingeniería Mecatrónica / Neumática e Hidráulica (N2) | 3 | 1 | 2 | 2 | «Circuitos neumáticos.»; «Dispositivos y circuitos hidráulicos.» |
| Ingeniería Mecatrónica / Probabilidad y Estadística para Ingeniería (N2) | 1 | 2 | 3 | 2 | «Introducción al control de calidad.» |
| Ingeniería Mecatrónica / Programación Avanzada (N2) | 0 | 2 | 2 | 2 | «Puertos y comunicaciones.» |
| Ingeniería Mecatrónica / Sensores y Acondicionadores de Señal (N2) | 2 | 2 | 3 | 2 | «Introducción a los sensores.»; «Sensores resistivos.» |
| Ingeniería Mecatrónica / Simulación electrónica y diseño de circuitos impresos (N2) | 3 | 1 | 2 | 2 | «Simulación de circuitos en CD y CA.» |
| Ingeniería Mecatrónica / Sistemas Neurodifusos (N2) | 1 | 2 | 3 | 2 | «Controladores Lógicos Difusos.» |
| Ingeniería Mecatrónica / Teoría Electromagnética (N2) | 0 | 2 | 2 | 2 | «Ecuación de onda para el campo electromagnético.»; «Propagación de ondas electromagnéticas.» |
| Ingeniería Mecatrónica / Automatización Industrial (N3) | 1 | 2 | 3 | 2 | «Automatización básica con controladores lógicos programables»; «Automatización avanzada con controladores lógicos programables» |
| Ingeniería Mecatrónica / Control Clásico (N3) | 1 | 2 | 3 | 2 | «Conceptos de un sistema de control, Estabilidad y linealización de sistemas dinámicos.»; «Análisis de la respuesta temporal y Control PID.» |
| Ingeniería Mecatrónica / Instrumentación Virtual (N3) | 2 | 2 | 3 | 2 | «Conceptos generales de un instrumento virtual»; «Conceptos básicos para la programación de instrumentos virtuales» |
| Ingeniería Mecatrónica / Automatización de Línea de Producción (N3) | 1 | 2 | 3 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Control Distribuido (N3) | 1 | 2 | 3 | 2 | «Conceptos de automatización en sistemas de control industrial.»; «Sistemas de control distribuido.» |
| Ingeniería Mecatrónica / Protocolos Avanzados de Comunicaciones (N3) | 0 | 2 | 2 | 2 | «Protocolos de comunicación estándar: RS–232 y USB.»; «Protocolos de comunicación de uso específico: ISP e I²C.» |
| Ingeniería Mecatrónica / Tópicos Avanzados de Sensores (N3) | 2 | 2 | 3 | 2 | «Sensores Avanzados de Posición»; «Sensores MEMS» |
| Ingeniería Mecatrónica / Tópicos avanzados de electrónica (N3) | 3 | 1 | 2 | 2 | «Aplicaciones de la Microelectrónica»; «Circuitos convertidores CAD y CDA» |
| Ingeniería Mecatrónica / Procesador Digital de Señales (N3) | 0 | 3 | 3 | 2 | «Arquitectura de un procesador digital de señales»; «Programación de un procesador digital de señales» |
| Ingeniería Mecatrónica / Control de sistemas mecatrónicos (N4) | 1 | 2 | 3 | 2 | «Diseño de sistemas de control en espacio de estados»; «Introducción a sistemas de control digital» |
| Ingeniería Mecatrónica / Control de Procesos Industriales (N4) | 1 | 2 | 3 | 2 | «Introducción a los controladores industriales.»; «Controladores industriales.» |
| Ingeniería Mecatrónica / Control de Sistemas Robóticos (N4) | 1 | 2 | 3 | 2 | «Control de robots.» |
| Ingeniería Mecatrónica / Control Inteligente (N4) | 1 | 2 | 3 | 2 | «Introducción al control adaptable.»; «Esquemas difusos de control y estimación.» |
| Ingeniería Mecatrónica / Implementación de sistemas digitales (N4) | 2 | 2 | 3 | 2 | «Periféricos de entrada/salida digital e interrupciones.» |
| Ingeniería Mecatrónica / Instrumentación Virtual Aplicada (N4) | 2 | 3 | 3 | 2 | «La instrumentación virtual en la industria y la investigación.»; «Tópicos avanzados de monitoreo y análisis con instrumentos virtuales.» |
| Ingeniería Mecatrónica / Manufactura Integrada por Computadora (N4) | 1 | 2 | 3 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Microcontroladores avanzados (N4) | 1 | 2 | 3 | 2 | «Periféricos de un microcontrolador de 8 bits»; «Interfaces y sistemas mecatrónicos con microcontroladores de 8 bits» |
| Ingeniería Mecatrónica / Protocolos de Comunicación Industrial (N4) | 0 | 2 | 2 | 2 | «Introducción a las comunicaciones en entornos industriales.» |
| Ingeniería Mecatrónica / Sistemas Avanzados de Manufactura (N4) | 1 | 2 | 3 | 2 | materia y objetivo del temario |
| Ingeniería Mecatrónica / Sistemas de Procesamiento Digital de Señales (N4) | 1 | 3 | 3 | 2 | «Aplicaciones en control.» |
| Ingeniería Mecatrónica / Tópicos Avanzados de Automatización (N4) | 1 | 2 | 3 | 2 | «Implementación de la automatización en los dispositivos industriales de control automático.» |
| Ingeniería Mecatrónica / Visión Artificial Aplicada (N4) | 1 | 2 | 3 | 2 | «Control de calidad geométrico» |
| Ingeniería Mecatrónica / Control de Máquinas Eléctricas (N5) | 1 | 2 | 3 | 2 | «Control electrónico de motores de corriente continua»; «Control electrónico de motores de corriente alterna» |
| Ingeniería Telemática / Diseño Digital (N1) | 3 | 1 | 2 | 2 | «Elementos de Diseño Digital»; «Diseño de circuitos combinacionales.» |
| Ingeniería Telemática / Programación Estructurada (N1) | 1 | 2 | 3 | 2 | «Estructuras de control y Aplicaciones con Arreglos.» |
| Ingeniería Telemática / Comunicaciones Digitales (N2) | 0 | 2 | 2 | 2 | «Digitalización.»; «Transmisión pasa-banda (modulación digital).» |
| Ingeniería Telemática / Electrónica para Comunicaciones (N2) | 3 | 2 | 3 | 2 | «Sistemas electrónicos de modulación y demodulación analógica.» |
| Ingeniería Telemática / Óptica (N2) | 0 | 2 | 2 | 2 | materia y objetivo del temario |
| Ingeniería Telemática / Normatividad en Telecomunicaciones e Informática (N2) | 0 | 2 | 2 | 2 | «Casos de legislación en telecomunicaciones e informática.» |
| Ingeniería Telemática / Redes Inalámbricas (N2) | 0 | 2 | 2 | 2 | «Redes Inalámbricas de Sensores» |
| Ingeniería Telemática / Procesamiento Digital de Señales (N2) | 0 | 3 | 3 | 2 | «Señales y Sistemas Discretos.»; «Diseño de Filtro Digitales.» |
| Ingeniería Telemática / Propagación de Ondas Electromagnéticas (N2) | 0 | 2 | 2 | 2 | «Propagación de ondas electromagnéticas en medios libres.»; «Potencia electromagnética y teorema de Poynting.» |
| Ingeniería Telemática / Señales y Sistemas (N2) | 0 | 3 | 3 | 2 | «Señales y sistemas de tiempo continuo.» |
| Ingeniería Telemática / Sistemas Celulares (N2) | 0 | 2 | 2 | 2 | materia y objetivo del temario |
| Ingeniería Telemática / Telefonía (N2) | 0 | 2 | 2 | 2 | «Conmutación, señalización y sincronización.» |
| Ingeniería Telemática / Teoría de los Circuitos (N2) | 3 | 1 | 2 | 2 | «Circuitos RC, RL, y RLC serie y paralelo.»; «Análisis y diseño de filtros.» |
| Ingeniería Telemática / Teoría de las Comunicaciones (N2) | 0 | 2 | 2 | 2 | «Ruido en Sistemas de Comunicaciones.» |
| Ingeniería Telemática / Transmisión de Datos (N2) | 0 | 2 | 2 | 2 | materia y objetivo del temario |
| Ingeniería Telemática / Líneas de Transmisión y Antenas (N3) | 0 | 2 | 2 | 2 | «Fundamentos de radiación y antenas elementales.»; «Parámetros de antenas.» |
| Ingeniería Telemática / Filtrado Avanzado (N3) | 0 | 3 | 3 | 2 | «Introducción al diseño de los filtros digitales.»; «Aspectos básicos de los bancos de filtros de reconstrucción perfecta.» |
| Ingeniería Telemática / Microondas (N3) | 0 | 2 | 2 | 2 | «Electrónica y dispositivos para Microondas» |
| Ingeniería Telemática / Procesamiento de Imágenes (N3) | 0 | 3 | 3 | 2 | «Fundamentos de procesamiento de imágenes»; «Procesamiento de imágenes en el dominio espacial» |
| Ingeniería Telemática / Procesamiento de Voz (N3) | 0 | 3 | 3 | 2 | «Introducción al procesamiento de voz.»; «Procesamiento básico de la señal de voz y codificadores de forma de onda.» |
| Ingeniería Telemática / Redes Inteligentes (N3) | 0 | 2 | 2 | 2 | «Sistemas de señalización en las redes de telecomunicaciones»; «Señalización de Voz sobre Protocolo de Internet (VoIP)» |
| Ingeniería Telemática / Dispositivos Programables (N4) | 0 | 3 | 3 | 2 | «Conceptos generales en los procesadores digitales de señales»; «Aspectos del procesamiento digital de señales» |
| Ingeniería Telemática / Redes de Telecomunicaciones (N4) | 0 | 2 | 2 | 2 | materia y objetivo del temario |

## 4. Tronco común y orden de construcción

**Compartido por contenido, no necesariamente por equivalencia formal:** los tres planes contienen circuitos/campos eléctricos y electrónicos; los tres alcanzan señales, control o instrumentación en diferentes puntos y con distinto énfasis. Teoría de los circuitos de Biónica (B207) y Teoría de los Circuitos de Telemática (T204) son equivalentes por nombre y contenidos de leyes de Kirchhoff y redes RC/RL/RLC; no se encontró en el plan de Mecatrónica una materia con ese mismo nombre exacto, aunque Circuitos Eléctricos (M105) y Circuitos Eléctricos Avanzados (M106) comparten dominio. Biónica B303 Electrónica Digital y Telemática T105 Diseño Digital comparten circuitos combinatorios/secuenciales; Mecatrónica M204 Circuitos Lógicos es el vecino temático. La seriación debe consultarse por clave antes de diseñar rutas académicas; la aplicación no debe inferir equivalencias administrativas.

Orden recomendado: 1) proyecto único de circuito y componentes básicos; 2) vista esquemática y protoboard derivada; 3) análisis DC, AC y transitorio, instrumentos virtuales; 4) exportar resultados y mediciones a Octave; 5) cuaderno para cálculos, gráficas y datos; 6) documentación LaTeX/Folio; 7) expansión analógica/digital con lógica, op-amps y transistores; 8) extensiones especializadas por carrera. Fourier resulta de alto valor para señales, filtros y comunicaciones, pero debe ser análisis de datos/señales en Octave, no prometer una solución universal de Fourier dentro del simulador de circuitos.

## 5. Paquete UPIITA v0 (propuesta para revisión académica)

La propuesta siguiente traduce las familias de contenido a un kit pedagógico genérico. Los valores, encapsulados y modelos SPICE son decisiones de diseño sugeridas, no aparecen en el temario salvo la familia del dispositivo. Los modelos indicados son clases/modelos típicos de SPICE y requerirían seleccionar y revisar archivos concretos y sus licencias antes de distribuirlos. Un componente se atribuye a las materias listadas.

| Grupo / propuesta | Encapsulado sugerido | Modelo SPICE requerido | Temarios que motivan la familia |
|---|---|---|---|
| Resistores E12: 100 Ω, 1 kΩ, 10 kΩ, 100 kΩ; potenciómetro 10 kΩ | axial THT; potenciómetro radial | R ideal; potenciómetro como dos resistencias acopladas | B207 Teoría de los circuitos; M105 Circuitos Eléctricos; T204 Teoría de los Circuitos |
| Capacitores E12: 10 nF, 100 nF, 1 µF, 10 µF; inductores 10 mH, 100 mH | radial THT | C/L ideales con ESR opcional | B207; M106 Circuitos Eléctricos Avanzados; T204 |
| Diodo señal 1N4148; rectificador 1N4007; LED rojo/verde | DO-35 axial; DO-41 axial; THT radial | D genérico / modelo fabricante | B302 Dispositivos Electrónicos; M207 Electrónica Analógica; T203 Electrónica |
| Zener 5.1 V | DO-35 o DO-41 axial | D con BV/IBV | B302; M207; T203 |
| BJT 2N3904 NPN y 2N3906 PNP | TO-92 | Q modelo Gummel-Poon; NPN/PNP genérico | B309 Electrónica Analógica y de Potencia; M207; T203 |
| MOSFET canal N BS170 / IRLZ44N | TO-92 / TO-220 | M modelo MOS level 1 o subcircuito fabricante | B309; M207; M402 Electrónica de Potencia |
| Op-amp LM358; TL072 | DIP-8 | subcircuito fabricante; opamp ideal para ejercicios | B302; B309; M112 Fundamentos de Electrónica; M207; T203 |
| Regulador 7805 / LM317 | TO-220 | subcircuito fabricante o regulador macromodelo | B309; M402; T203 si temario de electrónica incluye regulación |
| Temporizador NE555 | DIP-8 | subcircuito fabricante; modelo funcional simplificado | B303 Electrónica Digital; M204 Circuitos Lógicos; T105 Diseño Digital solo si la academia lo asocia a temporización |
| Compuertas 74HC00, 74HC04, 74HC08; CD4011 | DIP-14; DIP-16 | modelo lógico digital / subcircuito con alimentación y retardos | B303; M204; T105 |
| Sensor NTC 10 kΩ; LDR; potenciómetro como entrada; fotodiodo | radial; THT | R(T) / R(luz) behavioral; fotodiodo D | B315 Sensores y Actuadores; M218 Sensores y Acondicionadores de Señal; T226 Redes Inalámbricas de Sensores |
| Termopar / puente resistivo simulado; electrodo ideal bioeléctrico como fuente de señal | conector de laboratorio; fuente de señal | fuente behavioral con impedancia y ruido | B313 Bioinstrumentación; B319 Instrumentación Biomédica; B314 Procesamiento de Señales Biológicas |
| Microcontrolador | placa, no DIP asumido | no SPICE transistor-level; co-simulación/ modelo comportamental separado | B402 Dispositivos Programables; M213 Microprocesadores, Microcontroladores e Interfaz; T405 Dispositivos Programables |
| Instrumentos sugeridos: fuente DC, generador, multímetro, osciloscopio | equipo de banco real o instrumento virtual | instrumentos postproceso/medición sobre vectores de ngspice; no componente | prácticas de laboratorio en B207, M105/M106, T105/T204; T210 menciona equipo de medición especializado |

No se afirma que las academias utilicen esos números o encapsulados. En Biónica la temática de sensores y bioinstrumentación habilita prototipos de interfaz y acondicionamiento, pero el temario no enumera sensores comerciales ni microcontrolador específico. Para Mecatrónica, motores y cargas requieren un módulo de potencia y simulación/conexión fuera del circuito introductorio seguro.

## 6. Brechas y alcance recomendado

| Carrera | Necesidad que excede el núcleo de AULA-C | Alcance aconsejado |
|---|---|---|
| Biónica | Bioseñales de baja amplitud, bioinstrumentación, sensores biomédicos, imágenes y actuadores biomiméticos | Priorizar fuente de señales, ruido, filtros, amplificador de instrumentación y análisis temporal/espectral en Octave; presentar sensores como modelos abstractos. No afirmar diagnóstico médico ni simular seguridad clínica. |
| Mecatrónica | Motores, potencia, automatización, sensores industriales, buses/protocolos y control conectado a plantas físicas | Agregar después modelos de carga, PWM y actuadores en baja tensión; usar co-simulación/series temporales para control. Dejar lazos industriales, neumática y maquinaria real fuera del laboratorio v0. |
| Telemática | RF, antenas, líneas de transmisión, microondas y modulaciones/comunicaciones | Octave para modulación, ruido, filtros y FFT; después ejercicios de línea y redes equivalentes. La protoboard y ngspice de baja frecuencia no cubren RF, antenas o microondas; integrar herramientas específicas solo con necesidad curricular demostrada. |

## 7. Limitaciones y decisiones pendientes

- En el dataset, `nivel` va de 1 a 5. Se conserva ese campo; el semestre debe confirmarse con el mapa oficial vigente antes de mostrar equivalencias de calendario.
- Las citas literales se reproducen como se encuentran en los JSON, por lo que se conservan diferencias de mayúsculas y acentuación de fuente.
- Los contenidos no incluyen siempre prácticas, equipo, bibliografía o subtemas completos. Cuando no se encontró mención se dice explícitamente; ausencia en los campos leídos no prueba que el curso real no use ese equipo.
- Las herramientas AULA-C y recomendaciones de producto se valoran frente al contexto arquitectónico compartido; no implican que esas funciones ya estén implementadas.
- Las materias optativas/especializantes se incluyen cuando el nombre o contenido coincide con las áreas solicitadas; la oferta concreta puede depender del plan/academia.

## Preguntas, aclaraciones y decisiones pendientes

1. Confirmar si en la siguiente revisión se quiere mapear `nivel` a semestre usando documentación académica adicional; no se inventó esa conversión.
2. Solicitar a las academias la lista de equipos y prácticas vigentes para ajustar el kit y validar encapsulados/modelos.
3. Confirmar prioridades de la primera versión especializada: bioinstrumentación, control de motores o señales/comunicaciones.
