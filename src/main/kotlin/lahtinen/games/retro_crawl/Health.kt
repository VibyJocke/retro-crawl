package lahtinen.games.retro_crawl


class Health(private val characterAttributes: CharacterAttributes) {
    private var health: Int = characterAttributes.vitality

    fun restoreHealth(healthToAdd: Int) {
        if (health + healthToAdd >= characterAttributes.vitality) {
            health = characterAttributes.vitality
        }
        health += healthToAdd
    }

    fun drainHealth(healthToDrain: Int) {
        health -= healthToDrain
    }

    fun dead(): Boolean = health <= 0
}
