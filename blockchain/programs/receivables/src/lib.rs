use anchor_lang::prelude::*;

declare_id!("89YkmHwfwtzEAoARKQ3m3QhLaYuJiBrKzYZrbZ6B8DGc"); 

#[program]
pub mod receivables {
    use super::*;

    /// Emite UMA nota (parcela). Você chamará N vezes para N parcelas.
    pub fn mint_note(
        ctx: Context<MintNote>,
        order_id: [u8; 32],
        index: u8,
        buyer: Pubkey,
        merchant: Pubkey,
        amount_usdc: u64,
        due_ts: i64,
    ) -> Result<()> {
        // Capture a key antes do borrow mutável para evitar E0502
        let note_key = ctx.accounts.note_state.key();

        let state = &mut ctx.accounts.note_state;
        state.note_id = note_key;
        state.merchant = merchant;
        state.beneficiary = merchant; // por padrão, o lojista é o beneficiário
        state.buyer = buyer;
        state.amount_usdc = amount_usdc;
        state.due_ts = due_ts;
        state.status = 0; // issued
        state.order_id = order_id;
        state.bump = ctx.bumps.note_state;

        emit!(NoteIssued {
            note: note_key,
            buyer,
            merchant,
            amount_usdc,
            due_ts,
            index,
        });

        Ok(())
    }

    // stubs para futuras alterações de estado
    pub fn mark_paid(_ctx: Context<MarkPaid>) -> Result<()> {
        Ok(())
    }

    pub fn assign_beneficiary(_ctx: Context<AssignBeneficiary>, _new_beneficiary: Pubkey) -> Result<()> {
        Ok(())
    }
}

#[account]
pub struct NoteState {
    pub note_id: Pubkey,
    pub merchant: Pubkey,
    pub beneficiary: Pubkey,
    pub buyer: Pubkey,
    pub amount_usdc: u64,
    pub due_ts: i64,
    pub status: u8,          // 0=issued,1=advanced,2=due_upcoming,3=due_today,4=paid,5=past_due,6=defaulted,7=settled
    pub order_id: [u8; 32],  // **32 bytes** padronizado
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(order_id: [u8; 32], index: u8)]
pub struct MintNote<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + std::mem::size_of::<NoteState>(),
        // Seeds: prefixo fixo + order_id (32 bytes) + byte do índice (u8)
        seeds = [b"note", order_id.as_ref(), &[index]],
        bump
    )]
    pub note_state: Account<'info, NoteState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkPaid<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub note_state: Account<'info, NoteState>,
}

#[derive(Accounts)]
pub struct AssignBeneficiary<'info> {
    #[account(mut)]
    pub admin_or_owner: Signer<'info>,
    #[account(mut)]
    pub note_state: Account<'info, NoteState>,
}

#[event]
pub struct NoteIssued {
    pub note: Pubkey,
    pub buyer: Pubkey,
    pub merchant: Pubkey,
    pub amount_usdc: u64,
    pub due_ts: i64,
    pub index: u8,
}
