# Rock CMS Docker Backend Instance
FROM node:11.11
RUN mkdir /app
#COPY ./ /app
#ADD . /app

WORKDIR /app

COPY package* ./

RUN npm install
RUN npm install nodemon -g

COPY . .
EXPOSE 4300
