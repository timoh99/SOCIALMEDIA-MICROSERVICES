FROM node: 18-alphine

WORKING /use/src/app

COPY package*.json./

RUN npm cl --only=production

 COPY . .



EXPOSE 3002

 CMD ["node","src/index.js"]