// eslint-disable-next-line @typescript-eslint/no-require-imports
const hre = require('hardhat');
const { ethers, network } = hre;

async function main() {
  console.log('\n========================================================');
  console.log(`🚀 Starting EventContract Deployment to ${network.name.toUpperCase()}...`);
  console.log('========================================================\n');

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error('No deployer signer found. Please ensure PRIVATE_KEY is configured in your .env.local file.');
  }

  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log(`Deployer Account: ${deployerAddress}`);
  console.log(`Account Balance:  ${ethers.formatEther(balance)} STT`);
  console.log(`Target Network:   ${network.name} (Chain ID: ${network.config.chainId || 50312})\n`);

  // 1. Get Contract Factory
  console.log('📦 Compiling and retrieving EventContract factory...');
  const EventContractFactory = await ethers.getContractFactory('EventContract');

  // 2. Deploy Contract
  console.log('⏳ Broadcasting deployment transaction to Somnia Network...');
  const eventContract = await EventContractFactory.deploy();

  console.log('⏳ Waiting for block inclusion and confirmation...');
  await eventContract.waitForDeployment();

  const contractAddress = await eventContract.getAddress();
  const deployTxHash = eventContract.deploymentTransaction()?.hash;

  console.log('\n========================================================');
  console.log('🎉 EventContract successfully deployed to Somnia Network!');
  console.log('========================================================');
  console.log(`📍 Contract Address:     ${contractAddress}`);
  console.log(`🔗 Deployment Tx Hash:   ${deployTxHash}`);
  console.log(`🌐 Somnia Block Explorer: https://shannon-explorer.somnia.network/address/${contractAddress}`);
  console.log('========================================================\n');

  console.log('👉 Next Steps:');
  console.log(`1. Add to .env.local:`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log(`2. Update contracts/index.ts with the new deployed address.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed with error:', error);
    process.exit(1);
  });
