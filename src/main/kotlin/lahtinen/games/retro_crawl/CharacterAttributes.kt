package lahtinen.games.retro_crawl

class CharacterAttributes(
    private val name: String,
    var maxHealth: Int,
    var strength: Int,
    var speed: Int
) {
    fun increaseMaxHealth(i: Int) {
        maxHealth += i
    }

    fun increaseStrength(i: Int) {
        strength += i
    }

    fun increaseSpeed(i: Int) {
        speed += i
    }

    companion object {
        var NEW_CHARACTER = CharacterAttributes("Mr. Guy", 5, 3, 2)
    }
}
