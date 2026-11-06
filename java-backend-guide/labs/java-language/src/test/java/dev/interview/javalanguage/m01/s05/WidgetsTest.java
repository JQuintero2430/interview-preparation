package dev.interview.javalanguage.m01.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §5: a superclass constructor calling an overridable method, before and with Java 25 prologues.
class WidgetsTest {

    @Test
    @DisplayName("M01 §5 · overridable call from constructor sees default field value")
    void lateWidget_hookRunsBeforeTheSubclassFieldIsAssigned() {
        assertThat(new Widgets.LateWidget(250).label()).isEqualTo("widget@0");
    }

    @Test
    @DisplayName("M01 §5 · flexible constructor body sets the field before super()")
    void earlyWidget_hookSeesTheFieldAssignedInThePrologue() {
        assertThat(new Widgets.EarlyWidget(250).label()).isEqualTo("widget@250");
        assertThat(new Widgets.EarlyWidget().label()).isEqualTo("widget@0");
    }

    @Test
    @DisplayName("M01 §5 · prologue validation fails before super() runs")
    void earlyWidget_rejectsNegativeCents() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new Widgets.EarlyWidget(-1))
                .withMessage("cents must not be negative");
    }
}
