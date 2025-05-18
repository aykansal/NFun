import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  percentAmount,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import {
  createNft,
  // fetchDigitalAsset,
  mplTokenMetadata
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

(async () => {
  try {
    console.log("Creating Umi instance...");
    const umi = createUmi("https://api.testnet.solana.com");

    const keypair = umi.eddsa.createKeypairFromSecretKey(
      bs58.decode(
        // "588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2"
      )
    );

    // await umi.rpc.airdrop(keypair.publicKey, createAmount(1, "SOL", 9));

    // Use keypairIdentity to set the keypair as the signer
    const signer = keypairIdentity(keypair);
    umi.use(signer);
    umi.use(mplTokenMetadata());

    console.log("Keypair loaded. Public key:", keypair.publicKey);

    console.log("Generating new mint address...");
    const mint = generateSigner(umi);

    console.log("Creating NFT...");
    const { signature } = await createNft(umi, {
      mint,
      name: "NFToodle_Node_Default",
      // Replace this with your Arweave metadata URI
      // uri: "https://arweave.net/AYtAhA7MMO1v5dh8ndGTyLjPDJT1ERvsRnEqFWg5VMc",
      uri: "https://ffaaqinzhkt4ukhbohixfliubnvpjgyedi3f2iccrq4efh3s.arweave.net/KUAIIbk6p8oo4XHRcq0U__C2r0mwQaNl0gQow4Qp9yk",
      sellerFeeBasisPoints: percentAmount(0),
      symbol: "NFun",
      creators: [
        {
          address: keypair.publicKey,
          share: 100,
          verified: true
        }
      ]
    }).sendAndConfirm(umi);

    console.log("NFT created successfully!");
    console.log("Mint address:", mint.publicKey);
    console.log("Transaction signature:", signature);

    // console.log("Fetching digital asset...");
    // const asset = await fetchDigitalAsset(umi, mint.publicKey);
    // console.log("Digital Asset:", asset);
  } catch (error) {
    console.error("Error:", error);
    console.error("Stack trace:", error.stack);
  }
})();









// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { publicKey } from "@metaplex-foundation/umi";
// import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";

// BigInt.prototype.toJSON = function () {
//   return this.toString();
// };

// (async () => {
//   try {
//     // Create a UMI instance
//     const umi = createUmi("https://api.testnet.solana.com");

//     // The owner's public key
//     const ownerPublicKey = publicKey(
//       "DUYxkCzDk9Ro5EiAKE9q1t9vaofiENrvRFXcF4tJxgJo"
//     );

//     console.log("Fetching NFTs...");
//     const allNFTs = await fetchAllDigitalAssetWithTokenByOwner(
//       umi,
//       ownerPublicKey
//     );

//     console.log(`Found ${allNFTs.length} NFTs for the owner:`);
//     allNFTs.forEach((nft, index) => {
//       console.log(`\nNFT #${index + 1}:`);
//       console.log("Mint Address:", nft.publicKey);
//       console.log("Name:", nft.metadata.name);
//       console.log("Symbol:", nft.metadata.symbol);
//       console.log("URI:", nft.metadata.uri);
//     });

//     // If you need the full NFT data
//     console.log("\nFull NFT data:");
//     // console.log(JSON.stringify(allNFTs, null, 2));
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();