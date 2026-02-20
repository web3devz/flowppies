import Moralis from 'moralis';
Moralis.start({
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImMzNjU3MWE5LTBlZGEtNDc4Yi04OTU0LTA2Y2IyNDA3NzI3MCIsIm9yZ0lkIjoiNDYzNzgzIiwidXNlcklkIjoiNDc3MTM5IiwidHlwZUlkIjoiZjVmMTQ2NGQtODFhMy00NzVkLTllZmYtZDQwNDI4ZjlmYTVmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTQ1NzY4MzEsImV4cCI6NDkxMDMzNjgzMX0.AnKvdtDhe_PRBZ-_tNjvBwU2QOluDjEptFDXrnM7Gzc"
});

export async function getNFT(){
  try {
    // const response = await Moralis.EvmApi.nft.getContractNFTs({
    //   "chain": "flow-testnet",
    //   "format": "decimal",
    //   "address": "0x9157F94b5027B4943D8c03B303704fA9a9BB135f"
    // });
    const response = await Moralis.EvmApi.nft.getContractNFTs({
      chain: "545",
      format: "decimal",
      address: "0x9157F94b5027B4943D8c03B303704fA9a9BB135f"
    })
  
    // console.log(response.raw.result);
    return response.raw.result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

getNFT()