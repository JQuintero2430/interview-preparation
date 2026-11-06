package dev.interview.javalanguage.m01.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 01 §6: the wallet's operations keep its invariant (balance never negative) whatever the caller does.
class WalletTest {

    @Test
    @DisplayName("M01 §6 · deposit then withdraw updates the balance")
    void depositThenWithdraw_updatesTheBalance() {
        var wallet = new Wallet();

        wallet.deposit(500);
        wallet.withdraw(200);

        assertThat(wallet.balance()).isEqualTo(300);
    }

    @Test
    @DisplayName("M01 §6 · withdrawing exactly the balance leaves zero")
    void withdrawExactBalance_leavesZero() {
        var wallet = new Wallet();
        wallet.deposit(100);

        wallet.withdraw(100);

        assertThat(wallet.balance()).isZero();
    }

    @Test
    @DisplayName("M01 §6 · an overdraft is rejected and the balance is unchanged")
    void overdraft_isRejected_andBalanceUnchanged() {
        var wallet = new Wallet();
        wallet.deposit(100);

        assertThatThrownBy(() -> wallet.withdraw(101))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("insufficient funds");
        assertThat(wallet.balance()).isEqualTo(100);
    }

    @Test
    @DisplayName("M01 §6 · a zero or negative amount is rejected")
    void nonPositiveAmount_isRejected() {
        var wallet = new Wallet();

        assertThatThrownBy(() -> wallet.deposit(0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("amount must be positive");
        assertThatThrownBy(() -> wallet.withdraw(-1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("amount must be positive");
        assertThat(wallet.balance()).isZero();
    }

    @Test
    @DisplayName("M01 §6 · a deposit that would overflow is rejected and the balance is unchanged")
    void overflowingDeposit_isRejected_andBalanceUnchanged() {
        var wallet = new Wallet();
        wallet.deposit(Long.MAX_VALUE);

        assertThatThrownBy(() -> wallet.deposit(1)).isInstanceOf(ArithmeticException.class);
        assertThat(wallet.balance()).isEqualTo(Long.MAX_VALUE);
    }
}
