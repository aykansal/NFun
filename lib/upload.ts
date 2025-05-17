// import { walletKey } from "@/config";
import Arweave from "arweave";

const walletKey = {}
export async function uploadArdrive(file: File) {
    console.log("Starting direct Arweave upload...");

    try {
        // Initialize Arweave
        const arweave = Arweave.init({
            host: "arweave.net",
            port: 443,
            protocol: "https",
        });

        // Get wallet address
        const walletAddress = await arweave.wallets.jwkToAddress(walletKey);
        console.log("Wallet address:", walletAddress);

        // Get wallet balance
        const winston = await arweave.wallets.getBalance(walletAddress);
        const ar = arweave.ar.winstonToAr(winston);
        console.log("Wallet balance:", ar, "AR");

        // Convert File to ArrayBuffer
        const fileBuffer = await file.arrayBuffer();

        // Create a transaction
        const transaction = await arweave.createTransaction({
            data: fileBuffer
        }, walletKey);

        // Add tags
        transaction.addTag("Content-Type", file.type || "application/octet-stream");
        transaction.addTag("App-Name", "NFToodle");
        transaction.addTag("App-Version", "1.0.0");
        transaction.addTag("Unix-Time", Date.now().toString());

        // Sign the transaction
        await arweave.transactions.sign(transaction, walletKey);

        // Submit the transaction
        console.log("Submitting transaction to Arweave...");
        const response = await arweave.transactions.post(transaction);

        if (response.status === 200 || response.status === 202) {
            console.log("Upload successful!");
            const transactionId = transaction.id;
            const url = `https://arweave.net/${transactionId}`;

            return {
                id: transactionId,
                url,
                status: true,
                owner: walletAddress,
                response
            };
        } else {
            console.error("Upload failed with status:", response.status, response.statusText);
            return {
                status: false,
                error: `Upload failed with status: ${response.status} ${response.statusText}`
            };
        }
    } catch (error) {
        console.error("Error uploading to Arweave:", error);
        return {
            status: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}