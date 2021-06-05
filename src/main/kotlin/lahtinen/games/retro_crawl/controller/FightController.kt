package lahtinen.games.retro_crawl.controller

import lahtinen.games.retro_crawl.*
import lahtinen.games.retro_crawl.monster.Monster
import lahtinen.games.retro_crawl.monster.MonsterFactory

class FightController(private val gameState: GameState) {
    private val monsterFactory = MonsterFactory()
    private var currentMonster: Monster? = null
    private var currentMonsterHealth: Health? = null

    fun fight() {
        if (currentMonster == null) {
            currentMonster = monsterFactory.createRandomMonster(gameState.level)
            currentMonsterHealth = Health(currentMonster!!.baseHealth)
            ActionLogController.INSTANCE.log("A wild ${currentMonster!!.name} appears!")
        } else {
            ActionLogController.INSTANCE.log("SMACK!")
            val playerGivenDamage = gameState.player.givenDamage()
            currentMonsterHealth!!.drainHealth(playerGivenDamage)
            ActionLogController.INSTANCE.log("You hit for $playerGivenDamage damage.")
            if (currentMonsterHealth!!.dead()) {
                ActionLogController.INSTANCE.log("You killed the ${currentMonster!!.name}!")
                gameState.state = State.MAP
                resetMonster()
                return
            }

            ActionLogController.INSTANCE.log("KAPOW!")
            val playerReceivedDamage = gameState.player.hurtCombat(currentMonster!!.baseDamage)
            ActionLogController.INSTANCE.log("You got hit for $playerReceivedDamage damage.")
            if (gameState.player.isDead()) {
                ActionLogController.INSTANCE.log("You died...")
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
