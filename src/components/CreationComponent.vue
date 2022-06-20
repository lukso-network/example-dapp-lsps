<script setup>
import { onMounted, ref, defineProps } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';

import { IPFS_GATEWAY_BASE_URL, COMMON_ABIS, INTERFACE_IDS } from '../constants';

const props = defineProps({ address: String });

const LSP4TokenName = ref('');
const LSP4TokenSymbol = ref('');
const iconUrl = ref('');
const LSP4Metadata = ref();
const totalSupply = ref();

const creationType = ref('unknown'); // LSP7 or LSP8

onMounted(async () => {
  const options = {
    ipfsGateway: IPFS_GATEWAY_BASE_URL,
  };

  // CHECK contract's interface
  try {
    const supportsInterfaceContract = new window.web3.eth.Contract([COMMON_ABIS.supportsInterface], props.address);
    const isLSP7 = await supportsInterfaceContract.methods.supportsInterface(INTERFACE_IDS.LSP7DigitalAsset).call();

    if (isLSP7) {
      creationType.value = 'LSP7';
    } else {
      const isLSP8 = await supportsInterfaceContract.methods.supportsInterface(INTERFACE_IDS.LSP8IdentifiableDigitalAsset).call();
      if (isLSP8) {
        creationType.value = 'LSP8';
      } else {
        console.error(`The contract: ${props.address} does not support LSP7 nor LSP8 interface id.`);
        return;
      }
    }
  } catch (err) {
    console.error(`Could not find interface of the contract: ${props.address}`);
  }

  // FETCH Metadata with erc725js
  // https://docs.lukso.tech/standards/nft-2.0/LSP4-Digital-Asset-Metadata
  const erc725Asset = new ERC725js(LSP4DigitalAssetSchema, props.address, window.web3.currentProvider, options);

  const LSP4DigitalAsset = await erc725Asset.fetchData(['LSP4TokenName', 'LSP4TokenSymbol', 'LSP4Metadata']);
  LSP4TokenName.value = LSP4DigitalAsset[0].value;
  LSP4TokenSymbol.value = LSP4DigitalAsset[1].value;
  LSP4Metadata.value = LSP4DigitalAsset[2].value;

  const icons = LSP4DigitalAsset[2].value.LSP4Metadata.icon;

  if (icons && icons.length > 0) {
    iconUrl.value = LSP4DigitalAsset[2].value.LSP4Metadata.icon[0].url.replace('ipfs://', IPFS_GATEWAY_BASE_URL);
  }

  // READ supply with web3js
  const lsp4DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, props.address); // LSP7 and LSP8 both share the totalSupply function.
  totalSupply.value = web3.utils.fromWei(await lsp4DigitalAssetContract.methods.totalSupply().call());
});
</script>

<template>
  <div class="asset-wrapper">
    <div class="preview-card" @click="$router.push(creationType === 'LSP8' ? `/collection/${address}/mint` : `/asset/${address}/mint`)">
      <div class="image" :style="{ backgroundImage: `url(${iconUrl})` }">
        <small class="supply">{{ creationType }} - Supply: {{ totalSupply }}</small>
      </div>

      <div class="infos">{{ LSP4TokenName }} ({{ LSP4TokenSymbol }})</div>
    </div>
    <button v-if="creationType === 'LSP7'" class="button" style="width: 200px" @click="$router.push(`/asset/${address}/mint`)">Mint</button>
    <button v-else-if="creationType === 'LSP8'" class="button" style="width: 200px" @click="$router.push(`/collection/${address}/mint`)">Mint in collection</button>
  </div>
</template>
