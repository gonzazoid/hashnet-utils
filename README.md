### #Net utils

#### install

```
npm install -g hashet-utils
```

#### usage

```
hashnet prepare \
  --nonces=./path_to_nonces.json \
  --src=./directory with static sources/
  --dest=./directory which stores hashnet artefacts \
  --pkey=private key in #Net format
```

```
hashnet publish \
  --src= ./directory which stores hashnet artefacts (--dest param for hashnet prepare)\
  --agent=#Net agent's url template, can appears multiple times
```

#### private key format

```
[sign function].[hash function]:[key value - hex]
```

for example: ``secp256k1.sha256:b3dd3803e2c02c11f5ce26ef284cc7a092ce688943007848cd77282775f41fd3``

#### #Net agent's url template

depends on realisation and agent's ip/domain. For example:

```
http://172.86.96.172/{{request}}/{{function}}/{{path}} 
```
