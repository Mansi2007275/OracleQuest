const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x9c7EC5B79c27Be88ABB98815246A48E125c6675c';
  const rpcUrl = process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';

  console.log('Connecting to Somnia Shannon Testnet RPC:', rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Check code at contract address
  const code = await provider.getCode(contractAddress);
  console.log(`Bytecode length at ${contractAddress}: ${code.length}`);

  if (code === '0x' || code.length <= 2) {
    console.log('⚠️ Contract is not deployed at address:', contractAddress);
    return;
  }

  const [signer] = await ethers.getSigners();
  console.log('Signer address:', signer ? await signer.getAddress() : 'None');

  const abi = [
    'function createEvent(string memory title, uint256 deadline) external returns (uint256 eventId)',
    'function eventCount() view returns (uint256)',
    'function events(uint256 eventId) view returns (uint256 id, string memory title, uint256 deadline, uint256 totalYesPool, uint256 totalNoPool, bool isResolved, bool outcome, address creator)'
  ];

  const contract = new ethers.Contract(contractAddress, abi, provider);
  const count = await contract.eventCount();
  console.log('Current on-chain eventCount:', count.toString());

  for (let i = 1; i <= Math.min(Number(count), 6); i++) {
    const evt = await contract.events(i);
    console.log(`On-Chain Event #${i}: ID=${evt.id.toString()}, Title="${evt.title.slice(0, 40)}..."`);
  }
}

main().catch(console.error);
