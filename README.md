<img src="./pre-pro/logo.png" alt="drawing" width="200"/>

# GhoS~~SH~~ter

Ghoster is a single instance SSH server written in NodeJS allowing you to forward your instances behind a firewall to the public.

It works by hosting the instance, and allowing others to forward their services with nothing but SSH installed.

For instance, suppose you host this project on ghoster_server.com, if a user wants to expose their local site at port `3000` they can do:

```
ssh user@ghoster_server.com -p 2222 -R 0:localhost:3000
```

They will get back a random port as a reply after entering the password:

```
Allocated port 1024 for remote forward to localhost:3000
```

You can now access the service publicly at `ghoster_server.com:1024`

It's a great alternative to ngrok.io.

## Features

- Easy to set up, works with Docker
- No need to install anything on the user side (if you have a OS with SSH preinstalled, such as Linux or Mac)
- Simpler than other implementations, both the SSH server and the forwarding server are implemented in a single app.
- Easy to deploy, you can simply rename `config.sample.js` to `config.js`, set login credentials and spawn the Docker-container

## How to set it up

### Assumptions

We assume you have:

- Knowledge of Git
- Have docker and docker-compose installed
- The author has Linux as OS, if you have a different operating system, you should replace the commands below with your system's implementation.
- The standard config, except for the logins, give your more than enough ports to foward (128 different connections), should you want more or different ports, make sure you change those as well.

-----

1. Clone this repo
2. Rename `config.sample.js` to `config.js`, change the login's and other config settings you want to change.
    - **Note:** If you change the port range in `config.js`, you also have to change `docker-compose.yml`!
3. Run `docker-compose up -d --build` inside the repo directory
4. Make sure your server has opened the ports that are being used by Ghoster, normally that is port 1024 to 2048.
5. Run the SSH forwarding command on a client:
    `ssh user@ghoster_server.com -p 2222 -R 0:localhost:3000` (in this sample, you forward a local service on port 3000)
    