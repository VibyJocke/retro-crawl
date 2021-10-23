package lahtinen.games.retro_crawl.controller

import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.Health
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.events.MonsterDied
import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.events.MonsterHit
import lahtinen.games.retro_crawl.events.PlayerHit
import lahtinen.games.retro_crawl.monster.Monster
import lahtinen.games.retro_crawl.monster.MonsterFactory
import org.greenrobot.eventbus.EventBus

class FightController(private val gameState: GameState) {
    private val eventbus = EventBus.getDefault()
    private val monsterFactory = MonsterFactory()
    private var currentMonster: Monster? = null
    private var currentMonsterHealth: Health? = null

    fun fight() {
        if (currentMonster == null) {
            currentMonster = monsterFactory.createRandomMonster(gameState.level)
            currentMonsterHealth = Health(currentMonster!!.baseHealth)
            eventbus.post(MonsterEncountered(currentMonster!!))
        } else {
            val playerGivenDamage = gameState.player.givenDamage()
            currentMonsterHealth!!.drainHealth(playerGivenDamage)
            eventbus.post(MonsterHit(playerGivenDamage, currentMonster!!))
            if (currentMonsterHealth!!.dead()) {
                eventbus.post(MonsterDied(currentMonster!!))
                gameState.state = State.MAP
                resetMonster()
                return
            }

            val playerReceivedDamage = gameState.player.hurtCombat(currentMonster!!.baseDamage)
            eventbus.post(PlayerHit(playerGivenDamage))
            if (gameState.player.isDead()) {
                eventbus.post(MonsterDied(currentMonster!!))
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
        currentMonsterHealth = null
    }
}
