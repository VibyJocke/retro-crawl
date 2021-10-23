package lahtinen.games.retro_crawl.controller

import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.events.PlayerEscaped
import lahtinen.games.retro_crawl.util.Utils
import org.greenrobot.eventbus.EventBus

// TODO: Is this class even needed or should it just move up?
class EventController(private val gameState: GameState) {
    private val eventBus = EventBus.getDefault()
    private val monsterEncounterChance = 0.1
    private val itemDropChance = 0.1
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
            eventBus.post(PlayerEscaped(true))
            fightController.flee()
            gameState.state = State.MAP
        } else {
            eventBus.post(PlayerEscaped(false))
            fightController.fight()
        }
    }

    private fun rollOnSpeedAttribute() =
        Utils.roll(
            (gameState.player.characterAttributes.speed + minOf(1, (5 - gameState.level))
                    ) / 10.0
        )

    private fun fightMonster() {
        if (Utils.roll(monsterEncounterChance)) {
            gameState.state = State.FIGHT
            fightController.fight()
        }
    }

    private fun dropItem() {
        if (Utils.roll(itemDropChance)) {
            itemDropController.drop()
        }
    }
}
