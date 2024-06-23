/**
 * TODO:
 * - Implement critical hits/dmg randomization
 * - Implement item drops
 * - Implement inventory management
 * - Start reading monsters from file, and possibly by map - map1monsters.txt e.g. maybe objects too
 * - Implement fully procedurally generated dungeons?
 */
package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.CharacterAttributes
import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.LevelController
import lahtinen.games.retro_crawl.LevelController.Direction
import lahtinen.games.retro_crawl.Player
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.controller.FightController
import lahtinen.games.retro_crawl.events.Fight
import lahtinen.games.retro_crawl.events.MonsterDied
import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.events.Move
import lahtinen.games.retro_crawl.events.PlayerEscaped
import lahtinen.games.retro_crawl.events.StoryExposition
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import java.awt.KeyboardFocusManager
import java.awt.event.KeyEvent
import javax.swing.JFrame
import javax.swing.JPanel

class RetroCrawlFrame : JFrame() {
    private val eventBus = EventBus.getDefault()
    private val mainFrame = MainFrame()
    private val fightPanel = FightPanel()

    init {
        val characterAttributes = CharacterAttributes.newCharacter()
        CharacterDialog(this, characterAttributes).isVisible = true
        val player = Player(characterAttributes)
        val gameState = GameState(player, 1, State.MAP)
        val eventController = FightController(gameState)
        val levelController = LevelController(gameState)
        setupKeyListeners(gameState, levelController)
        printStoryLog()
        pack()
        eventBus.register(this)
    }

    private val moveKeys = mapOf(
        KeyEvent.VK_LEFT to Direction.WEST,
        KeyEvent.VK_RIGHT to Direction.EAST,
        KeyEvent.VK_UP to Direction.NORTH,
        KeyEvent.VK_DOWN to Direction.SOUTH,
    )

    private fun setupKeyListeners(
        gameState: GameState,
        levelController: LevelController
    ) {
        KeyboardFocusManager.getCurrentKeyboardFocusManager()
            .addKeyEventDispatcher { e ->
                var playerMoved = false
                if (e.id == KeyEvent.KEY_PRESSED) {
                    if (gameState.state == State.MAP && moveKeys[e.keyCode] != null) {
                        playerMoved = when (e.keyCode) {
                            KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_UP, KeyEvent.VK_DOWN ->
                                levelController.move(moveKeys[e.keyCode]!!)
                            else -> false
                        }
                    } else if (gameState.state == State.FIGHT) {
                        if (e.keyCode == KeyEvent.VK_SPACE) {
                            eventBus.post(Fight())
                        } else {
                            playerMoved = when (e.keyCode) {
                                KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_UP, KeyEvent.VK_DOWN ->
                                    levelController.canMove(moveKeys[e.keyCode]!!)
                                else -> false
                            }
                        }
                    }
                }
                if (playerMoved) {
                    eventBus.post(Move())
                }
                false
            }
    }

    @Subscribe
    fun onMonsterEncountered(event: MonsterEncountered) = mainFrame.setInteractionView(fightPanel)

    @Subscribe
    fun onMonsterDied(event: MonsterDied) = mainFrame.setInteractionView(JPanel())

    @Subscribe
    fun onPlayerEscaped(event: PlayerEscaped) {
        if (event.successful) mainFrame.setInteractionView(JPanel())
    }

    private fun printStoryLog() {
        eventBus.post(
            StoryExposition(
                """You stand before a great mountain. At the foot of the mountain you see a cave entrance. You carefully approach the cave and enter. 
The air is heavy and damp. The darkness swallows you. You instantly regret that you entered and turn around to leave but all you see is a solid rock wall. It's too late to go back."""
            )
        )
    }
}
