package dev.interview.javalanguage.m04.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GrantsTest {

    @Test
    @DisplayName("M04 §5 · grants allow an action only when every required permission is granted")
    void allows_requiresEveryPermission() {
        Grants editor = Grants.of(List.of(Permission.READ, Permission.WRITE));

        assertThat(editor.allows(Set.of(Permission.READ))).isTrue();
        assertThat(editor.allows(Set.of(Permission.READ, Permission.WRITE))).isTrue();
        assertThat(editor.allows(Set.of(Permission.WRITE, Permission.DELETE))).isFalse();
    }

    @Test
    @DisplayName("M04 §5 · missing permissions are reported in declaration order")
    void missing_listsAbsentPermissionsInDeclarationOrder() {
        Grants reader = Grants.of(List.of(Permission.READ));

        assertThat(reader.missing(Set.of(Permission.ADMIN, Permission.WRITE, Permission.READ)))
                .containsExactly(Permission.WRITE, Permission.ADMIN);
    }

    @Test
    @DisplayName("M04 §5 · no permissions is a valid grant, not an EnumSet.copyOf error")
    void of_acceptsEmptyCollection() {
        Grants nobody = Grants.of(List.of());

        assertThat(nobody.allows(Set.of())).isTrue();
        assertThat(nobody.allows(Set.of(Permission.READ))).isFalse();
    }

    @Test
    @DisplayName("M04 §5 · the granted set cannot be changed through its accessor")
    void granted_isUnmodifiable() {
        Grants editor = Grants.of(List.of(Permission.READ, Permission.WRITE));

        assertThatThrownBy(() -> editor.granted().add(Permission.ADMIN))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThat(editor.granted()).containsExactly(Permission.READ, Permission.WRITE);
    }
}
