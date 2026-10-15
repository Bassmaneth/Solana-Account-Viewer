const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

// Connect to the Solana Devnet network
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Enter a wallet address to check
const addresses = ["11111111111111111111111111111111"];

async function viewBalances() {
  for (const address of addresses) {
    try {
      const publicKey = new PublicKey(address);

      const lamports = await connection.getBalance(publicKey);

      const sol = lamports / LAMPORTS_PER_SOL;

      console.log("Address:", address);
      console.log("Balance:", sol, "SOL");
      console.log("--------------------");
    } catch (error) {
      console.log("Could not check address:", address);
      console.log(error.message);
    }
  }
}

viewBalances();
