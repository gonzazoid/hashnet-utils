const getSignedMessage = async (privateKey, hash, label, nonce) => {
  const [hashFunc, digest] = hash.split(":");
  const publicKey = privateKey.getPublicKey();

  const message = `${hashFunc} ${digest} ${nonce} ${label}`;
  console.log("MESSAGE TO SIGN!!!", message);
  const signature = await privateKey.sign(message);
  
  const messageToSave = {
    publicKey,
    hash: `${hashFunc}:${digest}`,
    signature,
    label,
    nonce: `${nonce}`
  };

  return messageToSave;
};

export default getSignedMessage;
