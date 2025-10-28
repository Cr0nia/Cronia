use anchor_lang::prelude::*;

declare_id!("8zKbc5hProPy7xB2M5iDKABCLhcb68ezdyAixiC7NcDe");

#[program]
pub mod advance_pool {
    use super::*;

    pub fn init_pool(ctx: Context<InitPool>) -> Result<()> {
        let p = &mut ctx.accounts.pool;
        p.usdc_vault = Pubkey::default();
        p.guarantee_reserve_usdc = 0;
        p.admin = ctx.accounts.admin.key();
        p.bump = ctx.bumps.pool;
        Ok(())
    }

    pub fn advance(ctx: Context<Advance>) -> Result<()> {
        // Em MVP, só troca beneficiário via semântica off-chain
        emit!(Advanced { note: ctx.accounts.note_state.key(), gross: ctx.accounts.note_state.amount_usdc, discount: 0, net: ctx.accounts.note_state.amount_usdc });
        // Atualiza beneficiário para o pool (requere admin para bypass da assinatura do merchant)
        ctx.accounts.note_state.beneficiary = ctx.accounts.pool.key();
        Ok(())
    }

    pub fn guarantee_settle(ctx: Context<GuaranteeSettle>) -> Result<()> {
        // Em MVP, só evento; produção: debit da reserva e pagamento ao merchant
        emit!(GuaranteeSettled { note: ctx.accounts.note_state.key(), amount: ctx.accounts.note_state.amount_usdc });
        // Beneficiário já deve ser o pool; se não, assumir
        ctx.accounts.note_state.beneficiary = ctx.accounts.pool.key();
        Ok(())
    }

    pub fn replenish_reserve(ctx: Context<ReplenishReserve>, amount: u64) -> Result<()> {
        let p = &mut ctx.accounts.pool;
        require!(ctx.accounts.admin.key() == p.admin, PoolError::Unauthorized);
        p.guarantee_reserve_usdc = p.guarantee_reserve_usdc.saturating_add(amount);
        emit!(ReserveReplenished { amount });
        Ok(())
    }
}

#[account]
pub struct Pool {
    pub usdc_vault: Pubkey,
    pub guarantee_reserve_usdc: u64,
    pub admin: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<Pool>(),
        seeds = [b"pool", admin.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Advance<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    /// CHECK: admin must sign to force beneficiary change
    pub admin: Signer<'info>,
    #[account(mut)]
    pub note_state: Account<'info, crate::receivables_stub::NoteState>,
}

#[derive(Accounts)]
pub struct GuaranteeSettle<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    /// CHECK: admin must sign to force beneficiary change
    pub admin: Signer<'info>,
    #[account(mut)]
    pub note_state: Account<'info, crate::receivables_stub::NoteState>,
}

#[derive(Accounts)]
pub struct ReplenishReserve<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
}

#[event]
pub struct Advanced {
    pub note: Pubkey,
    pub gross: u64,
    pub discount: u64,
    pub net: u64,
}

#[event]
pub struct GuaranteeSettled {
    pub note: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ReserveReplenished {
    pub amount: u64,
}

#[error_code]
pub enum PoolError {
    #[msg("Insufficient reserve")]
    InsufficientReserve,
    #[msg("Unauthorized")]
    Unauthorized,
}

// ------- Minimal stub to reuse NoteState layout without CPI cross-crate -------
pub mod receivables_stub {
    use super::*;
    #[account]
    pub struct NoteState {
        pub note_id: Pubkey,
        pub merchant: Pubkey,
        pub beneficiary: Pubkey,
        pub buyer: Pubkey,
        pub amount_usdc: u64,
        pub due_ts: i64,
        pub status: u8,
        pub order_id: [u8; 32],
        pub bump: u8,
    }
}
