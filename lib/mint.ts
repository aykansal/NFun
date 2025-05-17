import Arweave from "arweave";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

// Define interface for Solana wallet provider to match WalletAdapter interface
interface SolanaProvider {
    isConnected: boolean;
    publicKey: PublicKey;
    connect: () => Promise<{ publicKey: string }>;
}

declare global {
    interface Window {
        solana?: SolanaProvider;
    }
}

export const fetchImageFromUrl = async (url: string): Promise<File> => {
    console.log("Fetching image from URL:", url);
    const MAX_FILE_SIZE = 95 * 1024; // 95KB (slightly below 100KB limit)

    const response = await fetch(url);
    const blob = await response.blob();
    console.log("Original image size:", Math.round(blob.size / 1024), "KB");

    // If already below size limit, just return
    if (blob.size <= MAX_FILE_SIZE) {
        console.log("Image already under size limit, no compression needed");
        const filename = url.split('/').pop() || 'image.png';
        return new File([blob], filename, { type: blob.type || 'image/png' });
    }

    // Need to resize/compress
    console.log("Compressing image to under 100KB...");

    // Create image element
    const img = new Image();
    const imgLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
    });
    img.src = URL.createObjectURL(blob);
    await imgLoaded;

    // Extract filename and type
    const filename = url.split('/').pop() || 'image.png';
    const extension = filename.split('.').pop()?.toLowerCase() || 'png';
    const mimeType = extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : extension === 'gif'
            ? 'image/gif'
            : 'image/png';

    // Helper function to compress with canvas
    const compressImage = (quality: number): Promise<Blob> => {
        const canvas = document.createElement('canvas');

        // Calculate dimensions - ensure we keep aspect ratio
        let width = img.width;
        let height = img.height;

        // Scale down if image is large
        const MAX_DIMENSION = 800;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
                height = Math.round(height * (MAX_DIMENSION / width));
                width = MAX_DIMENSION;
            } else {
                width = Math.round(width * (MAX_DIMENSION / height));
                height = MAX_DIMENSION;
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(img, 0, 0, width, height);

        return new Promise<Blob>(resolve => {
            canvas.toBlob(blob => {
                if (!blob) throw new Error('Canvas toBlob returned null');
                resolve(blob);
            }, mimeType, quality);
        });
    };

    // Try compression with progressive quality reduction
    let quality = 0.8;
    let compressed = await compressImage(quality);

    // If still too big, reduce quality until under limit
    while (compressed.size > MAX_FILE_SIZE && quality > 0.1) {
        quality -= 0.1;
        compressed = await compressImage(quality);
        console.log(`Compression quality: ${quality.toFixed(1)}, Size: ${Math.round(compressed.size / 1024)}KB`);
    }

    // If we still can't get under the limit, reduce dimensions further
    if (compressed.size > MAX_FILE_SIZE) {
        console.log("Further reducing image dimensions to meet size requirement");
        const canvas = document.createElement('canvas');
        let scale = 0.8;

        while (compressed.size > MAX_FILE_SIZE && scale > 0.1) {
            const newWidth = Math.floor(img.width * scale);
            const newHeight = Math.floor(img.height * scale);

            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            compressed = await new Promise<Blob>(resolve => {
                canvas.toBlob(blob => {
                    if (!blob) throw new Error('Canvas toBlob returned null');
                    resolve(blob);
                }, mimeType, 0.6);
            });

            scale -= 0.1;
            console.log(`Scale: ${scale.toFixed(1)}, Size: ${Math.round(compressed.size / 1024)}KB`);
        }
    }

    console.log("Final compressed size:", Math.round(compressed.size / 1024), "KB");

    // Create File object from compressed blob
    return new File([compressed], filename, { type: mimeType });
};

export const uploadToArweave = async (imageInput: string | File, name: string, description: string) => {
    console.log("Uploading to Arweave...");
    let imageFile: File;

    if (typeof imageInput === 'string') {
        console.log("Converting URL to File:", imageInput);
        imageFile = await fetchImageFromUrl(imageInput);
    } else {
        // If it's already a file, check if it needs compression
        const MAX_FILE_SIZE = 95 * 1024; // 95KB
        if (imageInput.size > MAX_FILE_SIZE) {
            console.log("File is over 100KB, compressing...");
            // Convert file to URL to use same compression pipeline
            const url = URL.createObjectURL(imageInput);
            imageFile = await fetchImageFromUrl(url);
            URL.revokeObjectURL(url);
        } else {
            imageFile = imageInput;
        }
    }

    const arweave = Arweave.init({
        host: "localhost",
        port: 1984,
        protocol: "http",
        timeout: 20000,
        logging: false
    });

    const host = arweave.getConfig().api.host;
    const port = arweave.getConfig().api.port;
    const protocol = arweave.getConfig().api.protocol;

    const data = await imageFile.arrayBuffer();
    console.log("data", data);
    console.log("Final upload size:", Math.round(data.byteLength / 1024), "KB");

    const transaction = await arweave.createTransaction({
        data: data
    });

    transaction.addTag("App-Name", "NFToodle");
    transaction.addTag("Content-Type", imageFile.type);
    transaction.addTag("Content-Length", data.toString());


    const wallet = await arweave.wallets.generate();
    const address = await arweave.wallets.getAddress(wallet);

    await arweave.api.get(`/mint/${encodeURI(address)}/10000000000000000`);
    await arweave.transactions.sign(transaction, wallet);
    await arweave.transactions.post(transaction);
    console.log("transaction posted");
    const id = transaction.id;
    const imageUrl = id ? `${protocol}://${host}:${port}/${id}` : null;

    const metadata = {
        name: name,
        symbol: "CNFT",
        description: description,
        seller_fee_basis_points: 500,
        arweave_image: imageUrl,
        external_url: imageInput,
        attributes: [
            {
                trait_type: "NFT type",
                value: "Custom"
            }
        ],
        collection: {
            name: "Test Collection",
            family: "Custom NFTs"
        },
        properties: {
            files: [
                {
                    uri: imageUrl,
                    type: imageFile.type
                }
            ],
            category: "image",
            maxSupply: 0,
            creators: [
                {
                    address: "CBBUMHRmbVUck99mTCip5sHP16kzGj3QTYB8K3XxwmQx",
                    share: 100
                }
            ]
        },
    };

    const metadataString = JSON.stringify(metadata);

    const metadataTransaction = await arweave.createTransaction({
        data: metadataString
    });

    metadataTransaction.addTag("Content-Type", "application/json");
    await arweave.transactions.sign(metadataTransaction, wallet);

    const finalTxnDetails = await arweave.transactions.post(metadataTransaction);

    return {
        finalTxnDetails,
        metadataUri: `${protocol}://${host}:${port}/${metadataTransaction.id}`
    };
};

export const mintExistingNft = async (metadataUri: string, name: string) => {
    console.log("🚀 Starting mintExistingNft function...");
    console.log("Parameters:", { metadataUri, name });

    try {
        // 1. Connect to Solana Devnet
        console.log("🔌 Connecting to Solana testnet...");
        const connection = new Connection(clusterApiUrl("testnet"), "confirmed");
        console.log("✅ Connection established");

        // 2. Get user's connected wallet (e.g. Phantom)
        console.log("👛 Checking for wallet connection...");
        const provider = window.solana;
        console.log("Provider:", provider);

        if (!provider || !provider.isConnected) {
            console.error("❌ Wallet not connected");
            throw new Error("Wallet not connected");
        }

        const walletPublicKey = new PublicKey(provider.publicKey);
        console.log("👛 Wallet connected:", walletPublicKey.toString());
        // await connection.requestAirdrop(walletPublicKey, 2 * 1e9); // 2 SOL

        // 3. Initialize Metaplex instance with wallet identity
        console.log("🧰 Initializing Metaplex with wallet identity...");
        const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));
        console.log("✅ Metaplex initialized");

        // 4. Create the NFT using user's wallet (no mint keypair needed)
        console.log("🔨 Creating NFT with the following details:");
        console.log("- URI:", metadataUri);
        console.log("- Name:", name);
        console.log("- Creator:", walletPublicKey.toString());

        console.log("⏳ Sending NFT creation transaction...");
        const { nft, response } = await metaplex.nfts().create({
            uri: metadataUri,             // Link to your Arweave metadata JSON
            name,                         // NFT name
            symbol: "NFToodle",                   // Optional
            sellerFeeBasisPoints: 0,      // No royalties
            maxSupply: 1,                 // Only one copy
            creators: [
                {
                    address: walletPublicKey,
                    share: 100,
                    // verified: true,
                },
            ],
        });

        console.log("✅ NFT minted successfully!");
        console.log("NFT Details:", nft);
        console.log("NFT Address:", nft.address.toBase58());
        console.log("Transaction Signature:", response);

        return { nft, response };
    } catch (error: unknown) {
        console.error("❌ Error in mintExistingNft:", error);
        // Type guard for error with message and stack properties
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack
            });
        } else {
            console.error("Unknown error type:", error);
        }
        throw error;
    }
}