Backend - Instalación y Ejecución
Este proyecto corresponde al backend de la aplicación, desarrollado en Node.js 20 utilizando Express.
Requisitos
•	Es obligatorio contar con:
•	Node.js v20.x
•	npm (incluido con Node.js)
Verificar la versión instalada:
node -v
npm -v
La salida debe mostrar una versión v20.x.x. En caso contrario, instalar la versión LTS correspondiente desde https://nodejs.org.
Instalación del Proyecto
1. Clonar el repositorio:
git clone [<url-del-repositorio>](https://github.com/LincolnHdz/Back_MovilidadAcademica)
cd Back_MovilidadAcademica
2. Instalar dependencias:
npm install
Este comando instalará todas las dependencias definidas en el archivo package.json.
Configuración
Crear un archivo .env en la raíz del proyecto con las variables necesarias.:
PORT=3000

DB_HOST=dpg-d60kckq4d50c73csukgg-a
DB_PORT=5432
DB_NAME=movilidad_qe2w
DB_USER=movilidad
DB_PASSWORD=tJ1OXFjVR3X7IsZAn9VOEZ0ubkZFp5CK
DATABASE_URL=postgresql://movilidad:tJ1OXFjVR3X7IsZAn9VOEZ0ubkZFp5CK@dpg-d60kckq4d50c73csukgg-a.oregon-postgres.render.com/movilidad_qe2w

# JWT Configuration
JWT_SECRET=movilidad_academica_uaslp
JWT_EXPIRES_IN=7d
Las variables pueden variar dependiendo del entorno (desarrollo, pruebas o producción).
Ejecución
Modo desarrollo:
npm run dev
Modo producción:
npm start
El servidor quedará disponible en http://localhost:3000.
Scripts esperados en package.json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
Si no se cuenta con nodemon instalado, ejecutar: npm install --save-dev nodemon
