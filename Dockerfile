FROM node:21
WORKDIR /presupuestos-sell/
COPY . /presupuestos-sell/
RUN npm install
EXPOSE 5174
CMD ["npm", "run", "dev"]