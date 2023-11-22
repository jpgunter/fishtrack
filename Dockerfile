FROM node:18-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm i
COPY ./ ./
RUN npm run build
CMD ["npx", "serve", "-s","build"]