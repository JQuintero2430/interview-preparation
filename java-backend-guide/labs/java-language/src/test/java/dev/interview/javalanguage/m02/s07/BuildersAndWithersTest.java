package dev.interview.javalanguage.m02.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §7: a hand-written builder for an immutable class and wither methods on a record, pinned as executable facts. */
class BuildersAndWithersTest {

    private static final String RECIPIENT = "ana@example.com";
    private static final String SUBJECT = "Welcome";
    private static final String TAG = "urgent";
    private static final String OTHER_TAG = "late";
    private static final String EMPTY = "";
    private static final String MISSING_FIELD = "recipient";
    private static final String TICKET_ID = "T-1";
    private static final String ASSIGNEE = "bob";
    private static final String OTHER_ASSIGNEE = "carla";
    private static final String TAG_FIELD = "tag";
    private static final String ID_FIELD = "id";
    private static final int HIGH_PRIORITY = 1;

    @Test
    @DisplayName("M02 §7 · builder rejects a missing required field")
    void build_throwsIllegalStateException_whenRecipientMissing() {
        Notification.Builder builder = Notification.builder();

        assertThatThrownBy(builder::build)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining(MISSING_FIELD);
    }

    @Test
    @DisplayName("M02 §7 · builder output is unaffected by later builder calls")
    void build_leavesFirstProductUnchanged_whenBuilderIsReusedAfterwards() {
        Notification.Builder builder =
                Notification.builder().recipient(RECIPIENT).tag(TAG);
        Notification first = builder.build();

        builder.tag(OTHER_TAG).subject(SUBJECT);
        Notification second = builder.build();

        assertThat(first.tags()).containsExactly(TAG);
        assertThat(first.subject()).isEqualTo(EMPTY);
        assertThat(second.tags()).containsExactly(TAG, OTHER_TAG);
        assertThat(second.subject()).isEqualTo(SUBJECT);
        assertThatThrownBy(() -> first.tags().add(OTHER_TAG)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M02 §7 · builder applies defaults to optional fields")
    void build_appliesDefaults_whenOnlyRecipientIsSet() {
        Notification notification = Notification.builder().recipient(RECIPIENT).build();

        assertThat(notification.recipient()).isEqualTo(RECIPIENT);
        assertThat(notification.subject()).isEqualTo(EMPTY);
        assertThat(notification.priority()).isEqualTo(Notification.DEFAULT_PRIORITY);
        assertThat(notification.tags()).isEmpty();
    }

    @Test
    @DisplayName("M02 §7 · builder rejects a null tag")
    void tag_throwsNullPointerException_whenTagIsNull() {
        Notification.Builder builder = Notification.builder();

        assertThatThrownBy(() -> builder.tag(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage(TAG_FIELD);
    }

    @Test
    @DisplayName("M02 §7 · wither returns a new record and leaves the original unchanged")
    void withStatus_returnsNewInstance_whenStatusChanges() {
        Ticket original = new Ticket(TICKET_ID, Ticket.Status.OPEN, ASSIGNEE);

        Ticket copy = original.withStatus(Ticket.Status.IN_PROGRESS);

        assertThat(copy).isNotSameAs(original);
        assertThat(original.status()).isEqualTo(Ticket.Status.OPEN);
        assertThat(copy.status()).isEqualTo(Ticket.Status.IN_PROGRESS);
        assertThat(copy.id()).isEqualTo(original.id());
        assertThat(copy.assignee()).isEqualTo(original.assignee());
    }

    @Test
    @DisplayName("M02 §7 · a wither goes through the canonical constructor, so its checks run")
    void withStatus_throwsNullPointerException_whenStatusIsNull() {
        Ticket original = new Ticket(TICKET_ID, Ticket.Status.OPEN, ASSIGNEE);

        assertThatThrownBy(() -> original.withStatus(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M02 §7 · withAssignee replaces only the assignee")
    void withAssignee_returnsCopyWithNewAssignee_whenAssigneeChanges() {
        Ticket original = new Ticket(TICKET_ID, Ticket.Status.OPEN, ASSIGNEE);

        Ticket copy = original.withAssignee(OTHER_ASSIGNEE);

        assertThat(copy).isEqualTo(new Ticket(TICKET_ID, Ticket.Status.OPEN, OTHER_ASSIGNEE));
        assertThat(original.assignee()).isEqualTo(ASSIGNEE);
    }

    @Test
    @DisplayName("M02 §7 · an unassigned ticket has a null assignee")
    void constructor_acceptsNullAssignee_whenTicketIsUnassigned() {
        Ticket ticket = new Ticket(TICKET_ID, Ticket.Status.OPEN, null);

        assertThat(ticket.assignee()).isNull();
    }

    @Test
    @DisplayName("M02 §7 · builder overrides the default priority")
    void build_usesGivenPriority_whenPriorityIsSet() {
        Notification notification = Notification.builder()
                .recipient(RECIPIENT)
                .priority(HIGH_PRIORITY)
                .build();

        assertThat(notification.priority()).isEqualTo(HIGH_PRIORITY);
    }

    @Test
    @DisplayName("M02 §7 · the compact constructor rejects a null id")
    void constructor_throwsNullPointerException_whenIdIsNull() {
        assertThatThrownBy(() -> new Ticket(null, Ticket.Status.OPEN, ASSIGNEE))
                .isInstanceOf(NullPointerException.class)
                .hasMessage(ID_FIELD);
    }
}
