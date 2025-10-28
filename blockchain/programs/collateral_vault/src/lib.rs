use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        Mint, TokenAccount, TokenInterface as Token, /* Program para SPL Token (ou Token-2022) */
    },
};

declare_id!("6UB2YQb1VN5fT99vVKX8LQ2YGnSQAALguPdikQtEpjaY");

/* =======================================================================================
   ACCOUNT TYPES
   ======================================================================================= */

#[account]
pub struct VaultConfig {
    pub admin: Pubkey,
    pub bump: u8,
    // adicione outros parâmetros globais se quiser
}
impl VaultConfig {
    pub const SIZE: usize = 32 + 1;
}

#[account]
pub struct Vault {
    pub mint: Pubkey, // mint do ativo aceito neste cofre
    pub bump: u8,
    // se quiser: pointer p/ ATA do PDA (opcional se usar derive ATA on the fly)
}
impl Vault {
    pub const SIZE: usize = 32 + 1;
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
impl Position {
    pub const SIZE: usize = 32 + 32 + 8 + 4 + 8 + 1;
}

/* --- Estruturas simples para a parte "pump" (parametrização local) --- */

#[account]
pub struct PumpClass {
    pub admin: Pubkey,
    pub bump: u8,
    // coloque aqui parâmetros globais de classe se quiser
}
impl PumpClass {
    pub const SIZE: usize = 32 + 1;
}

#[account]
pub struct PumpToken {
    pub mint: Pubkey,
    pub class: Pubkey,
    pub bump: u8,
    // parâmetros por token (ex.: flags, whitelist, etc.)
}
impl PumpToken {
    pub const SIZE: usize = 32 + 32 + 1;
}

#[account]
pub struct PriceAccount {
    pub mint: Pubkey,
    pub price_usdc_6: u64,
    pub last_ts: i64,
    pub bump: u8,
}
impl PriceAccount {
    pub const SIZE: usize = 32 + 8 + 8 + 1;
}

#[derive(Accounts)]
pub struct InitVaultConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + VaultConfig::SIZE,
        seeds = [b"vault_cfg"],
        bump
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitVaultForMint<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Vault::SIZE,
        seeds = [b"vault", mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPumpClassParams<'info> {
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + PumpClass::SIZE,
        seeds = [b"pump_class"],
        bump
    )]
    pub pump_class: Account<'info, PumpClass>,

    #[account(
        mut,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPumpTokenParams<'info> {
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + PumpToken::SIZE,
        seeds = [b"pump_token", mint.key().as_ref()],
        bump
    )]
    pub pump_token: Account<'info, PumpToken>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"pump_class"],
        bump = pump_class.bump
    )]
    pub pump_class: Account<'info, PumpClass>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPrice<'info> {
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + PriceAccount::SIZE,
        seeds = [b"price", mint.key().as_ref()],
        bump
    )]
    pub price_account: Account<'info, PriceAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenPositionPump<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Position::SIZE,
        seeds = [b"pos", owner.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
}

/* --- (Opcional) Depósito e Saque em ATA do PDA do Vault --- */

#[derive(Accounts)]
pub struct DepositPump<'info> {
    #[account(
        seeds = [b"vault_cfg"],
        bump = vault_config.bump
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        mut,
        seeds = [b"vault", mint.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub mint: InterfaceAccount<'info, Mint>,

    /// ATA do dono (fonte)
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
        associated_token::token_program = token_program
    )]
    pub owner_ata: InterfaceAccount<'info, TokenAccount>,

    /// ATA do PDA do vault (destino)
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vault,
        associated_token::token_program = token_program
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawPump<'info> {
    #[account(
        seeds = [b"vault_cfg"],
        bump = vault_config.bump
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        mut,
        seeds = [b"vault", mint.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub mint: InterfaceAccount<'info, Mint>,

    /// ATA do PDA do vault (fonte)
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vault,
        associated_token::token_program = token_program
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,

    /// ATA do dono (destino)
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
        associated_token::token_program = token_program
    )]
    pub owner_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, Token>,
    pub system_program: Program<'info, System>,
}

/* =======================================================================================
   PROGRAM
   ======================================================================================= */

#[program]
pub mod collateral_vault {
    use super::*;
    use anchor_spl::token_interface as spl_token;

    pub fn init_vault_config(ctx: Context<InitVaultConfig>) -> Result<()> {
        let cfg = &mut ctx.accounts.vault_config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.bump = ctx.bumps.vault_config; // sem get()
        Ok(())
    }

    pub fn init_vault_for_mint(ctx: Context<InitVaultForMint>) -> Result<()> {
        let v = &mut ctx.accounts.vault;
        v.mint = ctx.accounts.mint.key();
        v.bump = ctx.bumps.vault;
        Ok(())
    }

    /* ----- Parametrização “pump” local ----- */

    pub fn set_pump_class_params(ctx: Context<SetPumpClassParams>) -> Result<()> {
        // Você pode validar admin aqui se não usar has_one
        require_keys_eq!(ctx.accounts.vault_config.admin, ctx.accounts.admin.key(), ErrorCode::Unauthorized);

        let p = &mut ctx.accounts.pump_class;
        p.admin = ctx.accounts.admin.key();
        p.bump = ctx.bumps.pump_class;
        Ok(())
    }

    pub fn set_pump_token_params(ctx: Context<SetPumpTokenParams>) -> Result<()> {
        let t = &mut ctx.accounts.pump_token;
        t.mint = ctx.accounts.mint.key();
        t.class = ctx.accounts.pump_class.key();
        t.bump = ctx.bumps.pump_token;
        Ok(())
    }

    pub fn set_price(ctx: Context<SetPrice>, price_usdc_6: u64, ts: i64) -> Result<()> {
        let pa = &mut ctx.accounts.price_account;
        pa.mint = ctx.accounts.mint.key();
        pa.price_usdc_6 = price_usdc_6;
        pa.last_ts = ts;
        pa.bump = ctx.bumps.price_account;
        Ok(())
    }

    pub fn open_position_pump(ctx: Context<OpenPositionPump>) -> Result<()> {
        let pos = &mut ctx.accounts.position;
        pos.owner = ctx.accounts.owner.key();
        pos.mint  = ctx.accounts.mint.key();
        pos.amount = 0;
        pos.ltv_bps = 0;
        pos.valuation_usdc = 0;
        pos.bump = ctx.bumps.position;
        Ok(())
    }

    /* ----- Fluxos simples de depósito/saque ----- */

    pub fn deposit_pump(ctx: Context<DepositPump>, amount: u64) -> Result<()> {
        // owner transfere do seu ATA para o ATA do PDA Vault
        let cpi_accounts = spl_token::TransferChecked {
            from: ctx.accounts.owner_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.vault_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        // decimals do mint: usa leitura do account (via interface)
        let decimals = ctx.accounts.mint.decimals;
        spl_token::transfer_checked(cpi_ctx, amount, decimals)?;
        Ok(())
    }

    pub fn withdraw_pump(ctx: Context<WithdrawPump>, amount: u64) -> Result<()> {
        // vault (PDA) transfere do seu ATA para o ATA do owner — precisa de signer seeds
        let vault_key = ctx.accounts.vault.key();
        let bump = ctx.accounts.vault.bump;
        let mint_key = ctx.accounts.mint.key();

        let seeds: &[&[u8]] = &[
            b"vault",
            mint_key.as_ref(),
            &[bump],
        ];
        let signer = &[seeds];

        let cpi_accounts = spl_token::TransferChecked {
            from: ctx.accounts.vault_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.owner_ata.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        let decimals = ctx.accounts.mint.decimals;
        spl_token::transfer_checked(cpi_ctx, amount, decimals)?;
        Ok(())
    }
}

/* =======================================================================================
   ERRORS
   ======================================================================================= */

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
