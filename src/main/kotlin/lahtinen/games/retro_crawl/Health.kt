package lahtinen.games.retro_crawl


class Health(private val baseHealth: Int) {
    private var health: Int = baseHealth

    fun restoreHealth(healthToAdd: Int) {
        if (health + healthToAdd >= baseHealth) {
            health = baseHealth
        }
        health += healthToAdd
    }

    fun drainHealth(healthToDrain: Int) {
        health -= healthToDrain
    }

    fun dead(): Boolean = health <= 0
}
