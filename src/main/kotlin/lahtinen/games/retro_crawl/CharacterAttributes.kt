package lahtinen.games.retro_crawl

class CharacterAttributes(
    var name: String,
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
        fun newCharacter() = CharacterAttributes("Joe Dohn", 5, 3, 2)
    }
}
