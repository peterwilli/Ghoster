FROM node:14
MAINTAINER Peter Willemsen <peter@codebuffet.co>

# Create non-root user
RUN useradd -d /home/ghoster -m ghoster

# Create app directory
RUN su - ghoster -c "mkdir /home/ghoster/app"
WORKDIR /home/ghoster/app

# Create Host Key
ADD create_host_key.sh /usr/bin
RUN su - ghoster -c "cd /home/ghoster/app && /usr/bin/create_host_key.sh" && rm /usr/bin/create_host_key.sh

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# Bundle app source
COPY . .

CMD ["su", "-", "ghoster", "-c", "cd /home/ghoster/app && node main.js"]