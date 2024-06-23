package lahtinen.games.retro_crawl.controller

import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.events.Fight
import lahtinen.games.retro_crawl.events.MonsterDied
import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.events.MonsterHit
import lahtinen.games.retro_crawl.events.Move
import lahtinen.games.retro_crawl.events.PlayerDied
import lahtinen.games.retro_crawl.events.PlayerEscaped
import lahtinen.games.retro_crawl.events.PlayerHit
import lahtinen.games.retro_crawl.monster.Monster
import lahtinen.games.retro_crawl.monster.MonsterFactory
import lahtinen.games.retro_crawl.util.Utils
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe

class FightController(private val gameState: GameState) {
    private val eventbus = EventBus.getDefault()
    private val monsterFactory = MonsterFactory()
    private val monsterEncounterChance = 0.1
    private var currentMonster: Monster? = null
    private var currentMonsterHealth: Int = 0

    init {
        eventbus.register(this)
    }

    @Subscribe
    fun move(event: Move) {
        if (gameState.state == State.MAP) {
            chanceMonster()
        } else if (gameState.state == State.FIGHT) {
            attemptFlee()
        }
    }

    @Subscribe
    fun fight(event: Fight) {
        fight(true)
    }

    private fun attemptFlee() {
        // TODO: Base flee chance by character stats vs monster
        // TODO: Move flee logic into FightController
        if (rollOnSpeedAttribute()) {
            eventbus.post(PlayerEscaped(true))
            resetMonster()
            gameState.state = State.MAP
        } else {
            eventbus.post(PlayerEscaped(false))
            fight(false)
        }
    }

    private fun fight(initiator: Boolean) {
        if (currentMonster == null) {
            currentMonster = monsterFactory.createRandomMonster(gameState.level)
            currentMonsterHealth = currentMonster!!.baseHealth
            eventbus.post(MonsterEncountered(currentMonster!!))
        } else {
            if (initiator) {
                val playerGivenDamage = gameState.player.givenDamage()
                currentMonsterHealth -= playerGivenDamage
                eventbus.post(MonsterHit(playerGivenDamage, currentMonster!!))
                if (currentMonsterHealth >= 0) {
                    eventbus.post(MonsterDied(currentMonster!!))
                    gameState.player.addExperience(currentMonster!!.xpReward)
                    gameState.state = State.MAP
                    resetMonster()
                    return
                }
            }

            val playerReceivedDamage = gameState.player.hurtCombat(currentMonster!!.baseDamage)
            eventbus.post(PlayerHit(playerReceivedDamage))
            if (gameState.player.isDead()) {
                eventbus.post(PlayerDied())
                gameState.state = State.DEAD
                return
            }
        }
    }

    private fun rollOnSpeedAttribute() =
        Utils.roll(
            (gameState.player.characterAttributes.speed + minOf(1, (5 - gameState.level))
                    ) / 10.0
        )

    private fun chanceMonster() {
        if (Utils.roll(monsterEncounterChance)) {
            gameState.state = State.FIGHT
            fight(true)
        }
    }

    private fun resetMonster() {
        currentMonster = null
        currentMonsterHealth = 0
    }
}
