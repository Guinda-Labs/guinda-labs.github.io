# 1. AULA-C

AGPL-3.0-only. Código fuente en el repositorio AULA-C. Los modelos didácticos B309 declaran CC0-1.0 en su catálogo.

# 2. EEcircuit Engine 1.9.0

MIT, Copyright (c) 2024 EElab.dev. Texto original: [LICENSE](vendor/eecircuit-engine/LICENSE).

# 3. ngspice y componentes incorporados

ngspice incluye código con BSD modificada y otras licencias de sus contribuyentes (SPICE3, CIDER y bibliotecas). El MIT del envoltorio no sustituye esos avisos. Sin XSPICE ni OSDI en EEcircuit.

El módulo distribuido también incorpora modelos PDK: conserva sus cabeceras originales dentro de dist/eecircuit-engine.mjs. La cabecera GF180 declara Copyright 2022 GlobalFoundries PDK Authors y Apache License 2.0. No se usan esos PDK en las prácticas B309; vienen unidos al módulo del proveedor.

# 4. Pendiente de distribución

El paquete npm instalado sólo aporta LICENSE del envoltorio, no el conjunto completo de avisos de ngspice ni los textos separados de los PDK. Falta obtenerlos del proveedor y comprobarlos antes de publicar. No se descargaron archivos ni se afirma que MIT cubra todo el binario.
