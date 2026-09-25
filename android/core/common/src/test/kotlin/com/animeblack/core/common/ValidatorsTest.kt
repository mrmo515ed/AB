package com.animeblack.core.common

import com.animeblack.core.common.util.Validators
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ValidatorsTest {
    @Test
    fun normalizesUsernamesLikeTheWeb() {
        assertThat(Validators.normalizeUsername("@Otaku.King!")).isEqualTo("otaku.king")
        assertThat(Validators.isValidUsername("ab")).isFalse()
        assertThat(Validators.isValidUsername("otaku_1")).isTrue()
        assertThat(Validators.isValidUsername("Upper")).isFalse()
    }

    @Test
    fun extractsDistinctMentionsIncludingArabic() {
        assertThat(Validators.extractMentions("hi @Luffy and @زورو then @luffy")).containsExactly("luffy", "زورو").inOrder()
        assertThat(Validators.extractHashtags("#OnePiece #ون_بيس #OnePiece")).containsExactly("OnePiece", "ون_بيس").inOrder()
    }

    @Test
    fun validatesEmailsAndPasswords() {
        assertThat(Validators.isValidEmail(" user@example.com ")).isTrue()
        assertThat(Validators.isValidEmail("user@example")).isFalse()
        assertThat(Validators.isValidPassword("12345")).isFalse()
        assertThat(Validators.isStrongPassword("anime2026")).isTrue()
    }

    @Test
    fun defaultUsernameMatchesWebDerivation() {
        assertThat(Validators.defaultUsername("John.Doe@x.com", "uid123")).isEqualTo("john.doe")
        assertThat(Validators.defaultUsername("!!!@x.com", "abcdef9")).isEqualTo("otaku_abcde")
    }
}
