const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MT Token - approve & transferFrom", function () {
  let mt, signer0, signer1;
  const amount = ethers.parseUnits("100", 18);

  beforeEach(async function () {
    [signer0, signer1] = await ethers.getSigners();
    const MT = await ethers.getContractFactory("MT");
    mt = await MT.deploy();
    await mt.waitForDeployment();
  });

  it("signer1이 approve 받은 후 signer0의 토큰을 자신에게 transferFrom 한다", async function () {
    const before0 = await mt.balanceOf(signer0.address);
    const before1 = await mt.balanceOf(signer1.address);

    // 1. approve: signer0이 signer1에게 이동 권한 부여
    await mt.connect(signer0).approve(signer1.address, amount);
    expect(await mt.allowance(signer0.address, signer1.address)).to.equal(amount);

    // 2. transferFrom: signer1이 signer0의 토큰을 signer1 주소로 전송
    await mt.connect(signer1).transferFrom(signer0.address, signer1.address, amount);

    // 3. balance 확인
    const after0 = await mt.balanceOf(signer0.address);
    const after1 = await mt.balanceOf(signer1.address);

    expect(after0).to.equal(before0 - amount);
    expect(after1).to.equal(before1 + amount);
    expect(await mt.allowance(signer0.address, signer1.address)).to.equal(0n);

    console.log("signer0 balance:", ethers.formatUnits(after0, 18));
    console.log("signer1 balance:", ethers.formatUnits(after1, 18));
  });
});
