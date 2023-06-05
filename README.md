# JWT-Auth Microservice for [Ivi Clone backend](https://github.com/srgklmv/ivi-clone-repo)

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</p>


## Description

This microservice is a part of [Ivi Clone backend application](https://github.com/srgklmv/ivi-clone-repo).
Here you can find an instructions for setting up and running microservice.

If you found this repo before exploring the [main repo](https://github.com/srgklmv/ivi-clone-repo),
I recommend you to explore [main repo](https://github.com/srgklmv/ivi-clone-repo) firstly for understanding how to run the application.

## Requirements
- Postgres
- RabbitMQ
- NestJS

## Installation

```bash
$ npm i
```

> Note: If you downloaded this repo from main repo script, there is no need to run install command.

## Setting up & running service

### For localhost

1. Create database named **auth** using Postgres.
2. Set up **.dev.env** file.
3. Run service!

```bash
# watch mode
$ npm run start:dev
```

### For Docker
> Set up a **.docker.env** file and continue follow main repo instructions.

### .env file parameters (not self-explanatory)
```
GOOGLE_CLIENT_ID
GOOGLE_SECRET
```
Google parameters for oauth. You can get them by creating an app here:
https://console.cloud.google.com/apis/dashboard

```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
```
These are parameters for an email account from which an activation mail will be sent from. 
They're not required to run the microservice if this feature is not required.
```
API_URL=http://193.32.203.137:4000
```
API URL should be an ***external*** address of API Gateway. It's required for oauth features to work. 

## Test

```bash
# unit tests
$ npm run test

```

## Author
[Vladimir Andreev](https://github.com/JcJet)
## Description



