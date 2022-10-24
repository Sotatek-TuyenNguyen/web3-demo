import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";

const NETWORK_URLS = {
  1: `https://mainnet.infura.io/v3/859af0ec9b7d4b598e8da5f0c835c027`,
  97: `https://twilight-lingering-sound.bsc-testnet.discover.quiknode.pro/0889f2203e0e5eb23e1e9ce2aca31665bc7d2cea/`,
  5: `https://goerli.infura.io/v3/859af0ec9b7d4b598e8da5f0c835c027`,
};

export const injected = new InjectedConnector({ supportedChainIds: [1, 97, 5] });

export const walletConnectConnector = new WalletConnectConnector({
  supportedChainIds: [1, 97, 5],
  rpc: NETWORK_URLS,
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true,
});
