FROM node: 18-alphine

WORKING /use/src/app

COPY package*.json./

RUN npm cl --only=production

 COPY . .



EXPOSE 3001

 CMD ["node","src/index.js"]