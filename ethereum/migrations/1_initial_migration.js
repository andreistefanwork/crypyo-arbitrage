const Arbitrage = artifacts.require("Arbitrage");

module.exports = function (deployer) {
  deployer.deploy(Arbitrage, '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e');
};
