import React from "react";
import {icons} from "../themes/icon";
import {injected, walletConnectConnector} from "../config/wallets";
import {useWeb3React} from "@web3-react/core";

const ConnectWallet = () => {
    const { activate } = useWeb3React();

    const connectInjectedConnector = () => {
        activate(injected).then(()=> console.log("Connect wallet successfully"));
    };

    const connectWalletConnectConnector = () => {
        activate(walletConnectConnector, undefined, true).catch((e) =>
            console.log("error", e)
        );
    };

    return (
        <div className="connect__wallet">
            <div
                className="connect__wallet__option"
                onClick={connectInjectedConnector}
            >
                <img src={icons.metaMask} alt="Connect Metamask"/>
                <span>Connect Metamask</span>
            </div>
            <br />
            <div
                className="connect__wallet__option"
                onClick={connectWalletConnectConnector}
            >
                <img src={icons.walletConnect} alt="Wallet Connect"/>
                <span>Wallet Connect</span>
            </div>
        </div>
    );
};

export default ConnectWallet;
