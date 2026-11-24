package dev.interview.javalanguage.m06.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RateCardsTest {

    private static final RateCard LAST_KNOWN_GOOD = new RateCard("eur", Map.of("USD", new BigDecimal("1.08")));

    @Test
    @DisplayName("M06 §1 · a readable rate card is parsed")
    void current_returnsParsedCard_whenSourceIsReadable() {
        RateCards cards = new RateCards(new RateCardLoader(name -> "USD = 1.10\n\nGBP=0.85\n"), LAST_KNOWN_GOOD);

        RateCard card = cards.current("eur");

        assertThat(card.rates())
                .containsExactlyInAnyOrderEntriesOf(
                        Map.of("USD", new BigDecimal("1.10"), "GBP", new BigDecimal("0.85")));
    }

    @Test
    @DisplayName("M06 §1 · the loader declares the checked IOException and the caller that can recover handles it")
    void current_fallsBack_whenSourceThrowsCheckedException() {
        RateSource broken = name -> {
            throw new IOException("share unreachable");
        };

        Throwable fromLoader = catchThrowable(() -> new RateCardLoader(broken).load("eur"));
        RateCard fromCards = new RateCards(new RateCardLoader(broken), LAST_KNOWN_GOOD).current("eur");

        assertThat(fromLoader).isInstanceOf(IOException.class).hasMessage("share unreachable");
        assertThat(fromCards).isSameAs(LAST_KNOWN_GOOD);
    }

    @Test
    @DisplayName("M06 §1 · an unchecked exception propagates through methods that do not declare it")
    void current_propagatesUncheckedException_forCallerBug() {
        RateCards cards = new RateCards(new RateCardLoader(name -> "USD=1.10"), LAST_KNOWN_GOOD);

        Throwable thrown = catchThrowable(() -> cards.current(" "));

        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessage("rate card name is blank");
    }

    @Test
    @DisplayName("M06 §1 · a malformed file is not mistaken for a storage failure")
    void current_propagatesUncheckedException_forMalformedFile() {
        RateCards cards = new RateCards(new RateCardLoader(name -> "USD 1.10"), LAST_KNOWN_GOOD);

        Throwable thrown = catchThrowable(() -> cards.current("eur"));

        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessage("not a CODE=rate line: USD 1.10");
    }
}
