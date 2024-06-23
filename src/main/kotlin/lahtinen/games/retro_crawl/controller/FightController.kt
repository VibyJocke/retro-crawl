package lahtinen.games.retro_crawl.controller

import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.events.MonsterDied
import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.events.MonsterHit
import lahtinen.games.retro_crawl.events.PlayerDied
import lahtinen.games.retro_crawl.events.PlayerHit
import lahtinen.games.retro_crawl.monster.Monster
import lahtinen.games.retro_crawl.monster.MonsterFactory
import org.greenrobot.eventbus.EventBus

class FightController(private val gameState: GameState) {
    private val eventbus = EventBus.getDefault()
    private val monsterFactory = MonsterFactory()
    private var currentMonster: Monster? = null
    private var currentMonsterHealth: Int = 0

    fun fight(initiator: Boolean) {
        if (currentMonster == null) {
            currentMonster = monsterFactory.createRandomMonster(gameState.level)
            currentMonsterHealth = currentMonster!!.baseHealth
            eventbus.post(MonsterEncountered(currentMonster!!))
        } else {
            if (initiator) {
                val playerGivenDamage = gameState.player.givenDamage()
                currentMonsterHealth = -playerGivenDamage
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

    fun flee() {
        resetMonster()
    }

    private fun resetMonster() {
        currentMonster = null
        currentMonsterHealth = 0
    }
}
