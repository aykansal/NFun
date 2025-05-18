import mime from 'mime-types';
import { toast } from "sonner";
import { walletKey } from "@/config";
import { JWKInterface } from "arweave/node/lib/wallet";
import { ArweaveSigner, TurboFactory } from "@ardrive/turbo-sdk/web";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

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

// Constants
const MAX_FILE_SIZE = 95 * 1024; // 95KB (slightly below 100KB limit)
const MAX_DIMENSION = 800;

/**
 * Convert File to Uint8Array
 */
function fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Compress image using canvas
 */
async function compressImage(img: HTMLImageElement, quality: number, mimeType: string): Promise<Blob> {
    const canvas = document.createElement('canvas');

    // Calculate dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;

    // Scale down if image is large
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
}

/**
 * Fetch and optimize image from URL
 */
export const fetchImageFromUrl = async (url: string): Promise<File> => {
    console.log("Fetching image from URL:", url);

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

    // Try compression with progressive quality reduction
    let quality = 0.8;
    let compressed = await compressImage(img, quality, mimeType);

    // If still too big, reduce quality until under limit
    while (compressed.size > MAX_FILE_SIZE && quality > 0.1) {
        quality -= 0.1;
        compressed = await compressImage(img, quality, mimeType);
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
    URL.revokeObjectURL(img.src); // Clean up

    // Create File object from compressed blob
    return new File([compressed], filename, { type: mimeType });
};

/**
 * Upload file to Arweave via Turbo
 */
const uploadToTurbo = async (file: File, creatorAddress: string) => {
    const fileSize = file.size;
    const fileName = file.name;
    const contentType = file.type || mime.lookup(fileName) || 'application/octet-stream';

    const signer = new ArweaveSigner(walletKey as JWKInterface);
    const turbo = TurboFactory.authenticated({ signer });

    // Check size and log appropriate message
    if (fileSize > 100 * 1024) {
        const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({ bytes: [fileSize] });
        console.log(`File: ${fileName}, Size: ${fileSize} bytes, Cost: ${fileSizeCost} Winc`);
    } else {
        console.log(`File: ${fileName}, Size: ${fileSize} bytes (Free upload)`);
    }

    try {
        const buffer = await fileToUint8Array(file);
        const uploadResult = await turbo.uploadFile({
            // @ts-expect-error ignore
            fileStreamFactory: () => {
                return new ReadableStream({
                    start(controller) {
                        controller.enqueue(buffer);
                        controller.close();
                    }
                });
            },
            fileSizeFactory: () => fileSize,
            fileName: fileName,
            contentType,
            dataItemOpts: {
                tags: [
                    { name: 'Version', value: '2.0.1' },
                    { name: "App-Name", value: "NFToodle" },
                    { name: 'Content-Type', value: contentType },
                    { name: 'Creator-Sol-Address', value: creatorAddress.toString() },
                    { name: 'File-Extension', value: fileName.split('.').pop() || 'jpg' },
                    { name: 'Wallet-Address', value: "ww5nJTj6dD6Q6oIg-bOm20y2yawWDqDcQbQDcmwGOlI" }
                ]
            }
        });

        if (!uploadResult.id) {
            throw new Error("Failed to upload to Arweave");
        }

        console.log(`Uploaded ${fileName} (${contentType}) successfully. TX ID: ${uploadResult.id}`);
        return uploadResult.id;
    } catch (error) {
        console.error(`Failed to upload ${fileName}:`, error instanceof Error ? error.message : error);
        throw error;
    }
};

/**
 * Upload content to Arweave
 */
export const uploadToArweave = async (imageInput: string | File, name: string, description: string, creatorAddress: string) => {
    console.log("Uploading to Arweave...");

    try {
        // Process the image input
        let imageFile: File;
        if (typeof imageInput === 'string') {
            console.log("Converting URL to File:", imageInput);
            imageFile = await fetchImageFromUrl(imageInput);
        } else {
            if (imageInput.size > MAX_FILE_SIZE) {
                console.log("File is over size limit, compressing...");
                const url = URL.createObjectURL(imageInput);
                imageFile = await fetchImageFromUrl(url);
                URL.revokeObjectURL(url);
            } else {
                imageFile = imageInput;
            }
        }

        // Upload image to Arweave
        const imgTxId = await uploadToTurbo(imageFile, creatorAddress);

        // Create metadata
        const metadata = {
            name,
            symbol: "NFTler",
            description: "Meme Minting by NFToodler",
            seller_fee_basis_points: 500,
            image: `https://arweave.net/${imgTxId}`,
            external_url: typeof imageInput === 'string' ? imageInput : null,
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
                        uri: `https://arweave.net/${imgTxId}`,
                        type: imageFile.type
                    }
                ],
                category: "image",
                maxSupply: 1,
                creators: [
                    {
                        address: "creatorAddress",
                        share: 100
                    }
                ]
            },
        };

        // Upload metadata to Arweave
        const metadataFile = new File(
            [JSON.stringify(metadata)],
            "metadata.json",
            { type: "application/json" }
        );

        const metadataTxId = await uploadToTurbo(metadataFile, creatorAddress);
        console.log("Metadata Transaction ID:", metadataTxId);

        return {
            finalTxnDetails: metadataTxId,
            metadataUri: `https://arweave.net/${metadataTxId}`,
            status: true,
            error: null,
        };
    } catch (error) {
        console.error("Error in uploadToArweave:", error);
        return {
            finalTxnDetails: null,
            metadataUri: null,
            status: false,
            error: error instanceof Error ? error.message : "Unknown error during upload",
        };
    }
};

export const mintExistingNft = async (metadataUri: string, name: string) => {
    console.log("Starting mintExistingNft function...");
    try {
        const connection = new Connection(clusterApiUrl("testnet"), 'confirmed');
        const provider = window.solana;
        if (!provider || !provider.isConnected) {
            throw new Error("Wallet not connected");
        }

        const walletPublicKey = new PublicKey(provider.publicKey);

        // Initialize Metaplex
        console.log("Initializing Metaplex with wallet identity...");
        const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(provider));
        console.log(metaplex)
        // Create the NFT
        console.log("Creating NFT:", { metadataUri, name, creator: walletPublicKey.toString() });

        const { nft, response } = await metaplex.nfts().create({
            uri: metadataUri,
            name,
            symbol: "NFToodle",
            sellerFeeBasisPoints: 0,
            maxSupply: 10,
            creators: [
                {
                    address: walletPublicKey,
                    share: 100,
                },
            ],
        });

        console.log("NFT minted successfully!");
        console.log("NFT Address:", nft.address.toBase58());
        console.log("Transaction Signature:", response.signature);

        return { nft, response, status: true };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("User rejected")) {
                console.log("User rejected the transaction");
                toast.error("User rejected the transaction");
            } else {
                console.error("Error details:", {
                    message: error.message,
                    stack: error.stack
                });
                toast.error("Failed to mint NFT");
            }
        } else {
            console.error("Unknown error:", error);
            toast.error("Unknown error during minting");
        }

        return { status: false };
    }
};