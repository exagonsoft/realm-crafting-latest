import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "52dd8a26fcdf4de093cb29e4d56dc23c";
const secretKey = process.env.THIRDWEB_SECRET_KEY || "ZV3AY29LmLeHj7mGGP9bFv3HtoH-ovrgnnP5fHueHdwTQ9NQlW0awuML2_OAHDS4rL5-gO1_SHx0KhDAcJB7Bw";

export const client = createThirdwebClient(
  secretKey
    ? { secretKey }
    : {
        clientId,
      }
);
