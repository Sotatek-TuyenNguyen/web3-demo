import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import App from './App';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

function getLibrary(provider, connector) {
    const library = new Web3Provider(provider);
    return library;
}

const Web3ProviderNetwork = createWeb3ReactRoot('NETWORK');

ReactDOM.render(
    <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
            <App />
        </Web3ProviderNetwork>
    </Web3ReactProvider>,
    document.getElementById('root')
);
