import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaProject } from "../target/types/solana_project";
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { SystemProgram } from '@solana/web3.js'
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { seed } from "@coral-xyz/anchor/dist/cjs/idl";
import { assert } from "chai";
import base58 from 'bs58'

describe("solana-project", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaProject as Program<SolanaProject>;

  it("Is initialized!", async () => {
    const keyPair = anchor.web3.Keypair.fromSecretKey(base58.decode('33mTydNDngerRqubz93P1SUF2CLMHb36ppb9PcXC5Z7XZDHiUjRn3eCx9eXVa2TKUzCv8sg8MKsy6wk7AHnM1Cex'))
    const [profilePda, profileBump] = findProgramAddressSync([utf8.encode('USER_STATE'), keyPair.publicKey.toBuffer()], program.programId)
    console.log(`Generated Seed ${profilePda.toString()}`)

    let profileAccount = null;

    try {
        profileAccount = await program.account.userProfile.fetch(profilePda);
    } catch (error) {
        // Handle the error if the account doesn't exist.
        console.log("No User Profile for this Account yet.");
        console.log("Generating User Profile: ", error);
    }

    if(!profileAccount){
      const tx = await program.methods
        .initializeUser()
        .accounts({
          authority: keyPair.publicKey,
          userProfile: profilePda,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .signers([keyPair])
        .rpc()
      console.log("Signature: ", tx)
      console.log("New User Profile Account created!")
      profileAccount = await program.account.userProfile.fetch(profilePda);  
    }
    assert.ok(profileAccount, "Account Initialized!")
  });
});
