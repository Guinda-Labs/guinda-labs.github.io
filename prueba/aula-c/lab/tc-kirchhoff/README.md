# 1. Leyes de Kirchhoff

Objetivo de trabajo: resolver el circuito por corrientes de rama y contrastar LCK, LVK y potencia con simulación y mediciones. No se incluyen respuestas ni conclusiones del alumno.

# 2. Abrir y ejecutar

Desde la raíz: `D:\Tools\nodejs\node.exe aulac.mjs`. Abre la URL local impresa, entra a Cuaderno y selecciona **Teoría de los Circuitos → TC · Leyes de Kirchhoff**. Ejecuta Tabla 1 y Solución; abre la celda de circuito en el laboratorio, pulsa Simular y Llevar a Octave, vuelve y ejecuta Tablas 2 y 3, Tabla 4 y Tabla 5. Si cambias Tabla 1, actualiza también los valores del circuito. La simulación debe reflejar los mismos componentes medidos.

En el laboratorio: Archivo → Ejemplos y prácticas → TC · Leyes de Kirchhoff. La distribución estática `dist/lab-web/` ofrece el mismo circuito mediante MNA. Las sondas ideales no alteran la topología; las flechas indican corriente positiva. VR2 es A respecto a GND. Una lectura negativa conserva el sentido de las puntas.

# 3. Seguridad a bajo voltaje

Sólo fuentes CC de 12 V y 9 V. Desenergiza para medir resistencias o cambiar conexiones; evita cortocircuitos y verifica polaridad. Con valores nominales, las potencias calculadas son:

| Elemento | Potencia aproximada [W] | Límite [W] |
|---|---:|---:|
| R1 | 0.04060 | 0.25 |
| R2 | 0.02850 | 0.25 |
| R3 | 0.02084 | 0.25 |
| R4 | 0.008195 | 0.25 |
| R5 | 0.01391 | 0.25 |
| R6 | 0.04434 | 0.25 |

Todas quedan por debajo de ¼ W; Tabla 5 recalcula el margen con los valores introducidos y avisa si alguna supera 0.25 W. Los medidos son datos proporcionados en el encargo, sin datos personales. Los residuos medidos pueden diferir de cero; se usan los voltajes observados donde existen y R·I para las caídas restantes. El error porcentual es absoluto respecto al calculado, manteniendo los signos en las lecturas.

# 4. Procedencia y validación

Topología y lecturas: encargo R21-KIR del 2026-10-29. Esquema, ecuaciones y material original: CC0-1.0, sin fuentes externas ni modelos de fabricante. Los motores conservan las licencias del repositorio. Regeneración: `D:\Tools\nodejs\node.exe practicas/tc-kirchhoff/generar.mjs`. Pruebas: `D:\Tools\nodejs\node.exe --test lab/tc-kirchhoff.test.mjs`.

La exportación LaTeX convierte las filas de salida delimitadas por `|` en `tabular`. El botón Compilar PDF preexistente corresponde al proyecto B309 Sallen-Key; para esta práctica usa Exportar PDF (LaTeX), que descarga el `.tex`. No se verificó un PDF renderizado.

Validación R21: ngspice nativo, MNA y Octave coinciden en las ocho lecturas dentro de 0.5 %. LCK/LVK calculados: residuos menores de 1.4e-15; potencia total residual menor de 1e-16 W. Las tres pruebas específicas pasan. Suites de cuaderno y laboratorio: 197 pruebas, 193 pasan y cuatro fallan por timeout de 15 s de `ii-buck`, reproducidos en los registros previos R20. Empaquetado estático validado bajo prefijo de URL. Evidencia: `r21-kirchhoff-prueba.log` y `r21-kirchhoff-suites.log` en la raíz; ejecutar ambas suites con `D:\Tools\nodejs\node.exe tools/verificar-tc-kirchhoff.mjs`. Sin verificación visual en navegador.
