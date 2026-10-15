import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const form = document.querySelector("#balance-form");
const addressInput = document.querySelector("#addresses");
const checkButton = document.querySelector("#check-button");
const status = document.querySelector("#status");
const resultsBody = document.querySelector("#results-body");
const resultCount = document.querySelector("#result-count");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const addresses = [
    ...new Set(
      addressInput.value
        .split(/[\n,]+/)
        .map((address) => address.trim())
        .filter(Boolean),
    ),
  ];

  if (addresses.length === 0) {
    showMessage("Please enter at least one wallet address.", true);
    return;
  }

  if (addresses.length > 20) {
    showMessage("Please check no more than 20 addresses at a time.", true);
    return;
  }

  checkButton.disabled = true;
  checkButton.textContent = "Checking balances...";
  status.className = "status";
  status.textContent = "Connecting to Solana Devnet...";
  resultsBody.replaceChildren();

  let completed = 0;

  resultCount.textContent = `Checking ${addresses.length} address${addresses.length === 1 ? "" : "es"}...`;

  try {
    for (const address of addresses) {
      const row = document.createElement("tr");
      const addressCell = document.createElement("td");
      const balanceCell = document.createElement("td");
      const statusCell = document.createElement("td");

      addressCell.className = "address-cell";
      balanceCell.className = "balance-cell";
      statusCell.className = "row-status";

      addressCell.textContent = address;
      balanceCell.textContent = "—";
      statusCell.textContent = "Checking";

      row.append(addressCell, balanceCell, statusCell);
      resultsBody.append(row);

      try {
        const publicKey = new PublicKey(address);

        if (!PublicKey.isOnCurve(publicKey.toBytes())) {
          throw new Error("Address is not a standard wallet public key.");
        }

        const lamports = await connection.getBalance(publicKey);
        const sol = lamports / LAMPORTS_PER_SOL;

        balanceCell.textContent =
          sol.toLocaleString("en-US", {
            maximumFractionDigits: 9,
          }) + " SOL";

        statusCell.textContent = "Success";
        completed++;
      } catch (error) {
        balanceCell.textContent = "Unavailable";
        statusCell.textContent = "Error";
        statusCell.classList.add("error");

        if (error instanceof Error && error.message.includes("429")) {
          statusCell.textContent = "Rate limited";
        }
      }
    }

    resultCount.textContent = `${completed} of ${addresses.length} address${addresses.length === 1 ? "" : "es"} checked successfully.`;

    showMessage(
      "Finished checking balances. Results reflect the Devnet network.",
    );
  } catch (error) {
    showMessage(
      "Could not connect to Devnet. Check your internet connection and try again.",
      true,
    );
  } finally {
    checkButton.disabled = false;
    checkButton.innerHTML = 'Check balances <span aria-hidden="true">→</span>';
  }
});

function showMessage(message, isError = false) {
  status.textContent = message;
  status.className = isError ? "status error" : "status";
}
