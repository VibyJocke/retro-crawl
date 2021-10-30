package lahtinen.games.retro_crawl

class CharacterAttributes(
    var name: String,
    var vitality: Int,
    var strength: Int,
    var speed: Int
) {
    fun increaseVitality(i: Int) {
        vitality += i
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
