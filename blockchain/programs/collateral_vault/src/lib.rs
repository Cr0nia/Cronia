use anchor_lang::prelude::*;

declare_id!("eCqMvz2YpSLpDmczgbpEkeRhBCm3ivHpmp8NZELvhJb");

#[program]
pub mod collateral_vault {
    use super::*;

    pub fn init_vault_config(ctx: Context<InitVaultConfig>) -> Result<()> {
        let cfg = &mut ctx.accounts.vault_config;
        cfg.oracle_primary = Pubkey::default();
        cfg.oracle_fallback = Pubkey::default();
        cfg.slippage_bps_max = 100;
        cfg.admin = ctx.accounts.admin.key();
        cfg.bump = ctx.bumps.vault_config;
        Ok(())
    }

    /// Cria uma Position para (owner, mint) com amount=0.
    pub fn open_position(
        ctx: Context<OpenPosition>,
        mint: Pubkey,
        ltv_bps: u32,
        valuation_usdc: u64,
    ) -> Result<()> {
        let pos = &mut ctx.accounts.position;
        pos.owner = ctx.accounts.owner.key();
        pos.mint = mint;
        pos.amount = 0;
        pos.ltv_bps = ltv_bps;
        pos.valuation_usdc = valuation_usdc;
        pos.bump = ctx.bumps.position;

        emit!(PositionOpened {
            owner: pos.owner,
            mint,
            ltv_bps,
            valuation_usdc,
        });
        Ok(())
    }

    /// Deposita em uma Position já existente (não inicializa).
    pub fn deposit(
        ctx: Context<Deposit>,
        _mint: Pubkey, // usado apenas para seeds no Context
        amount: u64,
        new_valuation_usdc: Option<u64>,
        new_ltv_bps: Option<u32>,
    ) -> Result<()> {
        let pos = &mut ctx.accounts.position;
        require!(pos.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);

        pos.amount = pos.amount.saturating_add(amount);
        if let Some(v) = new_valuation_usdc {
            pos.valuation_usdc = v;
        }
        if let Some(l) = new_ltv_bps {
            pos.ltv_bps = l;
        }

        emit!(CollateralDeposited {
            owner: pos.owner,
            mint: pos.mint,
            amount
        });
        Ok(())
    }

    /// Saque parcial de uma Position já existente.
    pub fn withdraw(ctx: Context<Withdraw>, _mint: Pubkey, amount: u64) -> Result<()> {
        let pos = &mut ctx.accounts.position;
        require!(pos.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
        require!(pos.amount >= amount, VaultError::InsufficientAmount);

        pos.amount -= amount;

        emit!(CollateralWithdrawn {
            owner: pos.owner,
            mint: pos.mint,
            amount
        });
        Ok(())
    }

    /// Placeholder para futura liquidação parcial (swap + repay).
    pub fn liquidate_partial(_ctx: Context<LiquidatePartial>, _amount_target_usdc: u64) -> Result<()> {
        Ok(())
    }
}

#[account]
pub struct Position {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub ltv_bps: u32,
    pub valuation_usdc: u64,
    pub bump: u8,
}

#[account]
pub struct VaultConfig {
    pub oracle_primary: Pubkey,
    pub oracle_fallback: Pubkey,
    pub slippage_bps_max: u16,
    pub admin: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitVaultConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<VaultConfig>(),
        seeds = [b"vault_cfg"],
        bump
    )]
    pub vault_config: Account<'info, VaultConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(mint: Pubkey)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<Position>(),
        seeds = [b"pos", owner.key().as_ref(), mint.as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(mint: Pubkey)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        // Valida seeds usando o bump armazenado na própria conta
        seeds = [b"pos", owner.key().as_ref(), mint.as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, Position>,
}

#[derive(Accounts)]
#[instruction(mint: Pubkey)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        seeds = [b"pos", owner.key().as_ref(), mint.as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, Position>,
}

#[derive(Accounts)]
pub struct LiquidatePartial<'info> {
    /// Dummy para usar 'info e evitar warnings/erros de lifetime.
    pub system_program: Program<'info, System>,
}

#[event]
pub struct PositionOpened {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub ltv_bps: u32,
    pub valuation_usdc: u64,
}

#[event]
pub struct CollateralDeposited {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[event]
pub struct CollateralWithdrawn {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum VaultError {
    #[msg("HF too low for withdraw")]
    HfTooLowForWithdraw,
    #[msg("Oracle price is stale")]
    OracleStale,
    #[msg("Slippage would be exceeded")]
    SlippageExceeded,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Insufficient amount")]
    InsufficientAmount,
}
