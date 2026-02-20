import { getNFT } from './getNFT';

(async () => {
  console.log('Testing getNFT function...');
  const nfts = await getNFT();
  console.log('Result:', nfts);
})();

