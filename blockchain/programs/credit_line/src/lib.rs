use anchor_lang::prelude::*;

declare_id!("2DgViSNpi9CLMHjLmzqJGHvTGMjZXo97pMufmXJuqAQs");

#[program]
pub mod credit_line {
    use super::*;

    pub fn init_config(ctx: Context<InitConfig>, params: ConfigParams) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.min_hf_bps_for_new_charges = params.min_hf_bps_for_new_charges;
        cfg.min_hf_bps_for_withdraw = params.min_hf_bps_for_withdraw;
        cfg.penalty_rate_bps_daily = params.penalty_rate_bps_daily;
        cfg.late_fee_bps = params.late_fee_bps;
        cfg.grace_volatile_days = params.grace_volatile_days;
        cfg.grace_any_days = params.grace_any_days;
        cfg.admin = ctx.accounts.admin.key();
        cfg.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn open_account(ctx: Context<OpenAccount>) -> Result<()> {
        let acct = &mut ctx.accounts.credit_account;
        acct.owner = ctx.accounts.owner.key();
        acct.limit_usdc = 0;
        acct.used_usdc = 0;
        acct.health_factor_bps = 12000; // 1.20
        acct.score = 0;
        acct.billing_cycle_day = 5;
        acct.status = AccountStatus::Active as u8;
        acct.bump = ctx.bumps.credit_account;
        Ok(())
    }

    pub fn set_limit(ctx: Context<SetLimit>, new_limit_usdc: u64) -> Result<()> {
        let acct = &mut ctx.accounts.credit_account;
        require!(
            ctx.accounts.admin.key() == ctx.accounts.config.admin,
            CreditError::Unauthorized
        );
        require!(acct.used_usdc <= new_limit_usdc, CreditError::UsedExceedsNewLimit);
        acct.limit_usdc = new_limit_usdc;
        Ok(())
    }

    pub fn charge(
        ctx: Context<Charge>,
        amount_usdc: u64,
        installments: u8,
        order_id: [u8; 32],
    ) -> Result<()> {
        let acct = &mut ctx.accounts.credit_account;
        let cfg = &ctx.accounts.config;

        require!(acct.status == AccountStatus::Active as u8, CreditError::AccountFrozen);
        let available = acct.limit_usdc.saturating_sub(acct.used_usdc);
        require!(available >= amount_usdc, CreditError::InsufficientLimit);
        require!(acct.health_factor_bps >= cfg.min_hf_bps_for_new_charges, CreditError::HfTooLow);
        require!(installments > 0, CreditError::InstallmentsNotAllowed);

        // Contábil
        acct.used_usdc = acct.used_usdc.saturating_add(amount_usdc);

        // Evento: indexador off-chain observará e criará as N notas chamando receivables::mint_note
        emit!(ChargeAuthorized {
            owner: acct.owner,
            amount_usdc,
            installments,
            order_id
        });
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, amount_usdc: u64) -> Result<()> {
        let acct = &mut ctx.accounts.credit_account;
        acct.used_usdc = acct.used_usdc.saturating_sub(amount_usdc);
        if acct.status == AccountStatus::SoftFrozen as u8 && acct.used_usdc == 0 {
            acct.status = AccountStatus::Active as u8;
        }
        emit!(PaymentPosted { owner: acct.owner, amount_usdc });
        Ok(())
    }

    pub fn statement_close(ctx: Context<StatementClose>, cycle_id: [u8; 8]) -> Result<()> {
        let acct = &ctx.accounts.credit_account;
        emit!(StatementClosed {
            owner: acct.owner,
            cycle_id,
            total_due_usdc: 0,
            min_payment_usdc: 0,
            due_date_ts: 0
        });
        Ok(())
    }

    pub fn soft_freeze(ctx: Context<Freeze>) -> Result<()> {
        ctx.accounts.credit_account.status = AccountStatus::SoftFrozen as u8;
        Ok(())
    }

    pub fn hard_freeze(ctx: Context<Freeze>) -> Result<()> {
        ctx.accounts.credit_account.status = AccountStatus::HardFrozen as u8;
        Ok(())
    }
}

// ---------------- Accounts ----------------
#[account]
pub struct CreditAccount {
    pub owner: Pubkey,
    pub limit_usdc: u64,
    pub used_usdc: u64,
    pub health_factor_bps: u32,
    pub score: u16,
    pub billing_cycle_day: u8,
    pub status: u8,
    pub bump: u8,
}

#[account]
pub struct Config {
    pub min_hf_bps_for_new_charges: u32,
    pub min_hf_bps_for_withdraw: u32,
    pub penalty_rate_bps_daily: u32,
    pub late_fee_bps: u32,
    pub grace_volatile_days: u8,
    pub grace_any_days: u8,
    pub admin: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ConfigParams {
    pub min_hf_bps_for_new_charges: u32,
    pub min_hf_bps_for_withdraw: u32,
    pub penalty_rate_bps_daily: u32,
    pub late_fee_bps: u32,
    pub grace_volatile_days: u8,
    pub grace_any_days: u8,
}

// ---------------- Contexts ----------------
#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<Config>(),
        seeds = [b"credit_config"],
        bump
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<CreditAccount>(),
        seeds = [b"credit", owner.key().as_ref()],
        bump
    )]
    pub credit_account: Account<'info, CreditAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetLimit<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    pub config: Account<'info, Config>,
    #[account(mut, has_one = owner)]
    pub credit_account: Account<'info, CreditAccount>,
    /// CHECK: only used for has_one check
    pub owner: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Charge<'info> {
    #[account(mut)]
    pub credit_account: Account<'info, CreditAccount>,
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub credit_account: Account<'info, CreditAccount>,
}

#[derive(Accounts)]
pub struct StatementClose<'info> {
    pub credit_account: Account<'info, CreditAccount>,
}

#[derive(Accounts)]
pub struct Freeze<'info> {
    #[account(mut)]
    pub credit_account: Account<'info, CreditAccount>,
}

// ---------------- Events ----------------
#[event]
pub struct ChargeAuthorized {
    pub owner: Pubkey,
    pub amount_usdc: u64,
    pub installments: u8,
    pub order_id: [u8; 32],
}

#[event]
pub struct StatementClosed {
    pub owner: Pubkey,
    pub cycle_id: [u8; 8],
    pub total_due_usdc: u64,
    pub min_payment_usdc: u64,
    pub due_date_ts: i64,
}

#[event]
pub struct PaymentPosted {
    pub owner: Pubkey,
    pub amount_usdc: u64,
}

// ---------------- Errors & Enums ----------------
#[error_code]
pub enum CreditError {
    #[msg("Insufficient limit")]
    InsufficientLimit,
    #[msg("Health factor too low")]
    HfTooLow,
    #[msg("Account is frozen")]
    AccountFrozen,
    #[msg("Installments not allowed")]
    InstallmentsNotAllowed,
    #[msg("Used exceeds new limit")]
    UsedExceedsNewLimit,
    #[msg("Unauthorized")]
    Unauthorized,
}

#[repr(u8)]
pub enum AccountStatus {
    Active = 0,
    SoftFrozen = 1,
    HardFrozen = 2,
}
