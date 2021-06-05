package lahtinen.games.retro_crawl

class GameState(val player: Player, var level: Int, var state: State)

enum class State {
    MAP, FIGHT, DEAD
}
