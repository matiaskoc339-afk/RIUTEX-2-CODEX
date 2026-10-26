# Distribución limpia de RIUTEX 2

Hay tres entregas diferentes, generadas desde la misma revisión:

- `RIUTEX2_itchio_v<versión>.zip`: contiene únicamente un `index.html` integrado en la raíz. Es el archivo que se sube a itch.io.
- `RIUTEX2_Historia_Completa_v<versión>.html`: ese mismo juego integrado para abrir o servir por separado.
- `RIUTEX2_Historia_Completa_v<versión>.zip`: proyecto fuente para editar, ejecutar pruebas y regenerar las entregas.

El ZIP de itch.io ya estaba reducido a un archivo. Su código integra la biblioteca 3D, estilos, fuentes y las dos imágenes de elección de perspectiva; esos recursos se utilizan durante el juego. El motor genera los modelos, texturas y sonido proceduralmente. RIUTEX 1 sigue siendo parte del código disponible: su retirada no se deduce de que una función no se haya ejecutado durante una prueba.

## Archivos retirados de la distribución

El ZIP fuente deja de repetir el HTML compilado y el ZIP de itch.io dentro de `dist/`. Ambos se entregan por separado y se regeneran con `npm run build`.

También deja fuera capturas, informes de pruebas y registros generados en `artifacts/`, y las quince imágenes de planos completos con spoilers de `planos/`. Esos planos son exportaciones para desarrollo; el mapa jugable se dibuja desde la geometría del motor. `npm run maps` vuelve a generarlos. Las pruebas, sus controladores, los scripts y la documentación de desarrollo permanecen en las fuentes; las carpetas de salida existen al extraer el ZIP.

Los informes de validación siguen en el entorno de desarrollo y su resumen permanece en `docs/RESULTADOS.json`. El empaquetador no los copia como anexos de cada descarga. Las imágenes enlazadas por la documentación sí se conservan porque forman parte de esas explicaciones.

La carátula anterior `assets/blue-hospital.svg` se retira del menú y de los recursos: el fondo Canvas actual pinta un suelo opaco completo con sangre y reflejos por encima. El menú conserva un gradiente como fondo inicial. No se retiran las dos capturas que aparecen en las tarjetas de perspectiva ni las fuentes de la interfaz.

## Comprobación antes de entregar

`python3 scripts/audit_assets.py --out artifacts/assets-audit.json` recorre las referencias declaradas en HTML, CSS y las rutas literales de recursos en JavaScript. Incluye las licencias de las fuentes y de Three.js. Informa de referencias ausentes, peticiones externas, rutas dinámicas que requieren revisión y medios sin referencias; no borra archivos automáticamente ni afirma que una función JavaScript sea código muerto.

`python3 -m unittest discover -s tests -p test_distribution.py` comprueba dependencias y licencias, exclusiones, rutas relativas/dinámicas, reproducibilidad del ZIP y arranque del motor desde el proyecto fuente extraído sin Git.

`python3 scripts/package.py --out /workspace/output` exige que el HTML corresponda a los scripts actuales y que los resultados de validación coincidan con la versión. Verifica que el ZIP de itch.io contenga exactamente el HTML y compara cada entrada del ZIP fuente con sus bytes originales. Rechaza cualquier regla de exclusión que afecte a una dependencia activa.

El ZIP fuente añade `CONTENIDO_DEL_PAQUETE.txt` con los comandos para usarlo y `DISTRIBUCION.json` con las exclusiones y sus motivos. El manifiesto `RELEASE_v<versión>.json`, entregado junto a los archivos, identifica el commit, los tamaños y los hashes SHA-256. Las entradas del ZIP fuente se ordenan y usan una fecha normalizada para producir los mismos bytes con los mismos archivos en el mismo entorno.
