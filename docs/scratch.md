# SCRATCH

# PN Setup Overview
This document walks thru the detailed steps of PN enabling a test service and a client of the test service on your local machine, in the process one sets up a local privacy network consisting of two privacy domains.

## Abbreviations

```bash {cmd}
docker-composev version
```

##### Networks

`PN` Privacy Network
`PD` Privacy Domain
`PP` Privacy Pipe

<br/>
balls

##### Resources
`RA` - Resource Authority
`MyRA` - My Resouce Authority 
- Tool to create & provision `RA`s

##### Trust
`TA` - Trust Authority
`MyTA` - My Trust Authority
- Tool to create & provision `TA`s

##### Services
`ETS` - Enabled Test Service


## Overview of the steps

  1. Setup local dev `directory structure` and clone `privacy-networks` repo from `GitHub`
  2. Setup `testnet` and build `Network Management Plane` metadata
  3. Use `MyRA` to provision a new `RA` which will issue all resources
  4. Use `MyTA` to provision a new `TA` which will issue all trust credentials

  5. `PN` - Setup an `ETS` in its own `PD`
		- Create a `PD` and give it identity and description in the network
    	- Proxy the `PD`'s public http endpoints with `PP` endpoints
    	- Proxy the `PD`'s outbound calls to other `PD`'s with outbound `PP`'s -- NONE
    	- Run a local `TA` and local `RA` within compute environment of the `ETS`

  6. `PN` - Setup a `Client` of the `PN`'s `ETS` into its own `PD`
		- Create a `PD` and give it identity and description in the network
		- Proxy the `PD`'s public http endpoints with `PP` endpoints
    	- Proxy the `PD`'s outbound calls to other `PD`'s with outbound `PP`'s -- NONE
    	- Run a local `TA` and local `RA` within compute environment of the `ETS`

  7. Test the `PP`s
  8. Add trust to your local `PN`
		- Issue `Trust Credentials`
		- Set `Trust Criteria`
  9. Configure the `Trust Manager` to view your local `PN`


## Docker Network

This example uses [docker-compose](https://docs.docker.com/compose/) to setup a [docker network](https://docs.docker.com/engine/reference/commandline/network/) which is required to run a local `PN`

#### Check Docker Compose

Check if `docker-compose` is installed and the version -- **You may need to upgrade**

<div class='md-label'></div>

```bash
docker-compose version
```

If `docker-compose` is installed you will see an output similar to this

```bash
# Output
docker-compose version 1.23.2, build 1110ad01
docker-py version: 3.6.0
CPython version: 3.6.6
OpenSSL version: OpenSSL 1.1.0h  27 Mar 2018
```

If `docker-compose` **IS NOT** installed follow the instructions in the next section

#### Install or Upgrade Docker Compose

If `docker-compose` **IS NOT** installed or if any of the `docker-compose` commands in the next section result in an error use the link below to `install` or `upgrade` to the latest version

**[Install Docker Compose](https://docs.docker.com/compose/install/)**	


#### Setup Docker Network

List existing networks

```bash
docker network ls
```

Create new network named `my-pn-network`

```bash
docker network create my-pn-network 
```

Show all containers on the `my-pn-network`

```bash {.copy-clip}
docker network inspect my-pn-network
```

You can also visit the links below to learn more about `docker networks` and `docker-compose`
 - https://docs.docker.com/network/bridge/
 - https://docs.docker.com/compose/compose-file/#external-1

## Example code in GitHub
An example of the testnet can be found in https://github.com/webshield-dev/privacy-networks/tree/master/testnet


## Service that is PN enabled - Test Service
 Is a dockerized container  
  - dockerHub webshielddev/test-service:latest
  - code is at  https://github.com/webshield-dev/test-service


## Network Management Plane Metadata
The command `bash regenMetadata.bash` regenerates all the metadata

- new network identities (DIDs)
  - MyRA resource authority issues all PN resources `did:wsutm:localhost-resource-authority-myra`
  - MyTA trust authority issues DID all PN trust credentials - `did:wsutm:localhost-resource-authority-myta`
  - PN enabled test service
    - Test service privacy domain PN resource - issued by myRA `did:wsutm:localhost-resource-pd-test-service`
    - Trust Authority - make pipes decisions `did:wsutm:localhost-trust-authority-test-service`
  - PN enabled client
    - test client privacy domain PN resource - issued by myRA  `did:wsutm:localhost-resource-pd-client`
    - Trust Authority - make pipes decisions `did:wsutm:localhost-trust-authority-client`
  - PN trust criteria - issued by myRA `did:wsutm:localhost-resource-criteria-must-be-authnet-pd`


## Supporting Documents
The developer portal has an overview [link](https://github.com/webshield-dev/docs/blob/master/docs/setup-network.md) but this has all the details.


## Rich TODO that ran into move to airtable
- Add NGINX to frontend the pa endpoints
- Add a privacy adapter that is in-front of the resource server - adds a synthetic attribute based on trust
- move test resource server to webshielddev
- should really split the authorities from service as will make it easier
- trust model service config should match resource authority
- Test resource server would be better named as test service
- Make sure TMS whitelist works, also for trust manager
- Add TMS whitelist to resoure authority, make sure works for trust manager
- Add enforcement of criteria for inbound data
- look at agent-2-agent and TLS

## Example code in GitHub
An example of the testnet can be found in https://github.com/webshield-dev/privacy-networks/tree/master/testnet

Notes
  - It contains all necessary metadata, keys, and scripts to generate the management plane
    - `bash buildAll.bash`

## Service that is PN enabled - Test Resource Server
Is a dockerized container  
 - dockerHub webshielddev/test-resource-server:latest
 - code is at  https://github.com/niceoneallround/test-resource-server  - FIXME move to webshielddev

## DIDs and DID document template

### DID  naming conventions
The testnet does not use a DLT hence the DIDs are "wsutm" DIDs that for the test network are handcrafted with the following format

- For the authorities RA and TA `did:wsutm:<domain-name>-<authority-type>-authority-<name>`
  - did:wsutm:localhost-resource-authority-myra

- For resources `did:wsutm:<domain-name>-resource-<type>-<id>`
  - did:wsutm:localhost-resource-pd-testrs

## DID Document template
The following is a template DID document that is used when creating authorities and resources. It can be found in the templates directory.

```yaml
context: https://w3id.org/did/v1
id: REPLACE-WITH-DID
name: DID document template replace the REPLACE items accordingly
comment: using for local machine
publicKey:
  - id: REPLACE-WITH-DID#keys-RSA
    name: a RSA key
    publicKeyPem: |
      -----BEGIN PUBLIC KEY-----
        REPLACE WITH SIGNING RSA PUBLIC KEY
      -----END PUBLIC KEY-----
authentication:
  - type: rsaSignatureAuthentication2018
    publicKey: REPLACE-WITH-DID#keys-RSA
service:
```

# 1. Create a local directory structure for all artifacts
The recommended (but not required) structure is
 - testnet
    - db (holds the repo)
      - credential
      - diddoc
      - resource
    - myra the resource authoritry used to issue all the resources
      - config
      - init_template
      - keys (the signing key)
    - myta used to issue credentials to resource
      - config
      - init_template
      - keys (the signing key)
    - service-pd (holds the PN enabled test resource server)
      - copydb (holds a copy of db so can be mounted as volume by docker-compose from this dir)
      - config (holds config for all services)
      - pa
        - keys
      - pd-artifacts
        - keys
        - resource
      - rs - used to query resources
        - keys
      - ta - used for local pipe authorization
        - init_template
        - keys
    - client-pd (hold the tests that invoke the resource server over pipes)
      - copydb (holds a copy of db so can be mounted as volume by docker-compose from this dir)
      - config
      - pa
      - pd-artifacts
      - rs
      - ta - used for local pipe authorization

# 2. Create a metadata repo
Holds all the network metadata and is accessed by all services in the network.
See [link](https://github.com/webshield-dev/docs/blob/master/docs/setup-network.md#step-1---create-the-management-plan-metadata-repository)

# 3. Provision the "MyRA" Resource Authority
Steps are
  1. Create the MyRA signing key
  2. Create the MyRA did and diddoc
  3. Create the resource authority docker application config file
  4. provision MyRA into the network


## 3.1 Generate the myRA signing RSA key
From the 'myra/keys' directory run

  `bash ../../../tools/genkeys/generateRSA.bash`

The certificate is not used so hit return for all prompts except Common Name *myra.not.used*

Rename the files so prefixed with tls
  `mv rsa.cert.pem sign.rsa.cert.pem; mv rsa.key.pem sign.rsa.key.pem; mv rsa.public.key.pem sign.rsa.public.key.pem`

## 3.2 Create the myRA DID and DID Document

1. The MyRA DID is: `did:wsutm:localhost-resource-authority-myra`

2. Create MyRA DID document
  - Copy did document template to `myra/init_template/ra-diddoc.yaml`
    - Set the DID to `did:wsutm:localhost-resource-authority-myra` in the template
    - Copy the contents of 'ra/keys/sign.rsa.public.key.pem' into the template


## 3.3 Create the myRA config file used by Docker application
Steps are
  - create `myra/config/run_in_docker_config.yaml` as shown below
  - It has set
    - The did to MyRa
    - Set the signing key info
      - public_key_id: refers to an id in the did document
      - private_key: holds the signing private key

```yaml
version: '1'
app_version: 1.0.0
description: Resource Authority - file paths assume Docker volumes
resource_authority:
  did: did:wsutm:localhost-resource-authority-myra
  public_key_id: did:wsutm:localhost-resource-authority-myra#keys-RSA
  private_key:
    type: file
    key_type: RSA
    value: '/keys/sign.rsa.key.pem'
block:
  block_type: Logger
shared_files_dir:
  description: repo has been mounted at /db using Docker volumes
  dd_dir: '/db/diddoc'
  resource_dir: '/db/resource_vc'
  credential_dir: '/db/credential'
```

## 3.4 Provision MyRA into the network
Run the following command to provision myRA into the network. Command details [link](https://github.com/webshield-dev/docs/blob/master/docs/setup-network.md#step-2---provisioning-a-pn-resource-authority)

```bash
if docker run \
  --mount type=bind,source="$(pwd)/myra/config",destination="/config" \
  --mount type=bind,source="$(pwd)/myra/init-template",destination="/template" \
  --mount type=bind,source="$(pwd)/myra/keys",destination="/keys" \
  --mount type=bind,source="$(pwd)/db",destination="/db" \
  webshielddev/resource-authority \
  -init \
  -config /config/run_in_docker_config.yaml \
  -ddt /template/ra_diddoc.yaml; then
    echo "myRA Provision - Successful"
else
  echo "***** myRA Provision - FAILED *****"
  exit 1
fi
```

# 4. Provision the MyTa
TODO - add when create trust credentials

# 5. PN enable the test service
This is covered in [link](./setup_network_setup_service_pd.md)

# 6. PN enable a client of service
This is covered in [link](./setup_network_setup_client_pd.md)

# 7. Testing

Start up the services in the domains

  `cd service-pd; docker-compose up`
  `cd client-pd; docker-compose up`

Ping the client-pd outbound pipes
  - `curl -k https://localhost:42006/pa/v1/privacy_pipe/outbound/user/ping`  - should return 200
  - `curl -k https://localhost:42006/pa/v1/privacy_pipe/outbound/query/ping` - should return 200

# 8. Adding Trust and testing
TODO

# 9. Install Trust Manager
TODO
