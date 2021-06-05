package lahtinen.games.retro_crawl.controller

import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.util.Utils

// TODO: Is this class even needed or should it just move up?
class EventController(private val gameState: GameState) {
    private val fightController = FightController(gameState)
    private val itemDropController = ItemDropController()

    fun move() {
        fightMonster()
        //dropItem();
    }

    fun fight() {
        fightController.fight()
    }

    fun attemptFlee() {
        // TODO: Base flee chance by character stats vs monster
        // TODO: Move flee logic into FightController
        if (rollOnSpeedAttribute()) {
            ActionLogController.INSTANCE.log("You escaped successfully!")
            fightController.flee()
            gameState.state = State.MAP
        } else {
            ActionLogController.INSTANCE.log("You failed to escape!")
            fightController.fight()
        }
    }

    private fun rollOnSpeedAttribute() =
        Utils.RANDOM.nextInt(10) <
                gameState.player.characterAttributes.speed + minOf(1, (5 - gameState.level))

    private fun fightMonster() {
        if (Utils.RANDOM.nextInt(10) == 1) {
            gameState.state = State.FIGHT
            fightController.fight()
        }
    }

    private fun dropItem() {
        if (Utils.RANDOM.nextInt(15) == 1) {
            itemDropController.drop()
        }
    }
}
