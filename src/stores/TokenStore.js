import { getTokenFactoryConfig } from "layouts/tokensales/config";
// import { getConfig } from "layouts/tokensales/config";
import { action, makeObservable, observable } from "mobx";
import { connect, keyStores, utils, WalletConnection } from "near-api-js";

// eslint-disable-next-line import/prefer-default-export
export class TokenStore {
  walletConnection = null;

  accountId = null;

  nearConfig = getTokenFactoryConfig(process.env.REACT_APP_NODE_ENV || "development");

  nearUtils = utils;

  isSignedIn = false;

  account = null;

  constructor() {
    makeObservable(this, {
      walletConnection: observable,
      accountId: observable,
      account: observable,
      nearConfig: observable,
      nearUtils: observable,
      isSignedIn: observable,

      initWalletConnection: action,
      login: action,
      logout: action,
    });
  }

  initWalletConnection = async () => {
    try {
      const near = await connect({
        ...{
          deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() },
        },
        ...this.nearConfig,
      });

      this.walletConnection = new WalletConnection(near, "");
      this.isSignedIn = this.walletConnection.isSignedIn();
      // console.log(process.env.TOKEN_FACTORY_CONTRACT_NAME || "token-factory.tokenhub.testnet");
      // console.log(this.account);
      if (this.isSignedIn) {
        this.accountId = this.walletConnection.getAccountId();
        this.account = await near.account(this.accountId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  login = () => {
    // Allow the current app to make calls to the specified contract on the
    // user's behalf.
    // This works by creating a new access key for the user's account and storing
    // the private key in localStorage.
    this.walletConnection.requestSignIn(this.nearConfig.contractName);
  };

  logout = () => {
    this.walletConnection.signOut();
    this.isSignedIn = this.walletConnection.isSignedIn();
  };
}
