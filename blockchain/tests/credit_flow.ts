import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("cronia flow", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  // Program handles
  let credit: Program;
  let vault: Program;
  let recv: Program;
  let pool: Program;

  before(async () => {
    // Após anchor build, os IDLs ficam em target/idl
    // Anchor auto-carrega por nome (CamelCase) se o tsconfig/scritps estiverem ok
    // @ts-ignore
    credit = anchor.workspace.CreditLine as Program;
    // @ts-ignore
    vault = anchor.workspace.CollateralVault as Program;
    // @ts-ignore
    recv = anchor.workspace.Receivables as Program;
    // @ts-ignore
    pool = anchor.workspace.AdvancePool as Program;
  });

  it("init configs + open credit account + set limit + charge", async () => {
    const admin = wallet.payer;

    // --- init credit config
    const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("credit_config")],
      credit.programId
    );

    await credit.methods.initConfig({
      minHfBpsForNewCharges: 12000,
      minHfBpsForWithdraw: 13000,
      penaltyRateBpsDaily: 15,
      lateFeeBps: 200,
      graceVolatileDays: 15,
      graceAnyDays: 30
    }).accounts({
      admin: wallet.publicKey,
      config: configPda,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc();

    // --- open credit account
    const [creditAcctPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("credit"), wallet.publicKey.toBuffer()],
      credit.programId
    );

    await credit.methods.openAccount().accounts({
      owner: wallet.publicKey,
      creditAccount: creditAcctPda,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc();

    // --- set limit
    await credit.methods.setLimit(new anchor.BN(1_000_000)) // 1,000,000 micro-USDC = 1,000 USDC
      .accounts({
        admin: wallet.publicKey,
        config: configPda,
        creditAccount: creditAcctPda,
        owner: wallet.publicKey
      })
      .rpc();

    // --- charge (3x)
    const orderId = Buffer.alloc(32);
    orderId.write("order-001");
    await credit.methods.charge(new anchor.BN(300_000), 3, Array.from(orderId))
      .accounts({
        creditAccount: creditAcctPda,
        config: configPda
      })
      .rpc();
  });

  it("mint one receivable note and advance to pool", async () => {
    const payer = wallet.publicKey;
    const merchant = wallet.publicKey; // usando o próprio wallet como merchant para teste
    const buyer = wallet.publicKey;

    const orderId = Buffer.alloc(32);
    orderId.write("order-001");
    const index = 0;
    const dueTs = Math.floor(Date.now()/1000) + 86400; // +1 dia

    const [notePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("note"), orderId, Buffer.from([index])],
      recv.programId
    );

    await recv.methods.mintNote(
      new anchor.BN(100_000), // 100 USDC
      new anchor.BN(dueTs),
      Array.from(orderId),
      index
    ).accounts({
      payer,
      merchant,
      buyer,
      noteState: notePda,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc();

    // init pool
    const [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), payer.toBuffer()],
      pool.programId
    );
    await pool.methods.initPool().accounts({
      admin: payer,
      pool: poolPda,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc();

    // advance (cede nota ao pool)
    await pool.methods.advance().accounts({
      pool: poolPda,
      admin: payer,
      noteState: notePda
    }).rpc();

    // pegar a conta da nota e checar beneficiary == pool
    const noteAfter = await recv.account.noteState.fetch(notePda);
    expect((noteAfter as any).beneficiary.toBase58()).eq(poolPda.toBase58());
  });
});
