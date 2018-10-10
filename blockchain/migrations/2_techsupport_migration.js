var TechSupport = artifacts.require("./TechSupport.sol");

module.exports = function(deployer) {
  deployer.deploy(TechSupport);
};